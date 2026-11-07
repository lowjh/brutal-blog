const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8000;
const DATA_DIR = path.join(__dirname, "data");
const COMMENTS_FILE = path.join(DATA_DIR, "comments.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(COMMENTS_FILE)) fs.writeFileSync(COMMENTS_FILE, "[]");

function readComments() {
  try { return JSON.parse(fs.readFileSync(COMMENTS_FILE, "utf8")); }
  catch { return []; }
}

function writeComments(comments) {
  fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2));
}

app.get("/api/comments", (req, res) => res.json(readComments()));

app.post("/api/comments", (req, res) => {
  const { name, content } = req.body;
  if (!name || !content) return res.status(400).json({ error: "name and content required" });
  const comments = readComments();
  const comment = {
    id: Date.now(),
    name: String(name).slice(0, 50),
    content: String(content).slice(0, 1000),
    createdAt: new Date().toISOString(),
  };
  comments.unshift(comment);
  writeComments(comments);
  res.status(201).json(comment);
});

app.listen(PORT, () => console.log(`Blog running on port ${PORT}`));
