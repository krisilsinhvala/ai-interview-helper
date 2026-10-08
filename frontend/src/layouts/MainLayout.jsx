import React from 'react';
import { NavLink } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { LayoutDashboard, FileText, PlaySquare, History, User } from 'lucide-react';

const MainLayout = ({ children, showSidebar = true }) => {
  return (
    <div className="app-container">
      <Navbar />
      <div className="dashboard-layout">
        {showSidebar && <Sidebar />}
        <main className="main-content">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {showSidebar && (
        <nav className="mobile-bottom-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/resume" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
            <FileText size={20} />
            <span>Resume</span>
          </NavLink>
          <NavLink to="/interview/setup" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
            <PlaySquare size={20} />
            <span>Practice</span>
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
            <History size={20} />
            <span>History</span>
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
            <User size={20} />
            <span>Profile</span>
          </NavLink>
        </nav>
      )}

      <Footer />
    </div>
  );
};

export default MainLayout;
