import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Brain,
  FileText,
  BarChart3,
  History,
  Download,
  Check,
  ShieldCheck,
  Zap,
  Target
} from 'lucide-react';

const Landing = () => {
  return (
    <div className="landing-container">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} /> Powered by Advanced Gemini AI
          </div>

          <h1 className="hero-title">
            Prepare Smarter.<br />
            <span className="text-gradient">Interview Better.</span>
          </h1>

          <p className="hero-subtitle">
            Practice personalized interview questions generated from your resume and get instant AI feedback.
          </p>

          <div className="hero-cta-group">
            <Link to="/register" className="btn btn-primary btn-lg">
              Start Practicing Free <ArrowRight size={18} />
            </Link>
            <a href="#how-it-works" className="btn btn-secondary btn-lg">
              How It Works
            </a>
          </div>

          <div className="hero-trust-indicators">
            <div className="trust-item">
              <Check size={18} /> Resume-based questions
            </div>
            <div className="trust-item">
              <Check size={18} /> AI-powered feedback
            </div>
            <div className="trust-item">
              <Check size={18} /> Personalized preparation
            </div>
          </div>
        </div>

        {/* Hero Visual Dashboard Preview */}
        <div className="hero-preview-card animate-fade-in">
          <div className="preview-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Brain size={22} color="#4f46e5" />
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>PrepMind AI Feedback</span>
            </div>
            <span className="badge badge-success">Score: 85%</span>
          </div>

          <div style={{ marginBottom: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>QUESTION 2 OF 5</div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
              "Explain how indexing improves database query execution speed."
            </div>
          </div>

          <div style={{ background: '#eef2ff', padding: '1rem', borderRadius: '10px', borderLeft: '4px solid #4f46e5' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4f46e5', marginBottom: '0.35rem' }}>
              AI EVALUATION HIGHLIGHT
            </div>
            <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
              ✓ Great explanation of B-Tree structure!<br />
              💡 Tip: Mention write overhead (INSERT/UPDATE slowdowns) to get a 10/10 score.
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Get interview-ready in 3 simple steps.</p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number"><span>01</span></div>
            <h3>Upload Resume</h3>
            <p>Upload your resume and let PrepMind understand your skills and experience.</p>
          </div>

          <div className="step-card">
            <div className="step-number"><span>02</span></div>
            <h3>Practice</h3>
            <p>Get interview questions tailored to your role and experience level.</p>
          </div>

          <div className="step-card">
            <div className="step-number"><span>03</span></div>
            <h3>Improve</h3>
            <p>Receive AI feedback and understand exactly how to improve your answers.</p>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Everything You Need to Ace Your Interview</h2>
          <p>Designed for college students, freshers, and job seekers.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Brain size={24} />
            </div>
            <h3>AI Interview Questions</h3>
            <p>Dynamic technical and behavioral questions generated specifically for your target role.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <FileText size={24} />
            </div>
            <h3>Resume-Based Preparation</h3>
            <p>PDF parsing automatically extracts your skills and projects to test your real experience.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Zap size={24} />
            </div>
            <h3>Instant AI Feedback</h3>
            <p>Get real-time scores, missing key points, strengths, and recommended ideal answers.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <BarChart3 size={24} />
            </div>
            <h3>Performance Tracking</h3>
            <p>Track your score progress over time across technical, communication, and problem-solving metrics.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <History size={24} />
            </div>
            <h3>Interview History</h3>
            <p>Review all your completed interviews, past answers, and AI improvement recommendations.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Download size={24} />
            </div>
            <h3>PDF Reports</h3>
            <p>Export complete interview summaries and answer evaluations as clean, printable PDF documents.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
