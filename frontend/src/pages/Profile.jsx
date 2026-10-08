import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { User, Mail, Calendar, LogOut, CheckCircle2, PlaySquare, Award, TrendingUp } from 'lucide-react';

const Profile = () => {
  const { user, logoutUser } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/interviews')
      .then((res) => {
        if (res.data.success) {
          setInterviews(res.data.interviews);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

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
  const initialLetter = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <MainLayout>
      <div className="profile-container">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Profile & Statistics</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Manage your account details and view your interview performance metrics.
          </p>
        </div>

        {/* User Card */}
        <div className="profile-header-card">
          <div className="profile-avatar">{initialLetter}</div>
          <div className="profile-details">
            <h2>{user?.name || 'Candidate Name'}</h2>
            <p>{user?.email || 'user@example.com'}</p>
          </div>
        </div>

        {/* Account Details Card */}
        <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', fontWeight: 700 }}>Account Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <User size={20} color="#4f46e5" />
              <div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Full Name</div>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{user?.name}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Mail size={20} color="#4f46e5" />
              <div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Email Address</div>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{user?.email}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Calendar size={20} color="#4f46e5" />
              <div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Account Status</div>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>Active PrepMind Candidate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Interview Statistics Grid */}
        <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', fontWeight: 700 }}>Interview Statistics</h3>
        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
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
            <div className="stat-icon">
              <CheckCircle2 size={22} />
            </div>
            <div className="stat-info">
              <div className="stat-label">Questions Answered</div>
              <div className="stat-value">{totalQuestionsAnswered}</div>
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

        {/* Sign Out Button */}
        <div style={{ marginTop: '2rem' }}>
          <button onClick={logoutUser} className="btn btn-danger" style={{ width: '100%', padding: '0.85rem' }}>
            <LogOut size={18} /> Sign Out of Account
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
