import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { UploadCloud, FileText, FileUp, Mic, Square } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Upload = () => {
  const [tab, setTab] = useState('text'); // 'text', 'file', 'audio'
  const [textInput, setTextInput] = useState('');
  const [file, setFile] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  
  // Speech Recognition state
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        // Append final transcript to existing text, and show interim for fluidity
        setTextInput((prev) => {
          // If we had interim updates before, we simply append.
          // For simplicity in React without complex caret management, we just append final
          return prev + finalTranscript;
        });
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        toast.error('Voice recording error: ' + event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        // If it stopped unintentionally but we are still "recording", restart it?
        // Let's just set it gracefully.
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (!recognitionRef.current) {
        toast.error("Your browser doesn't support speech recognition.");
        return;
      }
      // If language target is specific, could pass to speech API but English is default.
      recognitionRef.current.lang = targetLanguage === 'auto' ? 'en-US' : targetLanguage;
      recognitionRef.current.start();
      setIsRecording(true);
      toast.info("Recording started. Speak into your microphone.");
    }
  };

  const handleSummarize = async () => {
    if ((tab === 'text' || tab === 'audio') && !textInput.trim()) {
      return toast.error('Please enter or record some text');
    }
    if (tab === 'file' && !file) {
      return toast.error('Please select a file');
    }

    setLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      let response;
      if (tab === 'text' || tab === 'audio') {
        response = await axios.post('http://localhost:5000/summarize', { 
          text: textInput,
          targetLanguage 
        }, config);
      } else {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('targetLanguage', targetLanguage);
        response = await axios.post('http://localhost:5000/upload-file', formData, {
          ...config,
          headers: { ...config.headers, 'Content-Type': 'multipart/form-data' }
        });
      }

      toast.success('Summary generated!');
      navigate('/result', { state: { result: response.data } });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Summarization failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '900px', alignSelf: 'center', margin: 'auto' }}>
      <button className="btn btn-secondary" style={{ width: 'auto', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)' }} onClick={() => navigate('/dashboard')}>
        ← Back to Dashboard
      </button>

      <div className="hero-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))' }}>
        <h2 className="title" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>Create New Summary</h2>
        <p className="subtitle" style={{ textAlign: 'left', marginBottom: '2rem' }}>
          Choose how you want to input your meeting data. We support text pasting, audio microphone reading, and raw document uploads.
        </p>

        {/* Input Method Tabs */}
        <div style={{ display: 'flex', gap: '1rem', width: '100%', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${tab === 'text' ? 'btn-primary' : 'btn-secondary'}`} 
            style={{ flex: 1, minWidth: '150px' }}
            onClick={() => setTab('text')}
          >
            <FileText size={18} /> Paste Text
          </button>
          <button 
            className={`btn ${tab === 'audio' ? 'btn-danger' : 'btn-secondary'}`} 
            style={{ flex: 1, minWidth: '150px' }}
            onClick={() => setTab('audio')}
          >
            <Mic size={18} /> Record Audio
          </button>
          <button 
            className={`btn ${tab === 'file' ? 'btn-primary' : 'btn-secondary'}`} 
            style={{ flex: 1, minWidth: '150px' }}
            onClick={() => setTab('file')}
          >
            <FileUp size={18} /> Upload File
          </button>
        </div>

        {/* Main Content Pane */}
        <div className="glass-panel" style={{ width: '100%', padding: '2rem' }}>
          
          {/* Target Language Dropdown */}
          <div className="form-group" style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column' }}>
             <label className="form-label" style={{ fontWeight: '600' }}>Output Language Option</label>
             <select 
               className="form-input" 
               value={targetLanguage} 
               onChange={(e) => setTargetLanguage(e.target.value)}
               style={{ maxWidth: '300px', cursor: 'pointer', background: 'rgba(15,23,42,0.8)' }}
             >
               <option value="en">English (Strictly)</option>
               <option value="hi">Hindi (Strictly)</option>
               <option value="ta">Tamil (Strictly)</option>
             </select>
          </div>

          {(tab === 'text' || tab === 'audio') ? (
            <div className="form-group">
              <label className="form-label">
                {tab === 'audio' ? 'Live Transcript Output' : 'Meeting Transcript Input'}
              </label>
              <textarea 
                className="form-input" 
                placeholder={tab === 'audio' ? "Click 'Start Recording' and your speech will appear here..." : "Paste meeting recording text here..."}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                style={{ 
                  minHeight: '200px', 
                  border: isRecording ? '2px solid var(--danger)' : '1px solid var(--border-color)',
                  transition: 'border 0.3s ease'
                }}
              />
              {tab === 'audio' && (
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                  <button 
                    onClick={toggleRecording} 
                    className={`btn ${isRecording ? 'btn-secondary' : 'btn-danger'}`}
                    style={{ width: '200px', borderRadius: '30px' }}
                  >
                    {isRecording ? <><Square fill="currentColor" size={16}/> Stop Recording</> : <><Mic size={16}/> Start Recording</>}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Upload a document</label>
              <div 
                className="upload-area" 
                onClick={() => document.getElementById('file-upload').click()}
              >
                <UploadCloud size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                <h3>Click to browse or drag and drop</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {file ? <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓ Selected: {file.name}</span> : `Supported formats: PDF, DOCX, TXT`}
                </p>
                <input 
                  id="file-upload" 
                  type="file" 
                  style={{ display: 'none' }}
                  onChange={(e) => setFile(e.target.files[0])}
                  accept=".pdf,.docx,.txt"
                />
              </div>
            </div>
          )}
        </div>

        <button 
          className="btn btn-gradient" 
          style={{ width: '100%', padding: '1rem', marginTop: '2rem', fontSize: '1.1rem', borderRadius: '12px' }} 
          onClick={handleSummarize} 
          disabled={loading || (tab === 'audio' && isRecording)}
        >
          {loading ? (
            <><div className="spinner" style={{ width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}></div> Executing Analysis...</>
          ) : 'Generate AI Report'}
        </button>

      </div>
    </div>
  );
};

export default Upload;
