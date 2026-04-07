import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Target, MessageSquare, AlertCircle, CheckCircle, Calendar, FileText, Globe, BrainCircuit } from 'lucide-react';

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;
  const [downloading, setDownloading] = useState(false);

  if (!result) {
    return <Navigate to="/upload" replace />;
  }

  const exportPDF = async () => {
    try {
      setDownloading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(result)
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Meeting_Report_${Date.now()}.pdf`;
        a.click();
      } else {
        alert("Failed to generate PDF");
      }
    } catch (err) {
      console.error("PDF download err", err);
    } finally {
      setDownloading(false);
    }
  };

  const getGoogleCalendarLink = (text) => {
    const title = encodeURIComponent("Meeting Action Item");
    const details = encodeURIComponent(text);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`;
  };

  return (
    <div className="page-container" style={{ maxWidth: '1100px', margin: 'auto' }}>
      
      {/* Header Bar */}
      <div className="glass-panel" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <span className="badge" style={{ background: 'var(--primary)', color: 'white' }}>{result.topic || 'General Synopsis'}</span>
          <span className="badge" style={{ marginLeft: '0.5rem', background: '#3b82f6', color: '#fff' }}>{result.language || 'English'}</span>
          <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '1.6rem' }}>{result.title}</h2>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/upload')}>
            Back
          </button>
          <button className="btn btn-gradient" onClick={exportPDF} disabled={downloading} style={{ display: 'flex', gap: '0.5rem' }}>
            <FileText size={18} /> {downloading ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </div>

      <div className="content-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Executive Summary */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 className="section-title">
              <MessageSquare size={20} /> Executive Summary
            </h3>
            <p style={{ lineHeight: '1.6', fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)' }}>
              {result.summary}
            </p>
          </div>

          {/* Action Items */}
          <div className="glass-panel" style={{ padding: '2rem', borderTop: '4px solid var(--danger)' }}>
            <h3 className="section-title" style={{ color: 'var(--danger)' }}>
              <Target size={20} /> Action Items
            </h3>
            {result.action_items && result.action_items.length > 0 ? (
              <div className="list-container">
                {result.action_items.map((item, idx) => (
                  <div key={idx} className="list-card interactive" style={{ alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.95rem', display: 'block', marginBottom: '0.5rem' }}>{item}</span>
                    </div>
                    <a href={getGoogleCalendarLink(item)} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      <Calendar size={14} /> Calendar
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No explicit action items assigned.</p>
            )}
          </div>

        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Goals and KPIs */}
          <div className="glass-panel" style={{ padding: '2rem', borderTop: '4px solid var(--success)' }}>
            <h3 className="section-title" style={{ color: 'var(--success)' }}>
              <CheckCircle size={20} /> Tracked Goals
            </h3>
            {result.goals && result.goals.length > 0 ? (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {result.goals.map((goal, idx) => (
                    <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className={`status-badge ${goal.status === 'Completed' ? 'success' : 'pending'}`}>
                        {goal.status}
                      </span>
                      <span style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)' }}>{goal.description}</span>
                    </div>
                  ))}
               </div>
            ) : (
              <p className="text-muted">No specific goals tracked in this transcript.</p>
            )}
          </div>

          {/* Issues Array */}
          <div className="glass-panel" style={{ padding: '2rem', borderTop: '4px solid var(--warning)' }}>
            <h3 className="section-title" style={{ color: 'var(--warning)' }}>
              <AlertCircle size={20} /> Highlighted Issues
            </h3>
            {result.issues && result.issues.length > 0 ? (
               <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                 {result.issues.map((issue, idx) => (
                   <li key={idx} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.95rem', background: 'rgba(245, 158, 11, 0.05)', padding: '0.75rem', borderRadius: '8px' }}>
                     <AlertCircle size={18} color="var(--warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
                     {issue}
                   </li>
                 ))}
               </ul>
            ) : (
              <p className="text-muted">No blockers identified.</p>
            )}
          </div>

          {/* Keywords Output Display */}
            <div className="glass-panel" style={{ padding: '2rem', borderTop: '4px solid #a855f7' }}>
              <h3 className="section-title" style={{ color: '#a855f7' }}>
                <Globe size={20} /> Core Keywords
              </h3>
              
              {/* Keywords Tagging */}
              {result.keywords && result.keywords.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {result.keywords.map((kw, idx) => (
                    <span key={idx} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', color: '#e2e8f0', textTransform: 'capitalize' }}>
                      #{kw}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No keywords detected.</p>
              )}
            </div>

        </div>
      </div>
    </div>
  );
};

export default Result;
