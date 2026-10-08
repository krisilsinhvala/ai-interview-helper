import React from 'react';

const LoadingSpinner = ({ fullScreen = false, message = "Loading..." }) => {
  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: '1rem' }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid rgba(99, 102, 241, 0.2)',
        borderTop: '4px solid #6366f1',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <p style={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: 500 }}>{message}</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
