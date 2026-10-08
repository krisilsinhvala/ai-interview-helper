import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Tooltip from '../components/Tooltip';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Code,
  Layout,
  Server,
  Layers,
  Coffee,
  Terminal,
  Database,
  Plus,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  PlaySquare
} from 'lucide-react';

const roleOptions = [
  { id: 'Software Engineer', title: 'Software Engineer', icon: Code },
  { id: 'Frontend Developer', title: 'Frontend Developer', icon: Layout },
  { id: 'Backend Developer', title: 'Backend Developer', icon: Server },
  { id: 'Full Stack Developer', title: 'Full Stack Developer', icon: Layers },
  { id: 'Java Developer', title: 'Java Developer', icon: Coffee },
  { id: 'Python Developer', title: 'Python Developer', icon: Terminal },
  { id: 'Data Analyst', title: 'Data Analyst', icon: Database },
];

const experienceOptions = [
  { id: 'Fresher', title: 'Fresher / Student', sub: 'Little or no professional experience' },
  { id: '0-1 Years', title: '0–1 Years', sub: 'Junior level role' },
  { id: '1-3 Years', title: '1–3 Years', sub: 'Mid-level candidate' },
  { id: '3-5 Years', title: '3–5 Years', sub: 'Senior engineer' },
  { id: '5+ Years', title: '5+ Years', sub: 'Lead / Principal tier' },
];

const typeOptions = [
  { id: 'Technical', title: 'Technical', sub: 'Coding, algorithms, system concepts' },
  { id: 'HR', title: 'HR & Culture', sub: 'Career goals, motivation, strengths' },
  { id: 'Behavioral', title: 'Behavioral (STAR)', sub: 'Past experiences, conflict resolution' },
  { id: 'Resume Based', title: 'Resume Based', sub: 'Questions generated from your resume' },
  { id: 'Mixed', title: 'Mixed Session', sub: 'Balanced combination of technical & HR' },
];

const questionCounts = [5, 10, 15, 20];

