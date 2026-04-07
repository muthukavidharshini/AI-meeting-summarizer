import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, PlusCircle, History, Settings, LogOut, 
  Bell, User, Moon, Sun, CheckCircle, Clock, AlertTriangle, 
  TrendingUp, Activity, FileText, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './DashboardSaaS.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);

  // Mock Data
  const recentSummaries = [
    { id: 1, title: 'Product Sync & Strategy', date: 'Today, 10:30 AM', status: 'Completed' },
    { id: 2, title: 'Q3 Marketing Goals', date: 'Yesterday', status: 'Pending' },
    { id: 3, title: 'Engineering Standup', date: 'Apr 4, 2026', status: 'Completed' }
  ];

  const aiInsights = [
    { label: 'Risk Level', value: 'Low', color: 'var(--success)' },
    { label: 'Top Keyword', value: 'Deployment', color: 'var(--primary)' },
    { label: 'Alerts', value: '1 Upcoming Deadline', color: 'var(--warning)' }
  ];

  return (
    <div className={`saas-layout ${darkMode ? 'dark-theme' : 'light-theme'}`}>
      
      {/* SIDEBAR */}
      <aside className="saas-sidebar">
        <div className="sidebar-brand">
          <Zap className="brand-icon" size={28} />
          <span>MeetingAI</span>
        </div>
        <nav className="sidebar-nav">
          <button className="nav-item active" onClick={() => navigate('/dashboard')}>
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button className="nav-item" onClick={() => navigate('/upload')}>
            <PlusCircle size={20} /> New Meeting
          </button>
          <button className="nav-item" onClick={() => navigate('/history')}>
            <History size={20} /> History
          </button>
          <button className="nav-item" onClick={() => navigate('/settings')}>
            <Settings size={20} /> Settings
          </button>
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item text-danger" onClick={logout}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="saas-main">
        
        {/* TOP HEADER */}
        <header className="saas-header">
          <div className="header-search">
            {/* Search or breadcrumbs could go here */}
            <h2 className="header-title">Overview</h2>
          </div>
          <div className="header-actions">
            <button className="icon-btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="icon-btn notification-btn">
              <Bell size={20} />
              <span className="badge-dot"></span>
            </button>
            <div className="user-profile">
              <div className="avatar">
                <User size={20} />
              </div>
              <span className="user-name">{user?.name || 'Jane Doe'}</span>
            </div>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="saas-content">
          
          {/* WELCOME HERO */}
          <div className="hero-card">
            <div className="hero-content">
              <h1>Welcome back, {user?.name || 'Jane'} 👋</h1>
              <p>Here is what's happening with your projects today. You have 2 new action items.</p>
            </div>
            <div className="hero-graphic">
               <Activity size={100} opacity={0.2} />
            </div>
          </div>

          {/* QUICK STATS */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon bg-primary-soft">
                <FileText size={24} color="var(--primary)" />
              </div>
              <div className="stat-details">
                <h3>Total Meetings</h3>
                <p className="stat-num">24</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon bg-success-soft">
                <CheckCircle size={24} color="var(--success)" />
              </div>
              <div className="stat-details">
                <h3>Tasks Completed</h3>
                <p className="stat-num">18</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon bg-warning-soft">
                <Clock size={24} color="var(--warning)" />
              </div>
              <div className="stat-details">
                <h3>Pending Tasks</h3>
                <p className="stat-num">5</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon bg-danger-soft">
                <AlertTriangle size={24} color="var(--danger)" />
              </div>
              <div className="stat-details">
                <h3>Alerts</h3>
                <p className="stat-num">2</p>
              </div>
            </div>
          </div>

          <div className="content-grid">
            {/* LEFT COLUMN */}
            <div className="main-column">
              {/* START NEW MEETING */}
              <div className="action-card glass-panel" onClick={() => navigate('/upload')}>
                <div className="action-content">
                  <div className="glow-icon">
                    <PlusCircle size={32} />
                  </div>
                  <div>
                    <h2>Start a New Summary</h2>
                    <p>Upload a transcript or audio file to generate actionable insights instantly.</p>
                  </div>
                </div>
                <button className="btn btn-gradient">Get Started</button>
              </div>

              {/* RECENT SUMMARIES */}
              <div className="list-section">
                <div className="section-header">
                  <h3>Recent Summaries</h3>
                  <button className="btn-link">View All</button>
                </div>
                <div className="list-container">
                  {recentSummaries.map((item) => (
                    <div key={item.id} className="list-card glass-panel interactive">
                      <div className="list-card-left">
                        <div className="list-card-icon">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h4>{item.title}</h4>
                          <span className="text-muted">{item.date}</span>
                        </div>
                      </div>
                      <div className={`status-badge ${item.status === 'Completed' ? 'success' : 'pending'}`}>
                        {item.status === 'Completed' ? <CheckCircle size={14}/> : <Clock size={14}/>}
                        {item.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="side-column">
              {/* BRAND NEW AI INSIGHTS */}
              <div className="ai-insights-card glass-panel">
                <div className="card-header">
                  <h3><TrendingUp size={18} /> AI Insights</h3>
                </div>
                <div className="insights-content">
                  <p className="insights-desc">Based on your recent 5 meetings, here is a quick sentiment and keyword analysis.</p>
                  
                  <ul className="insights-list">
                    {aiInsights.map((insight, idx) => (
                      <li key={idx}>
                        <span className="insight-label">{insight.label}</span>
                        <span className="insight-value" style={{ color: insight.color }}>{insight.value}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="insight-alert">
                    <AlertTriangle size={16} /> 
                    <span>The term "API Limits" appeared 3 times recently.</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
