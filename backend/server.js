const express = require("express");
const cors = require("cors");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const PDFDocument = require("pdfkit");

const app = express();

/* =======================
   MIDDLEWARE
======================= */
app.use(cors());
app.use(express.json());

/* =======================
   HOME ROUTE (RENDER FIX)
======================= */
app.get("/", (req, res) => {
  res.status(200).send("🚀 AI Meeting Summarizer Backend is Running Successfully");
});

/* =======================
   CONFIG
======================= */
const upload = multer({ storage: multer.memoryStorage() });
const JWT_SECRET = process.env.JWT_SECRET || "secret_key";
const PORT = process.env.PORT || 5000;

/* =======================
   FAKE DB
======================= */
const users = [];

/* seed user */
(async () => {
  const hash = await bcrypt.hash("password123", 10);
  users.push({
    id: "1",
    name: "Test User",
    email: "test@example.com",
    password: hash,
  });
})();

/* =======================
   AUTH MIDDLEWARE
======================= */
function auth(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
}

/* =======================
   REGISTER
======================= */
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const exists = users.find((u) => u.email === email);
  if (exists) {
    return res.status(400).json({ error: "User already exists" });
  }

  const hash = await bcrypt.hash(password, 10);

  users.push({
    id: Date.now().toString(),
    name,
    email,
    password: hash,
  });

  res.json({ message: "Registered successfully" });
});

/* =======================
   LOGIN
======================= */
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(401).json({ error: "Wrong password" });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
});

/* =======================
   SUMMARY FUNCTION
======================= */
function generateSummary(text) {
  const sentences = text.split(".").filter((s) => s.trim().length > 5);

  return {
    title: "AI Meeting Summary",
    summary: sentences.slice(0, 3).join(". "),
    key_points: sentences.slice(0, 5),
    action_items: ["Review meeting notes", "Complete tasks"],
    issues: ["No issues detected"],
    goals: [{ description: "Complete project", status: "In Progress" }],
    language: "English",
    keywords: ["meeting", "summary"],
    topic: "Meeting",
  };
}

/* =======================
   SUMMARIZE API
======================= */
app.post("/summarize", auth, (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text required" });
  }

  const result = generateSummary(text);
  res.json(result);
});

/* =======================
   PDF GENERATION
======================= */
app.post("/generate-pdf", auth, (req, res) => {
  const doc = new PDFDocument();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=meeting.pdf");

  doc.pipe(res);

  doc.fontSize(20).text("AI Meeting Summary", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(req.body.summary || "");

  doc.end();
});

/* =======================
   FILE UPLOAD
======================= */
app.post("/upload-file", auth, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const text = req.file.buffer.toString("utf8");
  const result = generateSummary(text);

  res.json(result);
});

/* =======================
   AUDIO MOCK
======================= */
app.post("/upload-audio", auth, (req, res) => {
  const mockText =
    "Meeting started. Tasks assigned. Deadline next week.";

  res.json(generateSummary(mockText));
});

/* =======================
   START SERVER
======================= */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
}); 