import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import dns from "dns";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import multer from "multer";
import AdmZip from "adm-zip";
import http from "http";
import { Server } from "socket.io";

// ✅ Code Runner Dependencies (From index.js)
import { randomUUID } from "crypto";
import pool from "./db.js"; // Ensure db.js uses 'export default pool'
import { generateLeetCodeInput } from "./leetcode.js"; // Ensure leetcode.js uses 'export function...'

dns.setDefaultResultOrder("ipv4first");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const WORKSPACE = path.join(__dirname, "workspace");

/* ==================================================================
   1. SERVER SETUP: DB, Socket, Middleware
   ================================================================== */
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for dev
    methods: ["GET", "POST"]
  }
});

// DB connection
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/codeflow";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Security & Parsing
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
  })
);

const upload = multer({ dest: "uploads/" });

// Ensure workspace exists
if (!fs.existsSync(WORKSPACE)) fs.mkdirSync(WORKSPACE, { recursive: true });


/* ==================================================================
   2. ⚡ SAFE PROCESS RUNNER & HELPERS (From index.js)
   ================================================================== */
function run(command, args = [], cwd, input = "") {
  return new Promise((resolve, reject) => {
    const p = spawn(command, args, {
      cwd,
      shell: true,
      stdio: ["pipe", "pipe", "pipe"]
    });

    let out = "";
    let err = "";

    p.stdout.on("data", d => (out += d.toString()));
    p.stderr.on("data", d => (err += d.toString()));

    p.on("close", code => {
      if (code !== 0) reject(err || "Runtime error");
      else resolve(out.trim());
    });

    if (input) {
      p.stdin.write(input.replace(/\r/g, "") + "\n");
    }
    p.stdin.end();
  });
}

function generateFromTemplate(template = "{int}") {
  const vars = {};
  const out = [];

  for (let line of template.split("\n")) {
    line = line.trim();

    if (line === "{n}") {
      const n = Math.floor(Math.random() * 5) + 1;
      vars.n = n;
      out.push(String(n));
    }

    else if (line === "{array:n:int}") {
      const n = vars.n || 3;
      out.push(
        Array.from({ length: n }, () =>
          Math.floor(Math.random() * 100)
        ).join(" ")
      );
    }

    else if (line === "{int}") out.push(String(Math.floor(Math.random() * 100)));
    else if (line === "{double}") out.push((Math.random() * 100).toFixed(2));
    else if (line === "{string}") out.push(Math.random().toString(36).slice(2, 8));
  }

  return out.join("\n");
}

function parseConstraints(text = "") {
  const bounds = {};

  for (let line of text.split("\n")) {
    line = line.replace(/\s+/g, "");

    let m = line.match(/(\d+)≤n≤(\d+)/);
    if (m) bounds.n = { min: +m[1], max: +m[2] };

    m = line.match(/(-?\d+)≤arr\[i\]≤(-?\d+)/);
    if (m) bounds.arr = { min: +m[1], max: +m[2] };

    m = line.match(/(\d+)≤len\(s\)≤(\d+)/);
    if (m) bounds.str = { min: +m[1], max: +m[2] };
  }

  return bounds;
}


/* ==================================================================
   3. 🏃 CODE RUNNER API (Integrated from index.js)
   ================================================================== */
