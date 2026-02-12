const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// File paths
const usersFile = path.join(__dirname, "users.json");
const itemsFile = path.join(__dirname, "items.json");

// Helpers
const readData = (file) =>
  JSON.parse(fs.readFileSync(file, "utf-8"));

const writeData = (file, data) =>
  fs.writeFileSync(file, JSON.stringify(data, null, 2));

/* =========================
   AUTH ROUTES
========================= */

// SIGNUP
app.post("/signup", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: "All fields required" });
  }

  const users = readData(usersFile);

  const exists = users.find(u => u.username === username);
  if (exists) {
    return res.status(400).json({ msg: "User already exists" });
  }

  users.push({ username, password });
  writeData(usersFile, users);

  res.json({ msg: "Signup successful" });
});

// LOGIN
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const users = readData(usersFile);

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ msg: "Invalid credentials" });
  }

  res.json({ msg: "Login successful" });
});

/* =========================
   CRUD ROUTES
========================= */

// READ
app.get("/items", (req, res) => {
  const items = readData(itemsFile);
  res.json(items);
});

// CREATE
app.post("/items", (req, res) => {
  const { item } = req.body;
  if (!item) return res.status(400).json({ msg: "Item required" });

  const items = readData(itemsFile);
  items.push(item);
  writeData(itemsFile, items);

  res.json({ msg: "Item added" });
});

// UPDATE
app.put("/items/:index", (req, res) => {
  const index = req.params.index;
  const { item } = req.body;

  const items = readData(itemsFile);
  if (!items[index]) {
    return res.status(404).json({ msg: "Item not found" });
  }

  items[index] = item;
  writeData(itemsFile, items);

  res.json({ msg: "Item updated" });
});

// DELETE
app.delete("/items/:index", (req, res) => {
  const index = req.params.index;
  const items = readData(itemsFile);

  if (!items[index]) {
    return res.status(404).json({ msg: "Item not found" });
  }

  items.splice(index, 1);
  writeData(itemsFile, items);

  res.json({ msg: "Item deleted" });
});

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
