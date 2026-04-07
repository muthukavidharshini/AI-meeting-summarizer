const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
global.DOMMatrix = class DOMMatrix {};
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
const { translate } = require('@vitalets/google-translate-api');
const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_for_meeting_summarizer';
const PORT = process.env.PORT || 5000;
setInterval(() => {}, 1000 * 60 * 60); // Keeps event loop active
const users = []; // In-memory mock database

// Seed default user for testing
(async () => {
  const hash = await bcrypt.hash('password123', 10);
  users.push({ id: '12345', name: 'Test User', email: 'test@example.com', password: hash });
  console.log("Mock database seeded with user: test@example.com / password123");
})();
// Middleware to protect routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: "Access Denied. No token provided." });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token." });
    req.user = user;
    next();
  });
}

// POST /register
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "All fields are required" });

  const existingUser = users.find(u => u.email === email);
  if (existingUser) return res.status(400).json({ error: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: Date.now().toString(), name, email, password: hashedPassword };
  users.push(newUser);

  res.status(201).json({ message: "Registration successful" });
});

// POST /login
app.post('/login', async (req, res) => {
  console.log('Incoming login request:', req.body);
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

  const user = users.find(u => u.email === email);
  console.log('Database user result:', user ? `Found user: ${user.email}` : 'User not found');
  if (!user) return res.status(401).json({ error: "User not found" });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(401).json({ error: "Invalid password" });

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
  res.status(200).json({ message: "Login successful", token, user: { name: user.name, email: user.email } });
});

// Smart Summarization logic
function generateSummary(text) {
  // 0. Ensure utf8 and remove speaker labels (e.g. "Manager:")
  text = Buffer.from(text).toString('utf8');
  let noSpeakersText = text.replace(/^[A-Za-z\s]+:\s*/gm, '');

  // 1. Sanitize text: remove encoding artifacts, keep it clean UTF-8
  let cleanText = noSpeakersText.replace(/[©>“™¹£Û]/g, ' ').replace(/\s+/g, ' ').trim();

  // 2. Split text into sentences
  const rawSentences = cleanText.split(/(?<=[.!?])\s+/).filter(s => s.length > 5);
  const sentences = [...new Set(rawSentences.map(s => s.trim()))];

  // 3. Extract keywords (support unicode words like Tamil/Hindi if they slip through)
  // We use \p{L} to match any language letter if available, or fallback to word boundary
  const words = cleanText.toLowerCase().match(/[\p{L}]{5,}/gu) || cleanText.toLowerCase().match(/\b[a-z]{5,}\b/g) || [];
  const wordCounts = {};
  words.forEach(w => {
    // filter common stop words
    if (!['which', 'there', 'their', 'could', 'would'].includes(w)) {
      wordCounts[w] = (wordCounts[w] || 0) + 1;
    }
  });
  const keywords = Object.keys(wordCounts).sort((a, b) => wordCounts[b] - wordCounts[a]).slice(0, 6);

  const actionKeywords = ["assigned", "todo", "action", "must", "will", "should", "task", "follow up", "schedule", "deadline"];
  const pastKeywords = ["completed", "finished", "success", "decided", "done", "resolved"];
  const issueKeywords = ["issue", "problem", "bug", "error", "blocker", "fail", "difficult", "delay", "stuck"];
  const goalKeywords = ["goal", "target", "aim", "kpi", "objective", "plan to", "achieve", "milestone"];
  
  const actionItems = [];
  const keyPoints = [];
  const issues = [];
  const goals = [];

  // Detect Mixed Language loosely
  const hasHindi = /[\u0900-\u097F]/.test(cleanText);
  const hasTamil = /[\u0B80-\u0BFF]/.test(cleanText);
  const hasEnglish = /[a-zA-Z]/.test(cleanText);

  let language = "Detected: English";
  if (hasHindi && hasTamil && hasEnglish) language = "Detected: Mixed (English + Tamil + Hindi)";
  else if (hasHindi && hasEnglish) language = "Detected: Mixed (English + Hindi)";
  else if (hasTamil && hasEnglish) language = "Detected: Mixed (English + Tamil)";
  else if (hasTamil) language = "Detected: Tamil";
  else if (hasHindi) language = "Detected: Hindi";

  sentences.forEach(sentence => {
    const lower = sentence.toLowerCase();
    
    // Check for issues (exclude action or past successes if possible)
    if (issueKeywords.some(kw => lower.includes(kw))) {
      issues.push(sentence);
    }

    // Check for goals
    if (goalKeywords.some(kw => lower.includes(kw))) {
      const isDone = pastKeywords.some(kw => lower.includes(kw));
      goals.push({
        description: sentence,
        status: isDone ? "Completed" : (lower.includes("not started") ? "Not Started" : "In Progress")
      });
    }

    // Check for action items strictly
    const isPast = pastKeywords.some(kw => lower.includes(kw));
    const isAction = actionKeywords.some(kw => lower.includes(kw));

    if (isAction && !isPast) {
      actionItems.push(sentence);
    }
    // Check for key points: sentences that contain top keywords
    else if ((keywords.some(kw => lower.includes(kw)) || isPast) && sentence.length > 20) {
      keyPoints.push(sentence);
    }
  });

  const uniqueActions = [...new Set(actionItems)].slice(0, 5);
  const uniquePoints = [...new Set(keyPoints)].slice(0, 6);
  const uniqueIssues = [...new Set(issues)].slice(0, 5);
  
  // Provide defaults if missing
  if (uniqueActions.length === 0) uniqueActions.push("No explicit action items identified.");
  if (uniqueIssues.length === 0) uniqueIssues.push("No major issues or blockers detected.");

  // 4. Summary Generation (Combine multiple sentences for a rich paragraph)
  let summarySentences = [];
  if (sentences.length > 0) summarySentences.push(sentences[0]); // Usually intro
  uniquePoints.slice(0, 3).forEach(p => {
    if (!summarySentences.includes(p)) summarySentences.push(p);
  });
  if (sentences.length > 1 && !summarySentences.includes(sentences[sentences.length - 1])) {
    summarySentences.push(sentences[sentences.length - 1]); // Usually conclusion
  }
  
  let summary = summarySentences.join(' ');
  if (!summary || summary.length < 15) summary = "The provided transcript was too short or lacked clear context to generate a deep summary. Please try providing a longer input.";

  const title = "Meeting: " + (keywords.slice(0,2).map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(' & ') || "General Alignment");
  const topic = keywords.length > 0 ? keywords[0].charAt(0).toUpperCase() + keywords[0].slice(1) : "General Update";

  return {
    summary,
    key_points: uniquePoints.length > 0 ? uniquePoints : ["No major key points found."],
    action_items: uniqueActions,
    issues: uniqueIssues,
    goals: goals.length > 0 ? goals.slice(0,5) : [{description: "No specific goals tracked.", status: "Not Started"}],
    language,
    keywords: keywords.length > 0 ? keywords : ["General"],
    topic: topic,
    title: title
  };
}

