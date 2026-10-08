import React from 'react';

const ProgressBar = ({ value = 0, max = 100, color = "#6366f1", height = "8px", label }) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem', fontWeight: 500, color: '#94a3b8' }}>
          <span>{label}</span>
          <span style={{ color: '#f8fafc', fontWeight: 600 }}>{percentage}%</span>
        </div>
      )}
      <div style={{
        width: '100%',
        height: height,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '999px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: '999px',
          transition: 'width 0.4s ease-in-out'
        }} />
      </div>
    </div>
  );
};

export default ProgressBar;
