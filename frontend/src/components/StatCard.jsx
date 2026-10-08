import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = "#6366f1", subtext }) => {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
      <div style={{
        width: '52px',
        height: '52px',
        borderRadius: '12px',
        backgroundColor: `${color}18`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
        flexShrink: 0
      }}>
        {Icon && <Icon size={26} />}
      </div>
      <div>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', margin: '2px 0' }}>{value}</div>
        {subtext && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{subtext}</div>}
      </div>
    </div>
  );
};

export default StatCard;
