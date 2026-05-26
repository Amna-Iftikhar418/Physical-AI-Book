import React, { useState } from 'react';
import { ChatPanel } from './ChatPanel';

const FAB_STYLE: React.CSSProperties = {
  position: 'fixed',
  bottom: 20,
  right: 20,
  width: 52,
  height: 52,
  borderRadius: '50%',
  background: 'var(--ifm-color-primary, #0969da)',
  color: '#fff',
  border: 'none',
  cursor: 'pointer',
  fontSize: 24,
  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9998,
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        style={FAB_STYLE}
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        title="Ask the textbook"
      >
        {open ? '✕' : '💬'}
      </button>
      <ChatPanel isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
