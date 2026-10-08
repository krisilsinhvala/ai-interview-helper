import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  PlaySquare,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Award,
  Circle,
  ChevronDown,
  ChevronUp,
  Target,
  BarChart3,
  TrendingUp
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [resume, setResume] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checklistOpen, setChecklistOpen] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resResume, resInterviews] = await Promise.all([
          api.get('/resume'),
          api.get('/interviews')
        ]);

        if (resResume.data.hasResume) {
          setResume(resResume.data.resume);
        }
        if (resInterviews.data.success) {
          setInterviews(resInterviews.data.interviews);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <LoadingSpinner message="Loading your interview dashboard..." />
      </MainLayout>
    );
  }

  // Calculate greeting time of day
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Calculate statistics
  const completedInterviews = interviews.filter((i) => i.completed);
  let totalQuestionsAnswered = 0;
  let scoreSum = 0;
  let bestScore = 0;

  completedInterviews.forEach((i) => {
    const scorePct = Math.round((i.overallScore / 10) * 100);
    scoreSum += scorePct;
    if (scorePct > bestScore) bestScore = scorePct;

    if (i.questions) {
      totalQuestionsAnswered += i.questions.filter((q) => q.userScore !== null && q.userScore !== undefined).length;
    }
  });

  const avgScorePct = completedInterviews.length > 0 ? Math.round(scoreSum / completedInterviews.length) : 0;

  // Onboarding Checklist state
  const step1Done = !!resume;
  const step2Done = interviews.length > 0;
  const step3Done = completedInterviews.length > 0;
  const completedStepsCount = [step1Done, step2Done, step3Done].filter(Boolean).length;
  const allOnboardingDone = completedStepsCount === 3;

  // Determine last completed score
  const lastInterview = completedInterviews.length > 0 ? completedInterviews[completedInterviews.length - 1] : null;
  const lastScorePct = lastInterview ? Math.round((lastInterview.overallScore / 10) * 100) : null;

  return (
    <MainLayout>
      <div className="dashboard-container">
        {/* Top Greeting & Main CTA */}
        <div className="dashboard-greeting">
          <div className="greeting-text">
            <h1>{timeGreeting}, {user?.name || 'Candidate'} 👋</h1>
            <p>Ready to improve your interview skills?</p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link to="/interview/setup" className="btn btn-primary btn-lg">
              <PlaySquare size={18} /> Start New Interview
            </Link>
          </div>
        </div>

        {/* Resume Status Notification Banner */}
        <div style={{
          background: resume ? '#f0fdf4' : '#fffbeb',
          border: `1px solid ${resume ? '#bbf7d0' : '#fef3c7'}`,
          borderRadius: '12px',
          padding: '0.85rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.9rem',
          color: resume ? '#166534' : '#92400e'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            {resume ? <CheckCircle2 size={18} color="#16a34a" /> : <AlertCircle size={18} color="#d97706" />}
            {resume ? `Resume uploaded (${resume.fileName})` : '⚠ Upload your resume to unlock personalized interview questions'}
          </div>
          <Link to="/resume" style={{ fontWeight: 700, textDecoration: 'underline', color: 'inherit' }}>
            {resume ? 'Manage Resume' : 'Upload Resume'}
          </Link>
        </div>

        {/* Onboarding Checklist (Collapsible) */}
        {!allOnboardingDone && (
          <div className="onboarding-card">
            <div className="onboarding-header">
              <h3>
                <Sparkles size={20} color="#4f46e5" /> Welcome to PrepMind 👋
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="onboarding-progress">{completedStepsCount} / 3 completed</span>
                <button
                  onClick={() => setChecklistOpen(!checklistOpen)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  {checklistOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>
            </div>

            {checklistOpen && (
              <div className="checklist-items">
                <div className="checklist-item">
                  <div className="item-label">
                    {step1Done ? <CheckCircle2 size={20} className="done" /> : <Circle size={20} />}
                    <span>1. Upload your resume</span>
                  </div>
                  <Link to="/resume" className="btn btn-sm btn-secondary">
                    {step1Done ? 'Uploaded ✓' : 'Upload Resume'}
                  </Link>
                </div>

                <div className="checklist-item">
                  <div className="item-label">
                    {step2Done ? <CheckCircle2 size={20} className="done" /> : <Circle size={20} />}
                    <span>2. Choose your target role</span>
                  </div>
                  <Link to="/interview/setup" className="btn btn-sm btn-secondary">
                    {step2Done ? 'Selected ✓' : 'Setup Interview'}
                  </Link>
                </div>

                <div className="checklist-item">
                  <div className="item-label">
                    {step3Done ? <CheckCircle2 size={20} className="done" /> : <Circle size={20} />}
                    <span>3. Start your first interview</span>
                  </div>
                  <Link to="/interview/setup" className="btn btn-sm btn-primary">
                    {step3Done ? 'Completed ✓' : 'Start Practice'}
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* "Your Next Step" Prominent Banner */}
        <div className="next-step-card">
          <div className="next-step-content">
            <div className="next-step-badge">Your Next Step</div>
            {!resume ? (
              <>
                <h3>Upload Your Resume</h3>
                <p>Upload your PDF resume so PrepMind can analyze your background and generate tailored questions.</p>
              </>
            ) : completedInterviews.length === 0 ? (
              <>
                <h3>Complete Your First AI Interview</h3>
                <p>Your resume is uploaded! Your next step is to launch your first AI practice session.</p>
              </>
            ) : (
              <>
                <h3>Great Work! Last Score: {lastScorePct}%</h3>
                <p>Let's practice again to improve your weak areas and boost your confidence.</p>
              </>
            )}
          </div>

          {!resume ? (
            <Link to="/resume" className="btn btn-primary">
              <FileText size={18} /> Upload Resume
            </Link>
          ) : completedInterviews.length === 0 ? (
            <Link to="/interview/setup" className="btn btn-primary">
              <PlaySquare size={18} /> Start Interview
            </Link>
          ) : (
            <Link to="/interview/setup" className="btn btn-primary">
              <PlaySquare size={18} /> Practice Again
            </Link>
          )}
        </div>

        {/* Preparation Overview Stats */}
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 700 }}>Preparation Overview</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <CheckCircle2 size={22} />
            </div>
            <div className="stat-info">
              <div className="stat-label">Questions Practiced</div>
              <div className="stat-value">{totalQuestionsAnswered}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-purple">
              <PlaySquare size={22} />
            </div>
            <div className="stat-info">
              <div className="stat-label">Interviews Completed</div>
              <div className="stat-value">{completedInterviews.length}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-amber">
              <TrendingUp size={22} />
            </div>
            <div className="stat-info">
              <div className="stat-label">Average Score</div>
              <div className="stat-value">{completedInterviews.length > 0 ? `${avgScorePct}%` : 'N/A'}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-green">
              <Award size={22} />
            </div>
            <div className="stat-info">
              <div className="stat-label">Best Score</div>
              <div className="stat-value">{bestScore > 0 ? `${bestScore}%` : 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Recent Interviews Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <BarChart3 size={20} color="#4f46e5" /> Recent Interview Sessions
            </div>
            <Link to="/history" className="btn btn-ghost btn-sm">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {interviews.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <PlaySquare size={32} />
              </div>
              <h3>Ready to test your skills?</h3>
              <p>Your completed interviews will appear here. Start your first AI mock session now.</p>
              <Link to="/interview/setup" className="btn btn-primary">
                Start First Interview
              </Link>
            </div>
          ) : (
            <div className="history-list">
              {interviews.slice(0, 4).map((session) => (
                <div key={session._id} className="history-card">
                  <div className="history-info">
                    <h3>{session.jobRole}</h3>
                    <div className="history-meta">
                      <span className="badge badge-primary">{session.interviewType}</span>
                      <span>{session.experience}</span>
                      <span>•</span>
                      <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: session.completed ? '#10b981' : '#f59e0b' }}>
                        {session.completed ? `${Math.round((session.overallScore / 10) * 100)}%` : 'In Progress'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {session.questions?.length || 0} Questions
                      </div>
                    </div>

                    <Link
                      to={session.completed ? `/interview/results/${session._id}` : `/interview/practice/${session._id}`}
                      className="btn btn-secondary btn-sm"
                    >
                      {session.completed ? 'View Results' : 'Continue'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
