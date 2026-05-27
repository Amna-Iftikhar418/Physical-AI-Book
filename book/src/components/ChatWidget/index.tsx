import React, { useState } from 'react';
import { ChatPanel } from './ChatPanel';

export function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <style>{`
        @keyframes fabPulse {
          0%, 100% { box-shadow: 0 6px 24px rgba(37,99,235,0.5), 0 0 0 0 rgba(91,154,255,0.4); }
          50%       { box-shadow: 0 8px 32px rgba(37,99,235,0.65), 0 0 0 12px rgba(91,154,255,0); }
        }
        @keyframes fabSpin {
          from { transform: rotate(0deg) scale(1); }
          to   { transform: rotate(90deg) scale(0.9); }
        }
        @keyframes fabSpinBack {
          from { transform: rotate(90deg) scale(0.9); }
          to   { transform: rotate(0deg) scale(1); }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%            { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes msgFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .chat-fab:hover {
          transform: scale(1.07) !important;
          box-shadow: 0 8px 32px rgba(37,99,235,0.65), 0 0 0 0 transparent !important;
        }
      `}</style>

      <button
        className="chat-fab"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close chat' : 'Ask the textbook'}
        title="Ask the Physical AI textbook"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: open
            ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
            : 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
          border: open
            ? '1px solid rgba(91,154,255,0.3)'
            : '1px solid rgba(96,165,250,0.3)',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9998,
          boxShadow: open
            ? '0 6px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)'
            : '0 6px 24px rgba(37,99,235,0.5)',
          transition: 'background 0.25s, box-shadow 0.25s, border-color 0.25s, transform 0.18s',
          animation: open ? 'none' : 'fabPulse 2.8s ease-in-out infinite',
        }}
      >
        <span style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1)',
          transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
        }}>
          {open ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="7" width="18" height="13" rx="3" stroke="#fff" strokeWidth="1.7"/>
              <circle cx="9" cy="13.5" r="1.5" fill="#fff"/>
              <circle cx="15" cy="13.5" r="1.5" fill="#fff"/>
              <path d="M12 2.5v4.5" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" strokeLinecap="round"/>
              <rect x="9.5" y="1.5" width="5" height="2.2" rx="1.1" fill="rgba(255,255,255,0.75)"/>
            </svg>
          )}
        </span>
      </button>

      <ChatPanel isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