app.post("/api/generate", async (req, res) => {
  const {
    mode = "quick",
    language,
    code,
    count = 3,
    inputTemplate,
    inputFormat,     
    constraints
  } = req.body;

  // 🔒 Validation
  if (mode === "quick" && (!inputTemplate || inputTemplate.trim() === "")) {
    return res.status(400).json({
      error: "Quick mode requires an input template"
    });
  }

  if (mode === "leetcode") {
    if (!inputFormat || inputFormat.trim() === "") {
      return res.status(400).json({
        error: "LeetCode mode requires input format"
      });
    }
  }

  if (!code || code.trim().length < 10) {
    return res.status(400).json({ error: "Invalid code" });
  }

  if (language === "Java" && !code.includes("class Main")) {
    return res.status(400).json({ error: "Java code must contain class Main" });
  }

  // Setup temp directory
  const tempDir = path.join(__dirname, "temp", randomUUID());
  fs.mkdirSync(tempDir, { recursive: true });

  if (language === "Java") fs.writeFileSync(path.join(tempDir, "Main.java"), code);
  if (language === "Python") fs.writeFileSync(path.join(tempDir, "main.py"), code);
  if (language === "C") fs.writeFileSync(path.join(tempDir, "main.c"), code);
  if (language === "CPP") fs.writeFileSync(path.join(tempDir, "main.cpp"), code);

  const testcases = [];

  for (let i = 0; i < count; i++) {
    const input = mode === "leetcode"
      ? generateLeetCodeInput(inputFormat, constraints)
      : generateFromTemplate(inputTemplate);

    let output = "";

    try {
      if (language === "Java") {
        await run("javac", ["Main.java"], tempDir, "");
        output = await run("java", ["Main"], tempDir, input);
      }

      if (language === "Python") {
        output = await run("python", ["main.py"], tempDir, input);
      }

      if (language === "C") {
        await run("gcc", ["main.c", "-o", "main.exe"], tempDir, "");
        output = await run("main.exe", [], tempDir, input);
      }

      if (language === "CPP") {
        await run("g++", ["main.cpp", "-o", "main.exe"], tempDir, "");
        output = await run("main.exe", [], tempDir, input);
      }
    } catch (e) {
      output = "Execution error (check input vs code)";
    }

    try {
      await pool.query(
        "INSERT INTO execution_history(language, input, output) VALUES ($1,$2,$3)",
        [language, input, output]
      );
    } catch {}  

    testcases.push({ input, output });
  }

  // Cleanup (Optional: remove if you want to inspect files)
  // fs.rmSync(tempDir, { recursive: true, force: true });

  res.json({ testcases });
});


/* ==================================================================
   4. FILE SYSTEM UTILITIES
   ================================================================== */
const sanitizePath = (baseDir, userPath) => {
  const normalized = path.normalize(userPath).replace(/^(\.\.(\/|\\|$))+/, "");
  const resolved = path.resolve(baseDir, normalized);
  if (!resolved.startsWith(path.resolve(baseDir))) {
    throw new Error("Invalid file path");
  }
  return resolved;
};

const buildFileTree = (dir, maxDepth = 10, depth = 0) => {
  if (!fs.existsSync(dir) || depth >= maxDepth) return {};
  const out = {};
  const items = fs.readdirSync(dir);
  for (const name of items) {
    if (name.startsWith(".") || name === "node_modules") continue;
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      out[name] = buildFileTree(full, maxDepth, depth + 1);
    } else {
      try {
        out[name] = fs.readFileSync(full, "utf8");
      } catch {
        out[name] = "// binary file";
      }
    }
  }
  return out;
};

const calculateProgress = (files) => {
  let score = 0, total = 0;
  const keywords = ["function", "class", "import", "export", "return", "async", "await", "const", "let"];
  const scan = (obj) => {
    for (const [k, v] of Object.entries(obj || {})) {
      if (typeof v === "string") {
        total++;
        const len = v.length;
        if (len > 0) score += 10;
        if (len > 100) score += 10;
        if (len > 500) score += 10;
        for (const kw of keywords) if (v.includes(kw)) score += 2;
      } else if (typeof v === "object") {
        scan(v);
      }
    }
  };
  scan(files);
  const base = total > 0 ? Math.min((score / (total * 40)) * 100, 95) : 10;
  return Math.max(Math.round(base), 5);
};


/* ==================================================================
   5. PROJECT SCHEMA
   ================================================================== */
const projectSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  description: String,
  type: { type: String, enum: ["react-vite", "node-express", "vue-app", "python-flask", "spring", "custom"], default: "custom" },
  files: { type: Object, default: {} },
  metadata: { springGroupId: String, springArtifactId: String, springDependencies: String },
  progress: { type: Number, default: 0 },
  lastModified: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  fileCount: { type: Number, default: 0 },
  projectPath: String,
});
const Project = mongoose.model("Project", projectSchema);


