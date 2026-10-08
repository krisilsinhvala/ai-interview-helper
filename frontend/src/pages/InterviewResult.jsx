import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ProgressBar from '../components/ProgressBar';
import { exportInterviewToPdf } from '../utils/printPdf';
import {
  Award,
  Download,
  PlaySquare,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  History,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Target
} from 'lucide-react';

const InterviewResult = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get(`/interviews/${id}`);
        if (res.data.success) {
          setInterview(res.data.interview);
        }
      } catch (err) {
        addToast('Failed to load interview report results.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <LoadingSpinner message="Generating your interview evaluation report..." />
      </MainLayout>
    );
  }

  if (!interview) {
    return (
      <MainLayout>
        <div className="empty-state">
          <h3>Report Not Found</h3>
          <p>We couldn't retrieve the specified interview results.</p>
          <Link to="/history" className="btn btn-primary">
            View Interview History
          </Link>
        </div>
      </MainLayout>
    );
  }

  const handleExportPDF = () => {
    exportInterviewToPdf(interview, user?.name || 'Candidate');
    addToast('PDF report generated successfully!', 'success');
  };

  const scorePct = Math.round(((interview.overallScore || 0) / 10) * 100);
  const scoreDeg = `${(scorePct / 100) * 360}deg`;

  // Aggregate strengths & weaknesses across all answered questions
  const allStrengths = [];
  const allWeaknesses = [];

  interview.questions?.forEach((q) => {
    if (q.strengths) allStrengths.push(...q.strengths);
    if (q.weaknesses) allWeaknesses.push(...q.weaknesses);
  });

  const uniqueStrengths = [...new Set(allStrengths)].slice(0, 4);
  const uniqueWeaknesses = [...new Set(allWeaknesses)].slice(0, 4);

  return (
    <MainLayout>
      <div className="results-container">
        {/* Top Header Card */}
        <div className="result-hero-card">
          <div className="result-icon">🎉</div>
          <h1>Interview Complete!</h1>
          <p>You've completed your {interview.jobRole} ({interview.interviewType}) interview.</p>

          {/* Circle Gauge Score Display */}
          <div className="score-circle" style={{ '--score-deg': scoreDeg }}>
            <span className="score-val">{scorePct}%</span>
          </div>

          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#4f46e5' }}>
            {scorePct >= 80 ? 'Great job! You showed strong mastery.' : scorePct >= 60 ? 'Good effort! Room for minor improvements.' : 'Keep practicing to build topic depth.'}
          </div>
        </div>

        {/* Category Breakdown Progress Bars */}
        <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', fontWeight: 700 }}>Performance Breakdown</h3>
          <div className="breakdown-grid">
            <div className="breakdown-card">
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Technical Depth</div>
              <div className="breakdown-score">
                {Math.round(((interview.technicalScore || 0) / 10) * 100)}%
              </div>
              <ProgressBar value={interview.technicalScore || 0} max={10} color="#4f46e5" />
            </div>

            <div className="breakdown-card">
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Communication</div>
              <div className="breakdown-score">
                {Math.round(((interview.communicationScore || 0) / 10) * 100)}%
              </div>
              <ProgressBar value={interview.communicationScore || 0} max={10} color="#8b5cf6" />
            </div>

            <div className="breakdown-card">
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Problem Solving</div>
              <div className="breakdown-score">
                {Math.round(((interview.problemSolvingScore || 0) / 10) * 100)}%
              </div>
              <ProgressBar value={interview.problemSolvingScore || 0} max={10} color="#0284c7" />
            </div>
          </div>
        </div>

        {/* Strengths & Areas to Improve Dual Column */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="card" style={{ borderLeft: '4px solid #10b981', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#166534', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={18} color="#10b981" /> Your Strengths
            </h3>
            {uniqueStrengths.length > 0 ? (
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', color: '#334155' }}>
                {uniqueStrengths.map((str, idx) => (
                  <li key={idx} style={{ marginBottom: '0.4rem' }}>{str}</li>
                ))}
              </ul>
            ) : (
              <div style={{ fontSize: '0.88rem', color: '#64748b' }}>Good foundational structure across answers.</div>
            )}
          </div>

          <div className="card" style={{ borderLeft: '4px solid #f59e0b', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#92400e', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertCircle size={18} color="#f59e0b" /> Areas to Improve
            </h3>
            {uniqueWeaknesses.length > 0 ? (
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', color: '#334155' }}>
                {uniqueWeaknesses.map((wk, idx) => (
                  <li key={idx} style={{ marginBottom: '0.4rem' }}>{wk}</li>
                ))}
              </ul>
            ) : (
              <div style={{ fontSize: '0.88rem', color: '#64748b' }}>Focus on providing detailed examples in technical answers.</div>
            )}
          </div>
        </div>

        {/* AI Recommendation Box */}
        <div className="card" style={{ background: '#eef2ff', border: '1px solid #c7d2fe', padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3730a3', fontWeight: 700, marginBottom: '0.5rem' }}>
            <Sparkles size={20} /> AI Preparation Recommendation
          </div>
          <p style={{ fontSize: '0.92rem', color: '#1e1b4b', lineHeight: 1.6 }}>
            {scorePct >= 80
              ? "You're ready for technical interviews in this role! Practice advanced system design scenario questions to push your score even higher."
              : "Spend more time practicing core technical concepts and STAR method structure before attempting live interviews. Focus on your highlighted weak areas."}
          </p>
        </div>

        {/* Action Buttons Group */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '3rem' }}>
          <Link to="/interview/setup" className="btn btn-primary">
            <RotateCcw size={18} /> Practice Weak Areas
          </Link>
          <Link to="/interview/setup" className="btn btn-secondary">
            <PlaySquare size={18} /> Try Another Interview
          </Link>
          <Link to="/history" className="btn btn-secondary">
            <History size={18} /> View History
          </Link>
          <button onClick={handleExportPDF} className="btn btn-secondary">
            <Download size={18} /> Export Report PDF
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default InterviewResult;
