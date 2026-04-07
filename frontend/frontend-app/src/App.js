import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Result from './pages/Result';
import History from './pages/History';
import Settings from './pages/Settings';

import { LogOut, Mic } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <Mic size={24} color="var(--primary)" />
        <span style={{ fontWeight: 700 }}>MeetingAI</span>
      </Link>
      {user && (
        <button className="btn btn-secondary" style={{ width: 'auto', padding: '0.5rem 1rem' }} onClick={logout}>
          <LogOut size={16} /> Logout
        </button>
      )}
    </nav>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
              <Route path="/result" element={<ProtectedRoute><Result /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

              {/* Default Redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
          
          <ToastContainer 
            position="bottom-right" 
            theme="dark" 
            autoClose={3000} 
            toastStyle={{ backgroundColor: 'var(--card-bg)', backdropFilter: 'blur(10px)', border: '1px solid var(--border-color)', color: 'white' }} 
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