/* ==================================================================
   6. MOUNT EXTERNAL ROUTES
   ================================================================== */
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import userRoutes from "./routes/user.js";
import { errorHandler } from "./middleware/errorHandler.js";

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/user", userRoutes);


/* ==================================================================
   7. PROJECT CRUD OPERATIONS
   ================================================================== */
app.post("/api/projects", async (req, res) => {
  try {
    const { name, description = "", type = "custom", files = {}, metadata = {} } = req.body;
    if (!name) return res.status(400).json({ error: "Project name required" });

    const id = `proj-${Date.now()}`;
    const projectPath = path.join(WORKSPACE, id);
    fs.mkdirSync(projectPath, { recursive: true });

    const writeFiles = (base, obj) => {
      for (const [p, content] of Object.entries(obj)) {
        const full = path.join(base, p);
        if (typeof content === "string") {
          fs.mkdirSync(path.dirname(full), { recursive: true });
          fs.writeFileSync(full, content, "utf8");
        } else if (typeof content === "object") {
          fs.mkdirSync(full, { recursive: true });
          writeFiles(full, content);
        }
      }
    };
    writeFiles(projectPath, files);

    const proj = new Project({
      id,
      name,
      description,
      type,
      files,
      metadata,
      projectPath,
      fileCount: Object.keys(files).length,
      progress: calculateProgress(files),
    });
    await proj.save();

    res.status(201).json({
      id,
      name,
      description,
      type,
      path: projectPath,
      fileCount: proj.fileCount,
    });
  } catch (err) {
    console.error("Create project error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/projects", async (req, res) => {
  try {
    const projects = await Project.find({}, { files: 0 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/projects/:id", async (req, res) => {
  try {
    const project = await Project.findOne({ id: req.params.id }).lean();
    if (!project) return res.status(404).json({ error: "Project not found" });
    const projectPath = project.projectPath || path.join(WORKSPACE, project.id);
    const tree = buildFileTree(projectPath);
    res.json({ ...project, files: tree });
  } catch (err) {
    console.error("Fetch project error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/projects/:id", async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await Project.findOneAndUpdate({ id: req.params.id }, { name, description, lastModified: new Date() }, { new: true });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/projects/:id", async (req, res) => {
  try {
    const project = await Project.findOne({ id: req.params.id });
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (project.projectPath && fs.existsSync(project.projectPath)) {
      fs.rmSync(project.projectPath, { recursive: true, force: true });
    }
    await Project.deleteOne({ id: req.params.id });
    res.json({ success: true, message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ==================================================================
   8. FILE SYSTEM API
   ================================================================== */
app.get("/api/fs/:projectId/tree", async (req, res) => {
  try {
    const project = await Project.findOne({ id: req.params.projectId });
    if (!project) return res.status(404).json({ error: "Project not found" });
    const tree = buildFileTree(project.projectPath || path.join(WORKSPACE, req.params.projectId));
    res.json(tree);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/fs/:projectId/file", async (req, res) => {
  try {
    const { filePath } = req.query;
    if (!filePath) return res.status(400).json({ error: "Path required" });
    const project = await Project.findOne({ id: req.params.projectId });
    if (!project) return res.status(404).json({ error: "Project not found" });
    const full = sanitizePath(project.projectPath, filePath);
    if (!fs.existsSync(full)) return res.status(404).json({ error: "File not found" });
    const content = fs.readFileSync(full, "utf8");
    res.json({ content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/fs/:projectId/file", async (req, res) => {
  try {
    const { filePath, content } = req.body;
    if (!filePath) return res.status(400).json({ error: "Path required" });
    const project = await Project.findOne({ id: req.params.projectId });
    if (!project) return res.status(404).json({ error: "Project not found" });
    const full = sanitizePath(project.projectPath, filePath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, "utf8");
    await Project.findOneAndUpdate({ id: req.params.projectId }, { lastModified: new Date() });
    res.json({ success: true, message: "File saved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/fs/:projectId/folder", async (req, res) => {
  try {
    const { folderPath } = req.body;
    if (!folderPath) return res.status(400).json({ error: "Path required" });
    const project = await Project.findOne({ id: req.params.projectId });
    if (!project) return res.status(404).json({ error: "Project not found" });
    const full = sanitizePath(project.projectPath, folderPath);
    fs.mkdirSync(full, { recursive: true });
    res.json({ success: true, message: "Folder created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/fs/:projectId/file", async (req, res) => {
  try {
    const { filePath } = req.query;
    if (!filePath) return res.status(400).json({ error: "Path required" });
    const project = await Project.findOne({ id: req.params.projectId });
    if (!project) return res.status(404).json({ error: "Project not found" });
    const full = sanitizePath(project.projectPath, filePath);
    if (fs.existsSync(full)) {
      const stat = fs.lstatSync(full);
      if (stat.isDirectory()) fs.rmSync(full, { recursive: true, force: true });
      else fs.unlinkSync(full);
    }
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ==================================================================
   9. UPLOAD PROJECT ZIP
   ================================================================== */
app.post("/api/projects/:id/upload-zip", upload.single("file"), async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findOne({ id });
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (!req.file) return res.status(400).json({ error: "Missing file" });

    const zip = new AdmZip(req.file.path);
    zip.extractAllTo(project.projectPath, true);
    fs.unlinkSync(req.file.path);

    const files = buildFileTree(project.projectPath);
    const progress = calculateProgress(files);
    await Project.findOneAndUpdate({ id }, { files, progress, lastModified: new Date() });

    res.json({ success: true, message: "Uploaded and extracted", progress });
  } catch (err) {
    console.error("Upload zip error:", err);
    res.status(500).json({ error: err.message });
  }
});


/* ==================================================================
   10. ✅ WEBSOCKET TERMINAL (FIXED - SESSION ISOLATION)
   ================================================================== */
// Maps to store state independently per session key (SocketID + TerminalID)
const activeTerminals = new Map();  // Key: sessionKey -> ChildProcess
const terminalSessions = new Map(); // Key: sessionKey -> String (path)

// Helper: Kill Process Safely
const killProcess = (pid) => {
  if (!pid) return;
  try {
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", pid, "/f", "/t"]);
    } else {
      process.kill(pid, "SIGKILL");
    }
  } catch (e) {
    console.error("Error killing process:", e.message);
  }
};

io.on("connection", (socket) => {
  console.log("Terminal connected:", socket.id);

  socket.on("terminal:write", ({ id, command, projectId }) => {
    // 🔑 THE FIX: Use a combined key (SocketID + TerminalID)
    // This creates a unique session for EVERY terminal tab
    const sessionKey = `${socket.id}-${id}`; 
    const projectRoot = path.join(WORKSPACE, projectId);
    const cmdTrimmed = command.trim();
    
    // 1. Initialize CWD for this specific tab if missing
    if (!terminalSessions.has(sessionKey)) {
      terminalSessions.set(sessionKey, projectRoot);
    }
    
    // Retrieve CWD specifically for this tab
    let currentCWD = terminalSessions.get(sessionKey);

    // Fallback if directory got deleted
    if (!fs.existsSync(currentCWD)) {
        currentCWD = projectRoot;
        terminalSessions.set(sessionKey, currentCWD);
    }

    // 2. Handle 'cls' or 'clear' manually
    if (cmdTrimmed === "cls" || cmdTrimmed === "clear") {
      socket.emit("terminal:data", { id, data: "\r\n--- Terminal Cleared ---\r\n" });
      return; 
    }

    // 3. Handle 'cd' commands isolated to this session
    if (cmdTrimmed.startsWith("cd ")) {
      const targetDir = cmdTrimmed.split(" ")[1];
      if (targetDir) {
        const newPath = path.resolve(currentCWD, targetDir);

        if (fs.existsSync(newPath) && fs.statSync(newPath).isDirectory()) {
          // Update ONLY this session's path (sessionKey)
          terminalSessions.set(sessionKey, newPath);
          socket.emit("terminal:data", { id, data: `\r\n📂 Directory: ${newPath}\r\n` });
        } else {
          socket.emit("terminal:data", { id, data: `\r\n❌ Directory not found: ${targetDir}\r\n` });
        }
        return; 
      }
    }

    // 4. Cleanup previous process for THIS specific tab only
    if (activeTerminals.has(sessionKey)) {
      const oldProc = activeTerminals.get(sessionKey);
      killProcess(oldProc.pid);
      activeTerminals.delete(sessionKey);
    }

    // 5. Spawn new process (Force PowerShell on Windows)
    try {
      const shell = process.platform === "win32" ? "powershell.exe" : "/bin/bash";
      
      const pty = spawn(command, {
        cwd: currentCWD, 
        shell: shell,     
        env: process.env 
      });

      // Track process by sessionKey
      activeTerminals.set(sessionKey, pty);

      pty.stdout.on("data", (data) => {
        socket.emit("terminal:data", { id, data: data.toString() });
      });

      pty.stderr.on("data", (data) => {
        socket.emit("terminal:data", { id, data: data.toString() });
      });

      pty.on("close", (code) => {
        socket.emit("terminal:data", { id, data: `\r\nProcess exited with code ${code}\r\n` });
        if (activeTerminals.get(sessionKey) === pty) {
             activeTerminals.delete(sessionKey);
        }
      });

    } catch (err) {
      socket.emit("terminal:data", { id, data: `\r\nError starting command: ${err.message}\r\n` });
    }
  });

  // ✅ Clean up on disconnect
  socket.on("disconnect", () => {
    console.log("Terminal disconnected:", socket.id);
    
    // Kill processes matching this socket
    for (const [key, proc] of activeTerminals.entries()) {
      if (key.startsWith(socket.id)) {
        killProcess(proc.pid);
        activeTerminals.delete(key);
      }
    }
    // Remove session data matching this socket
    for (const key of terminalSessions.keys()) {
      if (key.startsWith(socket.id)) terminalSessions.delete(key);
    }
  });
});


/* ==================================================================
   11. AI CHAT & OTHER ENDPOINTS
   ================================================================== */
function generateAIResponse(message, context, filePath, language) {
  const lower = (message || "").toLowerCase();
  if (lower.includes("explain")) return `Explanation for ${filePath || "code"}...`;
  if (lower.includes("fix")) return `Fix suggestions for ${filePath || "code"}...`;
  return "AI assistant placeholder response - integrate real LLM.";
}

app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, context, filePath, language } = req.body;
    const reply = generateAIResponse(message, context, filePath, language);
    res.json({ reply });
  } catch (err) {
    console.error("AI chat error:", err);
    res.status(500).json({ reply: "Error processing request." });
  }
});

app.post("/api/ai/fix-errors", async (req, res) => {
  try {
    const { code, filePath, errors } = req.body;
    let fixedCode = code || "";
    let suggestion = "";
    if (errors && errors.some(e => e.message?.includes("semicolon"))) {
      suggestion += "Consider adding semicolons.\n";
      fixedCode = (fixedCode.split("\n").map(line => {
        if (line.trim() && !/[;{}]$/.test(line.trim())) return line + ";";
        return line;
      })).join("\n");
    }
    if (!suggestion) suggestion = "No automated suggestions available.";
    res.json({ suggestion, fixedCode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/projects/:id/progress", async (req, res) => {
  try {
    const project = await Project.findOne({ id: req.params.id }).lean();
    if (!project) return res.status(404).json({ error: "Project not found" });
    const tree = buildFileTree(project.projectPath || path.join(WORKSPACE, project.id));
    const progress = calculateProgress(tree);
    await Project.findOneAndUpdate({ id: req.params.id }, { progress, fileCount: Object.keys(tree).length, lastModified: new Date() });
    res.json({ progress, fileCount: Object.keys(tree).length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    workspace: WORKSPACE,
    mongoConnected: mongoose.connection.readyState === 1,
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

app.use(errorHandler);

/* ==================================================================
   12. STARTUP
   ================================================================== */

server.listen(PORT, () => {
  console.log(`🚀 Unified backend running on http://localhost:${PORT}`);
  console.log(`📁 Workspace: ${WORKSPACE}`);
  console.log(`🗄️ MongoDB: ${MONGO_URI}`);
});

export default app;