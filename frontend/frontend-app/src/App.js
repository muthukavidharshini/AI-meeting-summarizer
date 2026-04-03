import React, { useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import './App.css';

function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    if (!text.trim()) {
      setError("Please enter some text to summarize");
      return;
    }
    setError("");
    setResult(null);
    setLoading(true);
    
    try {
      const res = await axios.post("/summarize", { text });
      setResult(res.data);
    } catch (err) {
      setError("Backend not running or an error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await axios.post("/upload-file", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResult(res.data);
    } catch (err) {
      setError("Error processing file.");
    } finally {
      setLoading(false);
    }
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await axios.post("/upload-audio", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResult(res.data);
    } catch (err) {
      setError("Error processing audio.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text(result.title || "Meeting Summary", 10, 20);
    
    doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(result.summary || "", 180);
    doc.text(summaryLines, 10, 30);
    
    let y = 30 + (summaryLines.length * 7) + 10;
    
    if (result.key_points && result.key_points.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Key Points:", 10, y);
      y += 10;
      doc.setFont("helvetica", "normal");
      result.key_points.forEach(pt => {
        const lines = doc.splitTextToSize(`• ${pt}`, 180);
        doc.text(lines, 10, y);
        y += (lines.length * 7);
      });
      y += 10;
    }

    if (result.action_items && result.action_items.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Action Items:", 10, y);
      y += 10;
      doc.setFont("helvetica", "normal");
      result.action_items.forEach(pt => {
        const lines = doc.splitTextToSize(`• ${pt}`, 180);
        doc.text(lines, 10, y);
        y += (lines.length * 7);
      });
    }

    doc.save("Meeting_Summary.pdf");
  };

  const copyToClipboard = () => {
    if (!result) return;
    let textToCopy = `Title: ${result.title}\n\nSummary:\n${result.summary}\n\n`;
    if (result.key_points && result.key_points.length > 0) {
      textToCopy += `Key Points:\n` + result.key_points.map(k => `- ${k}`).join('\n') + `\n\n`;
    }
    if (result.action_items && result.action_items.length > 0) {
      textToCopy += `Action Items:\n` + result.action_items.map(a => `- ${a}`).join('\n') + `\n\n`;
    }
    navigator.clipboard.writeText(textToCopy);
    alert("Copied to clipboard!");
  };

  return (
    <div>
      <div className="glass-container fade-in">
        <h1>AI Meeting Summarizer</h1>
        <p style={{ textAlign: "center", marginBottom: "40px", fontSize: "1.1rem" }}>
          Upload a document, an audio file, or paste text directly to generate smart insights.
        </p>

        <div className="upload-group">
          <div className="upload-box">
            <span className="upload-label">📄 Upload Document</span>
            <span style={{ fontSize: "0.85rem", color: "#9ba4b5" }}>.txt, .pdf, .docx</span>
            <input type="file" accept=".txt,.pdf,.docx" onChange={handleFileUpload} />
          </div>
          <div className="upload-box">
            <span className="upload-label" style={{ color: "#ff8a00" }}>🎤 Upload Audio</span>
            <span style={{ fontSize: "0.85rem", color: "#9ba4b5" }}>.mp3, .wav</span>
            <input type="file" accept=".mp3,.wav" onChange={handleAudioUpload} />
          </div>
        </div>

        <textarea 
          rows="6" 
          value={text} 
          onChange={(e) => setText(e.target.value)}
          placeholder="✍️ Or paste your meeting transcript or notes here..."
        />

        <div style={{ textAlign: "center" }}>
          <button onClick={handleSummarize} disabled={loading} className="gen-btn">
            {loading ? <span className="spinner"></span> : "🤖 Generate Analysis"}
          </button>
        </div>

        {error && <p style={{ color: "#ff4d4f", textAlign: "center", marginTop: "20px", fontWeight: "bold" }}>⚠️ {error}</p>}

        {result && (
          <div className="fade-in" style={{ marginTop: "40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", marginBottom: "30px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
                <h2 style={{ margin: 0, color: "#fff" }}>{result.title}</h2>
                {result.topic && (
                  <span style={{ backgroundColor: "rgba(0,242,254,0.2)", color: "#00f2fe", padding: "5px 15px", borderRadius: "20px", fontSize: "14px", fontWeight: "600" }}>
                    🎯 {result.topic}
                  </span>
                )}
              </div>
              <div style={{ marginTop: "15px" }}>
                <button onClick={downloadPDF} className="action-btn">📥 Download PDF</button>
                <button onClick={copyToClipboard} className="action-btn">📋 Copy Text</button>
              </div>
            </div>

            <div className="glass-card">
              <h3>📄 Summary</h3>
              <p>{result.summary}</p>
            </div>

            {(result.key_points && result.key_points.length > 0) && (
              <div className="glass-card">
                <h3>📊 Key Points</h3>
                <ul className="key-point-list">
                  {result.key_points.map((pt, i) => <li key={i}>{pt}</li>)}
                </ul>
              </div>
            )}

            {(result.action_items && result.action_items.length > 0) && (
              <div className="glass-card" style={{ borderLeft: "4px solid #ff9a9e" }}>
                <h3>🚀 Action Items</h3>
                <ul className="action-item-list">
                  {result.action_items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            )}

            {(result.keywords && result.keywords.length > 0) && (
              <div className="glass-card">
                <h3>🔑 Keywords</h3>
                <div style={{ marginTop: "15px" }}>
                  {result.keywords.map((kw, i) => (
                    <span key={i} className="chip">{kw}</span>
                  ))}
                </div>
              </div>
            )}

            {result.transcript && (
              <div className="glass-card">
                <h3>🎤 Transcript Snippet</h3>
                <div className="transcript-box">
                  {result.transcript}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
