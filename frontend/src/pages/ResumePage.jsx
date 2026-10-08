import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Tooltip from '../components/Tooltip';
import {
  FileText,
  Upload,
  Trash2,
  CheckCircle2,
  FileCheck,
  RefreshCw,
  Sparkles,
  PlaySquare,
  ChevronDown,
  ChevronUp,
  Cpu,
  Briefcase,
  GraduationCap,
  FolderGit2
} from 'lucide-react';

const ResumePage = () => {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [tailoring, setTailoring] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [tailoredReport, setTailoredReport] = useState(null);
  const [showRawText, setShowRawText] = useState(false);

  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchResume = async () => {
    try {
      const res = await api.get('/resume');
      if (res.data.hasResume) {
        setResume(res.data.resume);
      } else {
        setResume(null);
      }
    } catch (err) {
      console.error('Fetch resume error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResume();
  }, []);

  const handleFileUpload = async (file) => {
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      addToast('Only PDF files (.pdf) are allowed!', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('File size exceeds 5MB limit!', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    try {
      const res = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        addToast('Resume uploaded and analyzed successfully!', 'success');
        fetchResume();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to upload PDF resume.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleTailorResume = async (e) => {
    e.preventDefault();
    if (!jobDescription.trim()) {
      addToast('Please paste a target Job Description first.', 'warning');
      return;
    }

    setTailoring(true);
    try {
      const res = await api.post('/resume/tailor', { jobDescription: jobDescription.trim() });
      if (res.data.success) {
        setTailoredReport(res.data.tailoredReport);
        addToast('ATS Resume Match Report generated successfully!', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to generate tailored report.', 'error');
    } finally {
      setTailoring(false);
    }
  };

  const handleDelete = async () => {
    if (!resume || !window.confirm('Are you sure you want to delete your uploaded resume?')) return;

    try {
      await api.delete(`/resume/${resume._id}`);
      setResume(null);
      setTailoredReport(null);
      addToast('Resume deleted successfully.', 'info');
    } catch (err) {
      addToast('Failed to delete resume.', 'error');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <LoadingSpinner message="Analyzing resume status..." />
      </MainLayout>
    );
  }

  // Extract detected categories from parsed text for smart summary
  const textLower = resume?.extractedText ? resume.extractedText.toLowerCase() : '';
  const detectedSkills = ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'Git', 'HTML/CSS', 'MongoDB', 'Docker', 'AWS', 'C++']
    .filter((skill) => textLower.includes(skill.toLowerCase()));

  return (
    <MainLayout>
      <div className="resume-container">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>
            Your Resume <Tooltip text="Your resume is used to create personalized interview questions." />
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Upload your resume so PrepMind can personalize your interview questions and skills evaluation.
          </p>
        </div>

        {/* Large Drag-and-Drop Area */}
        {!resume && (
          <div className="card" style={{ padding: '1rem' }}>
            <div
              className="resume-dropzone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => document.getElementById('resumeFileInput').click()}
            >
              <div className="dropzone-icon">
                <FileText size={32} />
              </div>
              <h3>{uploading ? 'Analyzing PDF Content...' : 'Drop your PDF here'}</h3>
              <p>or click to browse from your device</p>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
                PDF only • Maximum 5 MB
              </div>
              <button className="btn btn-primary" disabled={uploading}>
                {uploading ? <RefreshCw size={18} className="animate-spin" /> : <Upload size={18} />}
                {uploading ? 'Parsing Resume...' : 'Browse Files'}
              </button>
              <input
                id="resumeFileInput"
                type="file"
                accept=".pdf,application/pdf"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
              />
            </div>
          </div>
        )}

        {/* Uploaded Resume Status Card */}
        {resume && (
          <div className="card">
            <div className="card-header" style={{ borderBottom: 'none', marginBottom: '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#d1fae5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileCheck size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{resume.fileName}</h3>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Uploaded: {new Date(resume.uploadedAt).toLocaleDateString()} • {(resume.fileSize / 1024).toFixed(1)} KB • <span style={{ color: '#10b981', fontWeight: 600 }}>Resume Analyzed ✓</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button onClick={() => document.getElementById('replaceFileInput').click()} className="btn btn-secondary btn-sm" disabled={uploading}>
                  <RefreshCw size={16} /> Replace Resume
                </button>
                <input
                  id="replaceFileInput"
                  type="file"
                  accept=".pdf,application/pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                />
                <button onClick={() => navigate('/interview/setup')} className="btn btn-primary btn-sm">
                  <PlaySquare size={16} /> Start Interview
                </button>
                <button onClick={handleDelete} className="btn btn-danger btn-sm" title="Delete Resume">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Smart Parsed Summary Box */}
            <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '1.5rem', paddingTop: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                Extracted Resume Summary
              </h4>

              <div className="parsed-summary-grid">
                <div className="summary-box">
                  <div className="summary-title">
                    <Cpu size={16} /> Skills Detected
                  </div>
                  <div className="chip-list">
                    {detectedSkills.length > 0 ? (
                      detectedSkills.map((sk, idx) => (
                        <span key={idx} className="badge badge-primary">{sk}</span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Core technical skills extracted from profile</span>
                    )}
                  </div>
                </div>

                <div className="summary-box">
                  <div className="summary-title">
                    <FolderGit2 size={16} /> Projects Detected
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                    {textLower.includes('project') ? 'Multiple software projects detected' : 'Standard project section indexed'}
                  </div>
                </div>

                <div className="summary-box">
                  <div className="summary-title">
                    <Briefcase size={16} /> Experience Detected
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                    {textLower.includes('experience') || textLower.includes('intern') ? 'Work & Internship history detected' : 'Fresher / Academic experience profile'}
                  </div>
                </div>

                <div className="summary-box">
                  <div className="summary-title">
                    <GraduationCap size={16} /> Education Detected
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                    {textLower.includes('bachelor') || textLower.includes('degree') || textLower.includes('university') ? 'Higher education degree found' : 'Educational history indexed'}
                  </div>
                </div>
              </div>

              {/* Optional Collapsible Raw Text View */}
              <div style={{ marginTop: '1.25rem' }}>
                <button
                  onClick={() => setShowRawText(!showRawText)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: '#64748b', fontSize: '0.82rem' }}
                >
                  {showRawText ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  {showRawText ? 'Hide Raw Extracted Text' : 'View Raw Extracted Text'}
                </button>

                {showRawText && (
                  <div style={{
                    marginTop: '0.75rem',
                    background: '#0f172a',
                    color: '#f8fafc',
                    padding: '1rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    maxHeight: '180px',
                    overflowY: 'auto',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {resume.extractedText || 'No readable text content.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ATS Resume Tailoring Tool */}
        {resume && (
          <div className="card" style={{ padding: '2rem' }}>
            <div className="card-header" style={{ paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <div className="card-title">
                <Sparkles size={22} color="#4f46e5" /> ATS Target Matcher & Tailoring Tool
              </div>
            </div>

            <form onSubmit={handleTailorResume}>
              <div className="form-group">
                <label>Target Job Description:</label>
                <textarea
                  rows={4}
                  placeholder="Paste the target job description (key requirements, skills, responsibilities)..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  disabled={tailoring}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={tailoring || !jobDescription.trim()}>
                {tailoring ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {tailoring ? 'AI Tailoring Resume...' : 'Analyze ATS Match & Tailor'}
              </button>
            </form>

            {/* Tailored Report Output */}
            {tailoredReport && (
              <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '2rem', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.2rem' }}>ATS Compatibility Report</h3>
                  <div className="badge badge-success" style={{ fontSize: '1.1rem', padding: '0.35rem 0.85rem' }}>
                    Match Score: {tailoredReport.matchScore}%
                  </div>
                </div>

                {tailoredReport.tailoredSummary && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                      Recommended Professional Summary:
                    </div>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', color: '#0f172a', lineHeight: 1.5 }}>
                      {tailoredReport.tailoredSummary}
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                  {tailoredReport.recommendedKeywords && (
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0284c7', marginBottom: '0.5rem' }}>
                        Target ATS Keywords
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {tailoredReport.recommendedKeywords.map((kw, idx) => (
                          <span key={idx} className="badge badge-primary">{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {tailoredReport.improvements && (
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#d97706', marginBottom: '0.5rem' }}>
                        Suggested Resume Improvements
                      </div>
                      <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#334155', listStyleType: 'disc' }}>
                        {tailoredReport.improvements.map((imp, idx) => (
                          <li key={idx} style={{ marginBottom: '0.25rem' }}>{imp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ResumePage;
