import React from 'react';

interface SelectionButtonProps {
  x: number;
  y: number;
  onClick: () => void;
}

export function SelectionButton({ x, y, onClick }: SelectionButtonProps) {
  return (
    <button
      style={{
        position: 'fixed',
        left: x,
        top: Math.max(y - 46, 5),
        transform: 'translateX(-50%)',
        background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
        color: '#fff',
        border: '1px solid rgba(96,165,250,0.3)',
        borderRadius: 20,
        padding: '6px 14px',
        fontSize: 12.5,
        fontWeight: 600,
        cursor: 'pointer',
        zIndex: 10000,
        boxShadow: '0 4px 16px rgba(37,99,235,0.45)',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        letterSpacing: 0.2,
        transition: 'background 0.15s, transform 0.15s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateX(-50%) scale(1.04)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateX(-50%) scale(1)'; }}
      onMouseDown={e => e.preventDefault()}
      onClick={onClick}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="7" width="18" height="13" rx="3" stroke="#fff" strokeWidth="2"/>
        <circle cx="9" cy="13.5" r="1.5" fill="#fff"/>
        <circle cx="15" cy="13.5" r="1.5" fill="#fff"/>
        <path d="M12 2.5v4.5" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      Ask about this
    </button>
  );
}
