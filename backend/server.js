const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
global.DOMMatrix = class DOMMatrix { };
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
const { translate } = require('@vitalets/google-translate-api');

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   🚀 FIX 1: HOME ROUTE
   ========================= */
app.get("/", (req, res) => {
  res.send("🚀 AI Meeting Summarizer Backend is Running Successfully!");
});

const upload = multer({ storage: multer.memoryStorage() });

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_for_meeting_summarizer';
const PORT = process.env.PORT || 5000;

setInterval(() => { }, 1000 * 60 * 60);

// In-memory users
const users = [];

// Seed user
(async () => {
  const hash = await bcrypt.hash('password123', 10);
  users.push({
    id: '12345',
    name: 'Test User',
    email: 'test@example.com',
    password: hash
  });
})();

/* =========================
   AUTH MIDDLEWARE
   ========================= */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Access Denied. No token provided." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

/* =========================
   REGISTER
   ========================= */
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  const exists = users.find(u => u.email === email);
  if (exists) return res.status(400).json({ error: "User exists" });

  const hashed = await bcrypt.hash(password, 10);

  users.push({
    id: Date.now().toString(),
    name,
    email,
    password: hashed
  });

  res.json({ message: "Registered successfully" });
});

/* =========================
   LOGIN
   ========================= */
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Wrong password" });

  const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token });
});

/* =========================
   SUMMARY FUNCTION
   ========================= */
function generateSummary(text) {
  const sentences = text.split('.').filter(s => s.trim().length > 5);

  return {
    summary: sentences.slice(0, 3).join('. '),
    key_points: sentences.slice(0, 5),
    action_items: ["Review meeting notes", "Complete assigned tasks"],
    issues: ["No issues detected"],
    goals: [{ description: "Complete project", status: "In Progress" }],
    language: "English",
    keywords: ["meeting", "summary"],
    topic: "Meeting",
    title: "AI Meeting Summary"
  };
}

/* =========================
   SUMMARIZE
   ========================= */
app.post('/summarize', authenticateToken, async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text required" });
  }

  const result = generateSummary(text);
  res.json(result);
});

/* =========================
   PDF GENERATION
   ========================= */
app.post('/generate-pdf', authenticateToken, (req, res) => {
  const result = req.body;

  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=meeting.pdf');

  doc.pipe(res);

  doc.fontSize(20).text(result.title || "Meeting Report", { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(result.summary || "");

  doc.end();
});

/* =========================
   FILE UPLOAD
   ========================= */
app.post('/upload-file', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });

  const text = req.file.buffer.toString('utf8');

  const result = generateSummary(text);

  res.json(result);
});

/* =========================
   AUDIO UPLOAD (MOCK)
   ========================= */
app.post('/upload-audio', authenticateToken, (req, res) => {
  const mockText = "Meeting started. Tasks assigned. Deadline next week.";

  const result = generateSummary(mockText);

  res.json(result);
});

/* =========================
   🚀 FIX 2: FRONTEND SERVE (CORRECT)
   ========================= */
const buildPath = path.join(__dirname, '../frontend/build');

app.use(express.static(buildPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

/* =========================
   START SERVER
   ========================= */
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});