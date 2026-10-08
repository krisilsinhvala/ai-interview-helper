import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="card" style={{ textAlign: 'center', maxWidth: '440px', padding: '3rem 2rem' }}>
          <AlertTriangle size={56} color="#f59e0b" style={{ margin: '0 auto 1.25rem' }} />
          <h1 style={{ fontSize: '3rem', fontFamily: "'Outfit', sans-serif", fontWeight: 800, marginBottom: '0.25rem', color: '#0f172a' }}>
            404
          </h1>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#334155' }}>Page Not Found</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
            The page you are looking for does not exist or has been moved.
          </p>
          <Link to="/dashboard" className="btn btn-primary" style={{ display: 'inline-flex', gap: '0.5rem' }}>
            <ArrowLeft size={18} /> Return to Dashboard
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
