import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Brain, Mail, Lock, Eye, EyeOff, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { loginUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    const result = await loginUser(email, password);
    setLoading(false);

    if (result.success) {
      addToast('Welcome back! Signed in successfully.', 'success');
      navigate('/dashboard');
    } else {
      setErrorMsg(result.message);
      addToast(result.message || 'Login failed. Please check your credentials.', 'error');
    }
  };

  return (
    <div className="auth-split-layout">
      {/* Left Brand Column */}
      <div className="auth-left-brand">
        <Link to="/" className="brand-top">
          <Brain size={28} /> PrepMind AI
        </Link>

        <div className="brand-center">
          <h2>Master Your Technical & HR Interviews</h2>
          <p>
            Join thousands of job seekers preparing for top tech roles with personalized AI practice questions and real-time evaluation.
          </p>
        </div>

        <div className="brand-bottom-quote">
          <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>✓ AI Resume Matching</div>
          "PrepMind gave me the exact questions asked in my interview round. The real-time feedback helped me land my Software Engineer offer!"
        </div>
      </div>

      {/* Right Form Column */}
      <div className="auth-right-form">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="brand-mobile-logo">
              <Brain size={24} /> PrepMind AI
            </Link>
            <h1>Sign In</h1>
            <p>Enter your credentials to access your dashboard</p>
          </div>

          {errorMsg && (
            <div className="form-error" style={{ marginBottom: '1rem', background: '#fee2e2', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="emailInput">Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  id="emailInput"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="passwordInput">Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="passwordInput"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !email || !password}
              style={{ width: '100%', marginTop: '0.75rem' }}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" /> Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer-link">
            Don't have an account?{' '}
            <Link to="/register">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