const InterviewSetup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [customRole, setCustomRole] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [experience, setExperience] = useState('0-1 Years');
  const [interviewType, setInterviewType] = useState('Technical');
  const [numQuestions, setNumQuestions] = useState(10);

  const [hasResume, setHasResume] = useState(false);
  const [loading, setLoading] = useState(false);

  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/resume')
      .then((res) => {
        if (res.data.hasResume) setHasResume(true);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleNextStep = () => {
    if (currentStep === 1 && isCustom && !customRole.trim()) {
      addToast('Please enter your custom target job role.', 'warning');
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleGenerate = async () => {
    const finalRole = isCustom ? customRole.trim() : targetRole;
    if (!finalRole) {
      addToast('Target job role cannot be empty.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/interviews/generate', {
        jobRole: finalRole,
        experience,
        interviewType,
        numQuestions: parseInt(numQuestions, 10),
      });

      if (res.data.success) {
        addToast('Interview session generated successfully!', 'success');
        navigate(`/interview/practice/${res.data.interview._id}`);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'AI service is currently experiencing high demand. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const activeRoleDisplay = isCustom ? customRole || 'Custom Role' : targetRole;

  return (
    <MainLayout>
      <div className="wizard-container">
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Configure Your Practice Interview</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Follow the 4 quick steps to generate personalized AI interview questions.
          </p>
        </div>

        {/* Wizard Progress Nodes */}
        <div className="wizard-progress">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`wizard-step-node ${step === currentStep ? 'active' : ''} ${step < currentStep ? 'completed' : ''}`}
            >
              {step < currentStep ? '✓' : step}
            </div>
          ))}
        </div>

        {/* STEP 1: TARGET ROLE */}
        {currentStep === 1 && (
          <div className="card animate-fade-in">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
              Step 1: Choose Your Target Role <Tooltip text="Select the job title you are preparing or interviewing for." />
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Questions will be dynamically tailored to the specific core competencies of this position.
            </p>

            <div className="wizard-card-grid">
              {roleOptions.map((item) => {
                const IconComp = item.icon;
                const isSelected = !isCustom && targetRole === item.id;
                return (
                  <div
                    key={item.id}
                    className={`wizard-selectable-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setTargetRole(item.id);
                      setIsCustom(false);
                    }}
                  >
                    <div className="card-icon">
                      <IconComp size={20} />
                    </div>
                    <div className="card-label">{item.title}</div>
                  </div>
                );
              })}

              <div
                className={`wizard-selectable-card ${isCustom ? 'selected' : ''}`}
                onClick={() => setIsCustom(true)}
              >
                <div className="card-icon">
                  <Plus size={20} />
                </div>
                <div className="card-label">Custom Role</div>
              </div>
            </div>

            {isCustom && (
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Enter Custom Role Title:</label>
                <input
                  type="text"
                  placeholder="e.g. iOS Architect, AI/ML Research Engineer..."
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  autoFocus
                />
              </div>
            )}
          </div>
        )}

        {/* STEP 2: EXPERIENCE */}
        {currentStep === 2 && (
          <div className="card animate-fade-in">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
              Step 2: Experience Level <Tooltip text="Select Fresher if you have little or no professional experience." />
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              This adjusts difficulty tier and depth of system architecture vs foundational questions.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {experienceOptions.map((opt) => {
                const isSelected = experience === opt.id;
                return (
                  <div
                    key={opt.id}
                    className={`wizard-selectable-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setExperience(opt.id)}
                    style={{ width: '100%', justifyContent: 'space-between' }}
                  >
                    <div>
                      <div className="card-label" style={{ fontSize: '1rem' }}>{opt.title}</div>
                      <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{opt.sub}</div>
                    </div>
                    {isSelected && <CheckCircle2 size={20} color="#4f46e5" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: INTERVIEW TYPE */}
        {currentStep === 3 && (
          <div className="card animate-fade-in">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
              Step 3: Interview Type <Tooltip text="Choose Technical for programming and CS questions." />
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Select the domain focus for this practice session.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {typeOptions.map((opt) => {
                const isSelected = interviewType === opt.id;
                const isDisabled = opt.id === 'Resume Based' && !hasResume;
                return (
                  <div
                    key={opt.id}
                    className={`wizard-selectable-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => !isDisabled && setInterviewType(opt.id)}
                    style={{
                      width: '100%',
                      justify: 'space-between',
                      opacity: isDisabled ? 0.5 : 1,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <div>
                      <div className="card-label" style={{ fontSize: '1rem' }}>
                        {opt.title} {isDisabled && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>(Upload resume first)</span>}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{opt.sub}</div>
                    </div>
                    {isSelected && <CheckCircle2 size={20} color="#4f46e5" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: QUESTION COUNT & SUMMARY */}
        {currentStep === 4 && (
          <div className="card animate-fade-in">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Step 4: Questions & Summary</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Select session length and review your settings before generating.
            </p>

            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label>Number of Questions:</label>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                {questionCounts.map((count) => (
                  <button
                    type="button"
                    key={count}
                    onClick={() => setNumQuestions(count)}
                    className={`btn ${numQuestions === count ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, padding: '0.75rem 0' }}
                  >
                    {count} Qs
                  </button>
                ))}
              </div>
            </div>

            {/* Summary Review Card */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f172a' }}>
                Session Configuration Summary
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.88rem' }}>
                <div><span style={{ color: '#64748b' }}>Role:</span> <strong>{activeRoleDisplay}</strong></div>
                <div><span style={{ color: '#64748b' }}>Experience:</span> <strong>{experience}</strong></div>
                <div><span style={{ color: '#64748b' }}>Category:</span> <strong>{interviewType}</strong></div>
                <div><span style={{ color: '#64748b' }}>Questions:</span> <strong>{numQuestions} Questions</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Navigation Controls */}
        <div className="wizard-footer">
          <button
            onClick={handlePrevStep}
            className="btn btn-secondary"
            disabled={currentStep === 1 || loading}
          >
            <ArrowLeft size={18} /> Back
          </button>

          {currentStep < 4 ? (
            <button onClick={handleNextStep} className="btn btn-primary">
              Continue <ArrowRight size={18} />
            </button>
          ) : (
            <button onClick={handleGenerate} className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" /> Generating Session...
                </>
              ) : (
                <>
                  <PlaySquare size={18} /> Generate Interview
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default InterviewSetup;
