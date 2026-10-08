import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

const Tooltip = ({ text }) => {
  const [visible, setVisible] = useState(false);

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: '0.35rem', cursor: 'pointer' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onClick={() => setVisible(!visible)}
    >
      <HelpCircle size={15} color="#94a3b8" />
      {visible && (
        <span
          style={{
            position: 'absolute',
            bottom: '125%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#0f172a',
            color: '#ffffff',
            padding: '0.4rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontWeight: 400,
            whiteSpace: 'nowrap',
            zIndex: 99,
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            pointerEvents: 'none'
          }}
        >
          {text}
        </span>
      )}
    </span>
  );
};

export default Tooltip;
