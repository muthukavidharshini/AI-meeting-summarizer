const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
global.DOMMatrix = class DOMMatrix {};
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// Smart Summarization logic
function generateSummary(text) {
  // 1. Split text into sentences and sanitize
  const rawSentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const sentences = [...new Set(rawSentences.map(s => s.trim()).filter(s => s.length > 0))];

  // 2. Extract keywords based on frequency of words > 5 chars
  const words = text.toLowerCase().match(/\b[a-z]{5,}\b/g) || [];
  const wordCounts = {};
  words.forEach(w => wordCounts[w] = (wordCounts[w] || 0) + 1);
  const keywords = Object.keys(wordCounts).sort((a, b) => wordCounts[b] - wordCounts[a]).slice(0, 5);

  const actionKeywords = ["decided", "assigned", "deadline", "completed", "todo", "action", "need", "must", "will", "should"];
  
  const actionItems = [];
  const keyPoints = [];

  sentences.forEach(sentence => {
    const lower = sentence.toLowerCase();
    
    // Check for action items
    if (actionKeywords.some(kw => lower.includes(kw))) {
      actionItems.push(sentence);
    }
    // Check for key points
    else if (keywords.some(kw => lower.includes(kw)) && sentence.length > 30) {
      keyPoints.push(sentence);
    }
  });

  const uniqueActions = [...new Set(actionItems)].slice(0, 5);
  const uniquePoints = [...new Set(keyPoints)].slice(0, 5);

  // 3. Summary
  let summarySentences = [];
  if (sentences.length > 0) summarySentences.push(sentences[0]);
  if (uniquePoints.length > 0 && uniquePoints[0] !== sentences[0]) {
    summarySentences.push(uniquePoints[0]);
  }
  
  const summary = summarySentences.join(' ') || "The meeting discussed various operational topics.";
  const title = "Meeting Title: " + (keywords.slice(0,2).map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(' and ') || "General Alignment");
  const topic = keywords.length > 0 ? keywords[0].charAt(0).toUpperCase() + keywords[0].slice(1) : "General Update";

  return {
    summary,
    key_points: uniquePoints,
    action_items: uniqueActions,
    keywords,
    topic,
    title
  };
}

// POST /summarize
app.post('/summarize', (req, res) => {
  const { text } = req.body;
  if (!text || text.trim() === '') {
    return res.status(400).json({ error: "Text field is required" });
  }

  const result = generateSummary(text);
  res.json(result);
});

// POST /upload-file -> extract text
app.post('/upload-file', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    let extractedText = "";
    
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

    const summaryResult = generateSummary(extractedText);
    summaryResult.transcript = extractedText.length > 500 ? extractedText.substring(0, 500) + "...\n[Transcript Truncated]" : extractedText;
    res.json(summaryResult);
  } catch (err) {
    res.status(500).json({ error: "File parsing error", details: err.message });
  }
});

// POST /upload-audio -> convert speech to text (mocked)
app.post('/upload-audio', upload.single('file'), (req, res) => {
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