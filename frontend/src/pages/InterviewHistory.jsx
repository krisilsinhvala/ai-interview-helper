import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { History, PlaySquare, Trash2, ArrowRight } from 'lucide-react';

const filterTabs = ['All', 'Technical', 'HR', 'Behavioral', 'Resume Based'];

const InterviewHistory = () => {
  const [interviews, setInterviews] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);

  const { addToast } = useToast();

  const fetchHistory = async () => {
    try {
      const res = await api.get('/interviews');
      if (res.data.success) {
        setInterviews(res.data.interviews);
      }
    } catch (err) {
      addToast('Failed to fetch interview history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteSession = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this interview session?')) return;

    try {
      await api.delete(`/interviews/${id}`);
      setInterviews(interviews.filter((i) => i._id !== id));
      addToast('Interview session deleted.', 'info');
    } catch (err) {
      addToast('Failed to delete interview session.', 'error');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <LoadingSpinner message="Loading your interview history..." />
      </MainLayout>
    );
  }

  const filteredInterviews = interviews.filter((item) => {
    if (activeTab === 'All') return true;
    return item.interviewType === activeTab;
  });

  return (
    <MainLayout>
      <div className="history-container">
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Interview History</h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Review your past practice sessions and feedback reports.
            </p>
          </div>

          <Link to="/interview/setup" className="btn btn-primary">
            <PlaySquare size={18} /> New Interview
          </Link>
        </div>

        {/* Filter Tabs */}
        {interviews.length > 0 && (
          <div className="history-filter-tabs">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                className={`filter-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredInterviews.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <History size={32} />
            </div>
            <h3>You haven't completed an interview yet.</h3>
            <p>Your completed interviews will appear here after your first practice session.</p>
            <Link to="/interview/setup" className="btn btn-primary">
              Start Your First Interview
            </Link>
          </div>
        ) : (
          <div className="history-list">
            {filteredInterviews.map((session) => {
              const scorePct = session.completed ? Math.round((session.overallScore / 10) * 100) : null;
              return (
                <div key={session._id} className="history-card">
                  <div className="history-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{session.jobRole}</h3>
                      <span className="badge badge-primary">{session.interviewType}</span>
                    </div>

                    <div className="history-meta">
                      <span>{session.questions?.length || 0} Questions</span>
                      <span>•</span>
                      <span>{session.experience}</span>
                      <span>•</span>
                      <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: session.completed ? '#10b981' : '#f59e0b' }}>
                        {session.completed ? `${scorePct}%` : 'In Progress'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {session.completed ? 'Completed' : 'Pending Answers'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link
                        to={session.completed ? `/interview/results/${session._id}` : `/interview/practice/${session._id}`}
                        className="btn btn-secondary btn-sm"
                      >
                        {session.completed ? 'View Results' : 'Continue'}
                      </Link>

                      <button
                        onClick={(e) => handleDeleteSession(session._id, e)}
                        className="btn btn-danger btn-sm"
                        title="Delete Session"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default InterviewHistory;