// POST /summarize
app.post('/summarize', authenticateToken, async (req, res) => {
  const { text, targetLanguage = 'auto' } = req.body;
  if (!text || text.trim() === '') {
    return res.status(400).json({ error: "Text field is required" });
  }

  try {
    let processText = text;
    let sourceLanguage = 'en';

    // 1. Translation / Detection Logic
    // Convert to english first if Hindi/Tamil characters are detected, or if targetLanguage is explicitly set and text is not english.
    const hasHindiOrTamil = /[\u0900-\u097F\u0B80-\u0BFF]/.test(text);
    if (hasHindiOrTamil) {
      try {
        const trans = await translate(text, { to: 'en' });
        sourceLanguage = trans.raw?.src || 'hi/ta'; // Fallback detection
        if (sourceLanguage !== 'en') {
          processText = trans.text;
        }
      } catch (e) {
        console.warn("Translation api detection failed: ", e.message);
      }
    }

    // 2. Generate Summary (English Processed)
    const result = generateSummary(processText);
    
    // Determine the ultimate target language explicitly
    const finalLang = (targetLanguage && targetLanguage !== 'auto') ? targetLanguage : 'en';

    // 3. Post-Process Deep Translation
    if (finalLang !== 'en') {
        try {
            // Translate summary
            if (result.summary) result.summary = (await translate(result.summary, {to: finalLang})).text;
            
            // Translate arrays in parallel
            if (result.action_items && result.action_items.length) {
                const trActions = await Promise.all(result.action_items.map(i => translate(i, {to: finalLang})));
                result.action_items = trActions.map(t => t.text);
            }
            if (result.issues && result.issues.length) {
                const trIssues = await Promise.all(result.issues.map(i => translate(i, {to: finalLang})));
                result.issues = trIssues.map(t => t.text);
            }
            if (result.goals && result.goals.length) {
                const trGoals = await Promise.all(result.goals.map(g => translate(g.description, {to: finalLang})));
                result.goals = result.goals.map((g, idx) => ({ description: trGoals[idx].text, status: g.status }));
            }
            result.language = finalLang === 'hi' ? 'Hindi' : (finalLang === 'ta' ? 'Tamil' : finalLang);
        } catch (e) {
            console.error("Deep translate error", e);
            result.language = 'English (Translation Failed)';
        }
    } else {
       result.language = 'English';
    }

    res.json(result);
  } catch (globalErr) {
    console.error("Global summarize issue", globalErr);
    res.status(500).json({ error: "Summarization globally failed" });
  }
});

