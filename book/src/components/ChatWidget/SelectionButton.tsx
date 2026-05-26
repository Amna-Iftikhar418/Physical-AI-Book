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
        top: Math.max(y - 42, 5),
        transform: 'translateX(-50%)',
        background: 'var(--ifm-color-primary, #0969da)',
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        padding: '5px 12px',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        zIndex: 10000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
        whiteSpace: 'nowrap',
      }}
      onMouseDown={e => e.preventDefault()}
      onClick={onClick}
    >
      Ask about this ✦
    </button>
  );
}
