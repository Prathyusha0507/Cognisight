import { create } from 'zustand';
import axios from 'axios';
import { shallow } from 'zustand/shallow';
import { API_BASE } from '../utils/api';

// Helper API call function
const apiCall = async (method, endpoint, data = null, params = null) => {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`,
      params,
      data,
    };
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('API Error:', method, endpoint, error.response?.data || error.message);
    throw error;
  }
};

// PROJECT TEMPLATES
const PROJECT_TEMPLATES = {
  'react-vite': {
    'README.md': `# React + Vite Project\nA modern React development setup with Vite.`,
    'package.json': `{
  "name": "react-vite-project",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.3.0"
  }
}`,
    'vite.config.js': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  }
})`,
    'index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React + Vite App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
    'src/main.jsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
    'src/App.jsx': `import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <h1>React + Vite</h1>
      <button onClick={() => setCount((count) => count + 1)}>
        count is {count}
      </button>
    </div>
  )
}

export default App`,
    'src/App.css': `.App { text-align: center; }`,
    'src/index.css': `body { margin: 0; font-family: system-ui; }`,
  },
  'node-express': {
    Backend: {
      'package.json': `{
  "name": "express-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3"
  },
  "devDependencies": {
    "nodemon": "^2.0.20"
  }
}`,
      'server.js': `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to Express API' });
});

app.post('/api/echo', (req, res) => {
  const { message } = req.body;
  res.json({ echo: message });
});

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});`,
      '.env': `PORT=3000
NODE_ENV=development`,
      '.gitignore': `node_modules
.env
.env.local
*.log
dist
.DS_Store`,
      'README.md': `# Express Server

A Node.js and Express backend server.

## Getting Started

1. \`npm install\` - Install dependencies
2. \`npm run dev\` - Start dev server with nodemon
3. \`npm start\` - Start production server

## API Endpoints

- \`GET /api/health\` - Health check
- \`GET /api\` - Welcome message
- \`POST /api/echo\` - Echo back your message

## Project Structure

\`\`\`
├── server.js     - Main server file
├── .env         - Environment variables
└── package.json - Dependencies
\`\`\``,
      'routes/.gitkeep': '',
      'middleware/.gitkeep': '',
      'controllers/.gitkeep': '',
    }
  },
  'custom': { 'README.md': `# Custom Project\nStart building your project!` },
};

// ✅ HELPER: Convert flat paths to nested object tree
const buildFileTree = (flatFiles) => {
  const root = {};
  if (!flatFiles) return root;

  for (const [path, content] of Object.entries(flatFiles)) {
    const parts = path.split('/').filter(Boolean);
    let current = root;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    
    current[parts[parts.length - 1]] = content;
  }
  return root;
};

// Helper to find file content in nested structure
const findFileContent = (files, path) => {
  if (!files || !path) return null;
  const parts = path.split('/').filter(p => p);
  let current = files;
  
  for (const part of parts) {
    if (!current || typeof current !== 'object') return null;
    current = current[part];
  }
  
  return typeof current === 'string' ? current : null;
};

// Deep clone helper
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(deepClone);
  const cloned = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
};

// Calculate progress
const calculateProjectProgress = (files) => {
  let score = 0;
  let totalFiles = 0;
  const codeKeywords = ['function', 'class', 'const', 'import', 'export', 'return', 'async', 'await'];

  const analyzeContent = (content) => {
    totalFiles++;
    let fileScore = 0;
    if (content?.length > 0) fileScore += 10;
    if (content?.length > 100) fileScore += 15;
    const keywordCount = codeKeywords.filter((kw) => content?.includes(kw)).length;
    fileScore += keywordCount * 2;
    return fileScore;
  };

  const scanFiles = (fileObj) => {
    for (const [key, value] of Object.entries(fileObj)) {
      if (typeof value === 'string') {
        score += analyzeContent(value);
      } else if (typeof value === 'object' && value !== null) {
        scanFiles(value);
      }
    }
  };

  if (files) scanFiles(files);
  const baseProgress = totalFiles > 0 ? Math.min((score / totalFiles) * 50, 95) : 10;
  return Math.max(Math.round(baseProgress), 5);
};

