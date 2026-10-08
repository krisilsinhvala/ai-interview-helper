import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, PlaySquare, History, User, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
        <LayoutDashboard size={19} />
        <span className="link-text">Dashboard</span>
      </NavLink>

      <NavLink to="/resume" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
        <FileText size={19} />
        <span className="link-text">Resume Upload</span>
      </NavLink>

      <NavLink to="/interview/setup" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
        <PlaySquare size={19} />
        <span className="link-text">Practice Interview</span>
      </NavLink>

      <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
        <History size={19} />
        <span className="link-text">Interview History</span>
      </NavLink>

      <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
        <User size={19} />
        <span className="link-text">Profile</span>
      </NavLink>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
        <button onClick={handleLogout} className="nav-link" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <LogOut size={19} />
          <span className="link-text">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
