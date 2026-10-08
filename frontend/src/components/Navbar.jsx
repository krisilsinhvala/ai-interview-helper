import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <Link to={user ? "/dashboard" : "/"} className="brand">
        <Brain size={28} />
        <span>PrepMind AI</span>
      </Link>

      <div className="nav-user">
        {user ? (
          <>
            <div className="user-info">
              <div className="name">{user.name}</div>
              <div className="email">{user.email}</div>
            </div>
            <Link to="/profile" className="btn btn-secondary" title="View Profile" style={{ padding: '0.5rem 0.85rem' }}>
              <User size={18} />
            </Link>
            <button onClick={handleLogout} className="btn btn-secondary" title="Logout" style={{ padding: '0.5rem 0.85rem' }}>
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/login" className="btn btn-secondary">Login</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
