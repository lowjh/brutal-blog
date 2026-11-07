const express = require("express");
const session = require("express-session");
const { OAuth2Client } = require("google-auth-library");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const COMMENTS_FILE = path.join(DATA_DIR, "comments.json");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET || "brutal-blog-secret";
const BASE_URL = process.env.BASE_URL || "https://blog.louwh.cyou";

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true, maxAge: 7 * 24 * 60 * 60 * 1000 },
  })
);

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(COMMENTS_FILE)) fs.writeFileSync(COMMENTS_FILE, "[]");

function readComments() {
  try { return JSON.parse(fs.readFileSync(COMMENTS_FILE, "utf8")); }
  catch { return []; }
}

function writeComments(comments) {
  fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2));
}

const oauthClient = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  `${BASE_URL}/auth/google/callback`
);

app.get("/auth/google", (req, res) => {
  if (!GOOGLE_CLIENT_ID) return res.status(500).json({ error: "Google OAuth not configured" });
  res.redirect(oauthClient.generateAuthUrl({ access_type: "online", scope: ["profile", "email"] }));
});

app.get("/auth/google/callback", async (req, res) => {
  try {
    const { tokens } = await oauthClient.getToken(req.query.code);
    const ticket = await oauthClient.verifyIdToken({ idToken: tokens.id_token, audience: GOOGLE_CLIENT_ID });
    const p = ticket.getPayload();
    req.session.user = { name: p.name, email: p.email, picture: p.picture };
  } catch (e) { console.error("OAuth:", e.message); }
  res.redirect("/");
});

app.get("/auth/logout", (req, res) => req.session.destroy(() => res.redirect("/")));
app.get("/api/me", (req, res) => res.json({ user: req.session.user || null }));

app.get("/api/comments", (req, res) => res.json(readComments()));
app.post("/api/comments", (req, res) => {
  const { name, content } = req.body;
  if (!name || !content) return res.status(400).json({ error: "required" });
  const comments = readComments();
  comments.unshift({
    id: Date.now(), name: String(name).slice(0,50), content: String(content).slice(0,1000),
    createdAt: new Date().toISOString(),
    user: req.session.user ? { email: req.session.user.email, picture: req.session.user.picture } : null,
  });
  writeComments(comments);
  res.status(201).json(comments[0]);
});

app.listen(PORT, () => console.log(`Blog on ${PORT}`));