export const useIDEStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  openFiles: [],
  activeFile: null,
  terminals: [],
  activeTerminal: null,
  aiMessages: [],
  isDarkMode: true,
  progress: 0,

  // ===== PROJECT ACTIONS =====
  
  fetchProjects: async () => {
    try {
      const data = await apiCall('GET', '/projects');
      set({ projects: data });
      return data;
    } catch (error) {
      console.error('Fetch projects error:', error);
      return [];
    }
  },

  fetchProjectById: async (projectId) => {
    try {
      const data = await apiCall('GET', `/projects/${projectId}`);
      return data;
    } catch (error) {
      console.error('Fetch project by id error:', error);
      return null;
    }
  },

  createProject: async (name, description, type = 'custom', templateFiles) => {
    try {
      let rawFiles = {};
      if (templateFiles && Object.keys(templateFiles).length > 0) {
        rawFiles = templateFiles;
      } else {
        rawFiles = PROJECT_TEMPLATES[type] || PROJECT_TEMPLATES['custom'];
      }

      const structuredFiles = buildFileTree(rawFiles);

      // ✅ FIX: Send project to backend and wait for the DB ID
      const backendResponse = await apiCall('POST', '/projects', { 
          name, 
          description, 
          type, 
          files: structuredFiles 
      });

      // ✅ FIX: Use the ID returned by the backend
      const project = {
        id: backendResponse.id, 
        name: backendResponse.name,
        description: backendResponse.description,
        type: backendResponse.type,
        files: structuredFiles, 
        progress: calculateProjectProgress(structuredFiles),
        createdAt: new Date(),
      };

      set((state) => ({
        projects: [...state.projects, project],
        currentProject: project,
        progress: project.progress,
        openFiles: [],
        activeFile: null,
      }));

      // ✅ FIX: Save the Backend ID to localStorage
      localStorage.setItem('currentProjectId', project.id);
      return project;
    } catch (error) {
      console.error('Create project error:', error);
      throw error;
    }
  },

  setCurrentProject: (project) => {
    if (project) {
      localStorage.setItem('currentProjectId', project.id);
    } else {
      localStorage.removeItem('currentProjectId');
    }

    set({
      currentProject: project,
      openFiles: [],
      activeFile: null,
      progress: project ? calculateProjectProgress(project.files) : 0,
    });
  },

  restoreCurrentProject: async () => {
    try {
      const lastProjectId = localStorage.getItem('currentProjectId');
      if (!lastProjectId) return null;
      
      // ✅ FIX: Try finding in local state first
      let project = get().projects.find(p => p.id === lastProjectId);
      
      // ✅ FIX: If not found (e.g., hard reload), fetch from Backend directly
      if (!project) {
        project = await get().fetchProjectById(lastProjectId);
      }
      
      if (project) {
        set({ currentProject: project, progress: calculateProjectProgress(project.files) });
      }
      return project;
    } catch (error) {
      console.error('Restore project error:', error);
      return null;
    }
  },

  deleteProject: async (projectId) => {
    try {
      // ✅ FIX: Uncommented API call
      await apiCall('DELETE', `/projects/${projectId}`);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== projectId),
        currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
      }));
      if (localStorage.getItem('currentProjectId') === projectId) {
        localStorage.removeItem('currentProjectId');
      }
      return true;
    } catch (error) {
      console.error('Delete project error:', error);
      return false;
    }
  },

  updateProgress: async () => {
    try {
      const state = get();
      if (!state.currentProject) return;
      const newProgress = calculateProjectProgress(state.currentProject.files);
      set({ progress: newProgress });
      return newProgress;
    } catch (error) {
      console.error('Update progress error:', error);
    }
  },

  // ===== FILE ACTIONS =====
  openFile: (filePath) => {
    const state = get();
    if (!state.currentProject) return;

    const existing = state.openFiles.find(f => f.path === filePath);
    if (existing) {
      set({ activeFile: existing });
      return;
    }

    const content = findFileContent(state.currentProject.files, filePath);
    
    if (content !== null && content !== undefined) {
      const newFile = { path: filePath, content, unsaved: false };
      set({
        openFiles: [...state.openFiles, newFile],
        activeFile: newFile
      });
    } else {
        console.warn("Could not open file: content not found for path", filePath);
    }
  },

  closeFile: (filePath) => {
    set((state) => {
      const updatedFiles = state.openFiles.filter((f) => f.path !== filePath);
      const newActiveFile =
        state.activeFile?.path === filePath ? updatedFiles[updatedFiles.length - 1] || null : state.activeFile;
      return { openFiles: updatedFiles, activeFile: newActiveFile };
    });
  },

  setActiveFile: (file) => set({ activeFile: file }),

  updateFileContent: (filePath, content) => {
    set((state) => ({
      openFiles: state.openFiles.map((f) =>
        f.path === filePath ? { ...f, content, unsaved: true } : f
      ),
      activeFile: state.activeFile?.path === filePath ? { ...state.activeFile, content, unsaved: true } : state.activeFile,
    }));
  },

  saveFile: async (filePath, content) => {
    const state = get();
    if (!state.currentProject) return;

    try {
      // ✅ FIX: Uncommented API call to persist save
      await apiCall('PUT', `/fs/${state.currentProject.id}/file`, { filePath, content });
      
      const updatedFiles = deepClone(state.currentProject.files || {});
      const parts = filePath.split('/').filter(Boolean);
      let current = updatedFiles;

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) current[part] = {};
        current = current[part];
      }
      current[parts[parts.length - 1]] = content;

      const updatedProject = { ...state.currentProject, files: updatedFiles };

      set((state) => ({
        currentProject: updatedProject,
        projects: state.projects.map(p => p.id === state.currentProject.id ? updatedProject : p),
        openFiles: state.openFiles.map((f) =>
          f.path === filePath ? { ...f, content, unsaved: false } : f
        ),
        activeFile: state.activeFile?.path === filePath ? { ...state.activeFile, content, unsaved: false } : state.activeFile,
      }));
      get().updateProgress();
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  },

  createFile: async (filePath, content) => {
    await get().saveFile(filePath, content);
  },

  createFolder: async (folderPath) => {
    const state = get();
    if (!state.currentProject) return false;

    try {
      // ✅ FIX: Uncommented API call
      await apiCall('POST', `/fs/${state.currentProject.id}/folder`, { folderPath });
      
      const updatedFiles = deepClone(state.currentProject.files || {});
      const parts = folderPath.split('/').filter(Boolean);
      let current = updatedFiles;

      for (const part of parts) {
        if (!current[part]) current[part] = {};
        current = current[part];
      }

      const updatedProject = { ...state.currentProject, files: updatedFiles };

      set((state) => ({
        currentProject: updatedProject,
        projects: state.projects.map(p => p.id === state.currentProject.id ? updatedProject : p),
      }));

      return true;
    } catch (error) {
      console.error('Error creating folder:', error);
      return false;
    }
  },

  deleteFile: async (filePath) => {
    const state = get();
    if (!state.currentProject) return false;

    try {
      // ✅ FIX: Pass filePath in params (server expects req.query)
      await apiCall('DELETE', `/fs/${state.currentProject.id}/file`, null, { filePath });

      const updatedFiles = deepClone(state.currentProject.files || {});
      const parts = filePath.split('/').filter(Boolean);
      let current = updatedFiles;
      
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
        if (!current) break;
      }
      
      if (current && parts.length > 0) {
        delete current[parts[parts.length - 1]];
      }

      const updatedProject = { ...state.currentProject, files: updatedFiles };

      set((state) => ({
        openFiles: state.openFiles.filter((f) => f.path !== filePath),
        activeFile: state.activeFile?.path === filePath ? null : state.activeFile,
        currentProject: updatedProject,
        projects: state.projects.map(p => p.id === state.currentProject.id ? updatedProject : p),
      }));
      
      get().updateProgress();
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  },

  deleteFolder: async (folderPath) => {
    const state = get();
    if (!state.currentProject) return false;

    try {
      // ✅ FIX: Use /file endpoint with folderPath in params, as server handles directories on the same route
      await apiCall('DELETE', `/fs/${state.currentProject.id}/file`, null, { filePath: folderPath });
      
      const updatedFiles = deepClone(state.currentProject.files || {});
      const parts = folderPath.split('/').filter(Boolean);
      let curr = updatedFiles;
      
      if (parts.length === 1) {
          delete updatedFiles[parts[0]];
      } else {
          for (let i = 0; i < parts.length - 1; i++) {
            curr = curr?.[parts[i]];
            if (!curr) break;
          }
          if (curr) {
            delete curr[parts[parts.length - 1]];
          }
      }

      const updatedProject = { ...state.currentProject, files: updatedFiles };

      set((state) => ({
        currentProject: updatedProject,
        projects: state.projects.map(p => p.id === state.currentProject.id ? updatedProject : p),
      }));
      
      get().updateProgress();
      return true;
    } catch (error) {
      console.error('Error deleting folder:', error);
      return false;
    }
  },

  // ===== TERMINAL ACTIONS =====
  createTerminal: () => {
    const terminal = {
      id: `term-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      output: [],
      history: [],
    };
    set((state) => ({
      terminals: [...state.terminals, terminal],
      activeTerminal: terminal,
    }));
  },

  setActiveTerminal: (terminal) => set({ activeTerminal: terminal }),

  closeTerminal: (terminalId) => {
    set((state) => {
      const updatedTerminals = state.terminals.filter((t) => t.id !== terminalId);
      const newActiveTerminal =
        state.activeTerminal?.id === terminalId
          ? updatedTerminals[updatedTerminals.length - 1] || null
          : state.activeTerminal;
      return { terminals: updatedTerminals, activeTerminal: newActiveTerminal };
    });
  },

  addTerminalOutput: (terminalId, text, type = 'stdout') =>
    set((state) => {
      const newOutputLine = { text, type, timestamp: Date.now() };
      return {
        terminals: state.terminals.map((t) =>
          t.id === terminalId ? { ...t, output: [...t.output, newOutputLine] } : t
        ),
        activeTerminal:
          state.activeTerminal?.id === terminalId
            ? { ...state.activeTerminal, output: [...state.activeTerminal.output, newOutputLine] }
            : state.activeTerminal,
      };
    }),

  clearTerminal: (terminalId) =>
    set((state) => ({
      terminals: state.terminals.map((t) =>
        t.id === terminalId ? { ...t, output: [] } : t
      ),
      activeTerminal:
        state.activeTerminal?.id === terminalId
          ? { ...state.activeTerminal, output: [] }
          : state.activeTerminal,
    })),

  addAIMessage: (message) => set((state) => ({ aiMessages: [...state.aiMessages, message] })),
  clearAIMessages: () => set({ aiMessages: [] }),
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}));