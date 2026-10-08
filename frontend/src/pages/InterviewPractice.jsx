import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  PlaySquare,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Award,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Mic,
  MicOff,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Check,
  XCircle,
  SkipForward
} from 'lucide-react';

const InterviewPractice = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showIdealAnswer, setShowIdealAnswer] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  const { addToast } = useToast();

  useEffect(() => {
    fetchInterviewDetails();
  }, [id]);

  const fetchInterviewDetails = async () => {
    try {
      const res = await api.get(`/interviews/${id}`);
      if (res.data.success) {
        setInterview(res.data.interview);
        const qList = res.data.interview.questions || [];
        const firstUnanswered = qList.findIndex((q) => q.userScore === null || q.userScore === undefined);
        if (firstUnanswered !== -1) {
          setCurrentIndex(firstUnanswered);
        }
      }
    } catch (err) {
      addToast('Failed to load interview session details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = interview?.questions[currentIndex];

  useEffect(() => {
    if (currentQuestion) {
      setUserAnswer(currentQuestion.userAnswer || '');
      setShowIdealAnswer(false);
      if (currentQuestion.userScore !== null && currentQuestion.userScore !== undefined) {
        setEvaluation({
          score: currentQuestion.userScore,
          rating: currentQuestion.rating,
          strengths: currentQuestion.strengths,
          weaknesses: currentQuestion.weaknesses,
          missingPoints: currentQuestion.missingPoints,
          idealAnswer: currentQuestion.idealAnswer,
          feedback: currentQuestion.feedback,
          improvementTips: currentQuestion.improvementTips,
        });
      } else {
        setEvaluation(null);
      }
    }
  }, [currentIndex, interview]);

  // Ref to hold the active recognition instance so we can stop it cleanly
  const recognitionRef = useRef(null);

  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast('Speech recognition is not supported in this browser. Please use Google Chrome or Edge.', 'warning');
      return;
    }

    // If already listening, stop the active session
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    // continuous = true keeps the mic open across natural pauses
    // interimResults = false means we only receive FINAL, committed transcripts
    // This prevents the same speech chunk from being appended multiple times
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      addToast('Microphone active — start speaking your answer.', 'info');
    };

    recognition.onresult = (event) => {
      // Only process truly final results to avoid duplication
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript;
        }
      }
      if (finalText) {
        // Append the new final segment with a space separator
        setUserAnswer((prev) => {
          const trimmed = prev.trim();
          return trimmed ? trimmed + ' ' + finalText.trim() : finalText.trim();
        });
      }
    };

    recognition.onerror = (event) => {
      // 'no-speech' is benign — user just paused; ignore it
      if (event.error !== 'no-speech') {
        console.warn('Speech error:', event.error);
        addToast(`Microphone error: ${event.error}`, 'warning');
      }
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      addToast('Please type your answer before submitting.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/interviews/${id}/answer`, {
        questionIndex: currentIndex,
        userAnswer: userAnswer.trim(),
      });

      if (res.data.success) {
        setEvaluation(res.data.evaluation);
        const updatedQuestions = [...interview.questions];
        updatedQuestions[currentIndex] = res.data.question;
        setInterview({ ...interview, questions: updatedQuestions });
        addToast('Answer evaluated by AI!', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit answer for AI evaluation.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < interview.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSkip = () => {
    if (currentIndex < interview.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinishSession();
    }
  };

  const handleFinishSession = async () => {
    try {
      await api.post(`/interviews/${id}/complete`);
      addToast('Interview session completed! Generating final results report...', 'success');
      navigate(`/interview/results/${id}`);
    } catch (err) {
      addToast('Failed to finalize session.', 'error');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <LoadingSpinner message="Preparing interview practice room..." />
      </MainLayout>
    );
  }

  if (!interview || !currentQuestion) {
    return (
      <MainLayout>
        <div className="empty-state">
          <h3>Session Not Found</h3>
          <p>This interview practice session could not be retrieved.</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
            Back to Dashboard
          </button>
        </div>
      </MainLayout>
    );
  }

  const isLastQuestion = currentIndex === interview.questions.length - 1;
  const progressPct = Math.round(((currentIndex + 1) / interview.questions.length) * 100);

  return (
    <MainLayout>
      <div className="interview-practice-container">
        {/* Practice Header & Progress Bar */}
        <div className="practice-header">
          <div className="practice-meta">
            <div>
              <span style={{ color: '#4f46e5', fontWeight: 800, fontSize: '1rem' }}>
                Question {currentIndex + 1} of {interview.questions.length}
              </span>
              <span style={{ margin: '0 0.5rem' }}>•</span>
              <span>{interview.jobRole}</span>
            </div>

            <button onClick={handleFinishSession} className="btn btn-secondary btn-sm">
              Finish Session
            </button>
          </div>

          <div className="progress-container">
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="question-card">
          <div className="question-badges">
            <span className="badge badge-primary">{currentQuestion.category || 'Technical'}</span>
            <span className="badge badge-secondary">{currentQuestion.difficulty || 'Medium'}</span>
          </div>

          <h2 className="question-text">{currentQuestion.question}</h2>
        </div>

        {/* Answer Input Card */}
        <div className="answer-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: 700, fontSize: '0.95rem' }}>Your Answer</label>
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className="btn btn-ghost btn-sm"
              style={{ color: isListening ? '#ef4444' : '#4f46e5' }}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              {isListening ? 'Listening...' : 'Dictate with Voice'}
            </button>
          </div>

          {/* Helper Hint */}
          <div className="tip-box">
            <Lightbulb size={16} />
            <span>Tip: Explain the concept first, then give a concrete practical example.</span>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <textarea
              rows={6}
              placeholder="Type your answer as if you're speaking to an interviewer..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handlePrev} disabled={currentIndex === 0 || submitting} className="btn btn-secondary btn-sm">
                <ArrowLeft size={16} /> Back
              </button>
              <button onClick={handleSkip} disabled={submitting} className="btn btn-ghost btn-sm">
                <SkipForward size={16} /> Skip
              </button>
            </div>

            <button
              onClick={handleSubmitAnswer}
              className="btn btn-primary"
              disabled={submitting || !userAnswer.trim()}
            >
              {submitting ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Analyzing your answer...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Submit Answer
                </>
              )}
            </button>
          </div>
        </div>

        {/* Answer Submission Loading State */}
        {submitting && (
          <div className="card" style={{ marginTop: '1.5rem', textAlign: 'center', padding: '2.5rem' }}>
            <div className="loading-spinner-circle" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Analyzing your answer...</h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Evaluating technical accuracy, depth, and communication skills.</p>
          </div>
        )}

        {/* Detailed AI Evaluation Breakdown */}
        {evaluation && !submitting && (
          <div className="evaluation-card animate-fade-in">
            <div className="eval-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>AI Feedback & Evaluation</h3>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Rating: {evaluation.rating || 'Evaluated'}</div>
              </div>
              <div className="score-pill">Score: {evaluation.score}/10</div>
            </div>

            {/* What You Did Well */}
            {evaluation.strengths && evaluation.strengths.length > 0 && (
              <div className="eval-section" style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '10px', borderLeft: '3px solid #10b981' }}>
                <h4 style={{ color: '#166534' }}>
                  <Check size={16} color="#10b981" /> What you did well
                </h4>
                <ul>
                  {evaluation.strengths.map((str, idx) => (
                    <li key={idx}>{str}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Areas to Improve */}
            {evaluation.weaknesses && evaluation.weaknesses.length > 0 && (
              <div className="eval-section" style={{ background: '#fffbeb', padding: '1rem', borderRadius: '10px', borderLeft: '3px solid #f59e0b' }}>
                <h4 style={{ color: '#92400e' }}>
                  <AlertCircle size={16} color="#f59e0b" /> Areas to Improve
                </h4>
                <ul>
                  {evaluation.weaknesses.map((wk, idx) => (
                    <li key={idx}>{wk}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Concepts Missed */}
            {evaluation.missingPoints && evaluation.missingPoints.length > 0 && (
              <div className="eval-section">
                <h4 style={{ color: '#0f172a' }}>Key concepts you missed:</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.35rem' }}>
                  {evaluation.missingPoints.map((mp, idx) => (
                    <span key={idx} className="badge badge-warning">{mp}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Expandable Ideal Model Answer */}
            {evaluation.idealAnswer && (
              <div style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button
                  onClick={() => setShowIdealAnswer(!showIdealAnswer)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: '#4f46e5', fontWeight: 600, padding: 0 }}
                >
                  {showIdealAnswer ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  {showIdealAnswer ? 'Hide Ideal Model Answer' : 'View Ideal Model Answer'}
                </button>

                {showIdealAnswer && (
                  <div style={{
                    marginTop: '0.75rem',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    padding: '1rem',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    color: '#0f172a'
                  }}>
                    {evaluation.idealAnswer}
                  </div>
                )}
              </div>
            )}

            {/* Improvement Tip Banner */}
            {evaluation.improvementTips && evaluation.improvementTips.length > 0 && (
              <div style={{ background: '#eef2ff', padding: '0.85rem 1rem', borderRadius: '8px', marginTop: '1rem', fontSize: '0.85rem', color: '#3730a3' }}>
                <strong>Improvement Tip:</strong> "{evaluation.improvementTips[0]}"
              </div>
            )}

            {/* Next Question Navigation */}
            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              {isLastQuestion ? (
                <button onClick={handleFinishSession} className="btn btn-primary btn-lg">
                  Finish & View Results <ArrowRight size={18} />
                </button>
              ) : (
                <button onClick={handleNext} className="btn btn-primary">
                  Next Question <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default InterviewPractice;
