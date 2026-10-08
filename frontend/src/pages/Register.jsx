import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Brain, User, Mail, Lock, Eye, EyeOff, ArrowRight, RefreshCw } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { registerUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const result = await registerUser(name, email, password, confirmPassword);
    setLoading(false);

    if (result.success) {
      addToast('Account created successfully! Welcome to PrepMind.', 'success');
      navigate('/dashboard');
    } else {
      setErrorMsg(result.message);
      addToast(result.message || 'Registration failed. Please try again.', 'error');
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
          <h2>Start Your Interview Prep Journey</h2>
          <p>
            Create your account today and gain instant access to resume analysis, custom AI technical mock interviews, and automated evaluation reports.
          </p>
        </div>

        <div className="brand-bottom-quote">
          <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>✓ Free Starter Practice</div>
          "PrepMind helped me prepare for my campus placement interviews with targeted question sets."
        </div>
      </div>

      {/* Right Form Column */}
      <div className="auth-right-form">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="brand-mobile-logo">
              <Brain size={24} /> PrepMind AI
            </Link>
            <h1>Create Account</h1>
            <p>Join PrepMind to start your AI-powered interview practice</p>
          </div>

          {errorMsg && (
            <div className="form-error" style={{ marginBottom: '1rem', background: '#fee2e2', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nameInput">Full Name</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  id="nameInput"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="regEmailInput">Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  id="regEmailInput"
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
              <label htmlFor="regPasswordInput">Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="regPasswordInput"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
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

            <div className="form-group">
              <label htmlFor="confirmPasswordInput">Confirm Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="confirmPasswordInput"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !name || !email || !password || !confirmPassword}
              style={{ width: '100%', marginTop: '0.75rem' }}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" /> Creating Account...
                </>
              ) : (
                <>
                  Create Free Account <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer-link">
            Already have an account?{' '}
            <Link to="/login">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
