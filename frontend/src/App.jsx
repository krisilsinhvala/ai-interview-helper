import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumePage from './pages/ResumePage';
import InterviewSetup from './pages/InterviewSetup';
import InterviewPractice from './pages/InterviewPractice';
import InterviewResult from './pages/InterviewResult';
import InterviewHistory from './pages/InterviewHistory';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

import './styles/main.scss';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/resume" element={<ProtectedRoute><ResumePage /></ProtectedRoute>} />
            <Route path="/interview/setup" element={<ProtectedRoute><InterviewSetup /></ProtectedRoute>} />
            <Route path="/interview/practice/:id" element={<ProtectedRoute><InterviewPractice /></ProtectedRoute>} />
            <Route path="/interview/results/:id" element={<ProtectedRoute><InterviewResult /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><InterviewHistory /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* 404 Catch All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
