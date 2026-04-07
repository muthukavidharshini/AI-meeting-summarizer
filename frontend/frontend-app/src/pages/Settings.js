import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, ArrowLeft, User, Key, Globe, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './DashboardSaaS.css';

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: 'auto', paddingTop: '2rem' }}>
      
      <button className="btn btn-secondary" style={{ width: 'auto', marginBottom: '2rem', background: 'rgba(255,255,255,0.05)' }} onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <h2 className="section-title" style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.8rem' }}>
          <SettingsIcon size={24} color="#a855f7" /> Settings & Profile
        </h2>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>Manage your account preferences, notifications, and language settings.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Profile Settings */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', marginBottom: '1rem', fontSize: '1.1rem' }}>
              <User size={18} color="#6366f1" /> Account Profile
            </h3>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" disabled value={user?.name || "Jane Doe"} />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" disabled value={user?.email || "jane@example.com"} />
            </div>
            <button className="btn btn-primary" style={{ width: 'auto', marginTop: '0.5rem' }}>Update Profile</button>
          </div>

          {/* Preferences */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
             <div>
               <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', marginBottom: '1rem', fontSize: '1.1rem' }}>
                 <Globe size={18} color="#6366f1" /> Default Language
               </h3>
               <select className="form-input" disabled>
                 <option>English</option>
                 <option>Tamil</option>
                 <option>Hindi</option>
               </select>
             </div>
             <div>
               <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', margin: '0 0 1rem 0', fontSize: '1.1rem' }}>
                 <Bell size={18} color="#6366f1" /> Notifications
               </h3>
               <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                 <input type="checkbox" defaultChecked /> Receive email alerts on meeting completion
               </label>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
