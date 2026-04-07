import React from 'react';
import { useNavigate } from 'react-router-dom';
import { History as HistoryIcon, ArrowLeft, CheckCircle, Clock, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './DashboardSaaS.css';

const History = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const historyLogs = [
    { id: 1, title: 'Product Sync & Strategy', date: 'Today, 10:30 AM', status: 'Completed', lang: 'English' },
    { id: 2, title: 'Q3 Marketing Goals', date: 'Yesterday', status: 'Pending', lang: 'Tamil' },
    { id: 3, title: 'Engineering Standup', date: 'Apr 4, 2026', status: 'Completed', lang: 'Hindi' },
    { id: 4, title: 'Client Feedback Review', date: 'Apr 2, 2026', status: 'Completed', lang: 'English' },
  ];

  return (
    <div className="page-container" style={{ maxWidth: '900px', margin: 'auto', paddingTop: '2rem' }}>
      
      <button className="btn btn-secondary" style={{ width: 'auto', marginBottom: '2rem', background: 'rgba(255,255,255,0.05)' }} onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <h2 className="section-title" style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.8rem' }}>
          <HistoryIcon size={24} color="#a855f7" /> Meeting History
        </h2>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>Review and access all your past meeting reports and AI extracted insights.</p>

        <div className="list-container">
          {historyLogs.map((item) => (
            <div key={item.id} className="list-card glass-panel interactive" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="list-card-left" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div className="list-card-icon" style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '1rem', borderRadius: '12px' }}>
                  <FileText size={24} color="#a855f7" />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: 'white' }}>{item.title}</h4>
                  <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <span>{item.date}</span>
                    <span style={{ color: '#6366f1' }}>• Lang: {item.lang}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className={`status-badge ${item.status === 'Completed' ? 'success' : 'pending'}`}>
                  {item.status === 'Completed' ? <CheckCircle size={14}/> : <Clock size={14}/>}
                  {item.status}
                </div>
                {item.status === 'Completed' && (
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                    View Result
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default History;