// POST /generate-pdf
app.post('/generate-pdf', authenticateToken, (req, res) => {
  const result = req.body;
  if (!result || !result.title) return res.status(400).json({ error: "Result data is required" });

  try {
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Meeting_Report_${Date.now()}.pdf"`);
    
    doc.pipe(res);

    // Formatting PDF
    doc.fontSize(20).font('Helvetica-Bold').text(result.title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).font('Helvetica').text(`Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Language: ${result.language || 'English'}`);
    doc.moveDown();

    doc.fontSize(16).font('Helvetica-Bold').text('Executive Summary');
    doc.fontSize(12).font('Helvetica').text(result.summary);
    doc.moveDown();

    if (result.action_items && result.action_items.length > 0) {
      doc.fontSize(16).font('Helvetica-Bold').text('Action Items');
      doc.fontSize(12).font('Helvetica');
      result.action_items.forEach(item => doc.text(`• ${item}`));
      doc.moveDown();
    }

    if (result.issues && result.issues.length > 0) {
      doc.fontSize(16).font('Helvetica-Bold').text('Issues & Blockers');
      doc.fontSize(12).font('Helvetica');
      result.issues.forEach(issue => doc.text(`• ${issue}`));
      doc.moveDown();
    }
    
    if (result.goals && result.goals.length > 0) {
      doc.fontSize(16).font('Helvetica-Bold').text('Goals');
      doc.fontSize(12).font('Helvetica');
      result.goals.forEach(goal => doc.text(`• [${goal.status}] ${goal.description}`));
      doc.moveDown();
    }

    doc.end();
  } catch (err) {
    console.error("PDF generation failed", err);
    res.status(500).json({ error: "PDF generation failed" });
  }
});

// POST /upload-file -> extract text
app.post('/upload-file', authenticateToken, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    let extractedText = "";
    const targetLanguage = req.body.targetLanguage || 'auto';
    
    if (req.file.mimetype === 'application/pdf') {
      const data = await pdfParse(req.file.buffer);
      extractedText = data.text;
    } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      extractedText = result.value;
    } else if (req.file.mimetype === 'text/plain') {
      extractedText = req.file.buffer.toString('utf8');
    } else {
      return res.status(400).json({ error: "Unsupported file type. Please upload PDF, DOCX, or TXT." });
    }

    if (!extractedText.trim()) return res.status(400).json({ error: "Empty file content" });

    // Re-use logic by calling internal summarize directly for files, or simulate it.
    // For simplicity, we just manually redirect payload logic here or extract the function
    let processText = extractedText;
    let sourceLanguage = 'en';

    const hasHindiOrTamil = /[\u0900-\u097F\u0B80-\u0BFF]/.test(extractedText);
    if (hasHindiOrTamil) {
      try {
        const trans = await translate(extractedText, { to: 'en' });
        sourceLanguage = trans.raw?.src || 'hi/ta';
        if (sourceLanguage !== 'en') processText = trans.text;
      } catch (e) {}
    }

    const summaryResult = generateSummary(processText);
    
    const finalLang = (targetLanguage && targetLanguage !== 'auto') ? targetLanguage : 'en';

    if (finalLang !== 'en') {
        try {
            if (summaryResult.summary) summaryResult.summary = (await translate(summaryResult.summary, {to: finalLang})).text;
            if (summaryResult.action_items && summaryResult.action_items.length) {
                const trActions = await Promise.all(summaryResult.action_items.map(i => translate(i, {to: finalLang})));
                summaryResult.action_items = trActions.map(t => t.text);
            }
            if (summaryResult.issues && summaryResult.issues.length) {
                const trIssues = await Promise.all(summaryResult.issues.map(i => translate(i, {to: finalLang})));
                summaryResult.issues = trIssues.map(t => t.text);
            }
            if (summaryResult.goals && summaryResult.goals.length) {
                const trGoals = await Promise.all(summaryResult.goals.map(g => translate(g.description, {to: finalLang})));
                summaryResult.goals = summaryResult.goals.map((g, idx) => ({ description: trGoals[idx].text, status: g.status }));
            }
            summaryResult.language = finalLang === 'hi' ? 'Hindi' : (finalLang === 'ta' ? 'Tamil' : finalLang);
        } catch (e) {
            console.error("Deep translate upload error", e);
            summaryResult.language = 'English (Translation Failed)';
        }
    } else {
       summaryResult.language = 'English';
    }
    
    summaryResult.transcript = extractedText.length > 500 ? extractedText.substring(0, 500) + "...\n[Transcript Truncated]" : extractedText;
    res.json(summaryResult);
  } catch (err) {
    res.status(500).json({ error: "File parsing error", details: err.message });
  }
});

// POST /upload-audio -> convert speech to text (mocked)
app.post('/upload-audio', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No audio file uploaded" });

  try {
    // Mock Transcription for Demo purposes
    const mockTranscript = "Alright, let's start the meeting. Today we decided to improve our AI product features. The new tasks are assigned to the backend team. The deadline for this sprint is next Friday. We must ensure the API is fully deployed without errors.";

    const summaryResult = generateSummary(mockTranscript);
    summaryResult.transcript = mockTranscript; 
    res.json(summaryResult);
  } catch (err) {
    res.status(500).json({ error: "Audio processing error", details: err.message });
  }
});

// Serve frontend build if deployed
app.use(express.static(path.join(__dirname, '../frontend/frontend-app/build')));

// Catch-all route to serve React app
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/frontend-app/build', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});