import React, { useState } from 'react';
import { ChatPanel } from './ChatPanel';

export function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <style>{`
        /* ── FAB animations ─────────────────────────────── */
        @keyframes fabBorderSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes fabRing1 {
          0%   { transform: scale(1); opacity: 0.55; }
          100% { transform: scale(1.9); opacity: 0; }
        }
        @keyframes fabRing2 {
          0%   { transform: scale(1); opacity: 0.35; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes fabLabelIn {
          from { opacity: 0; transform: translateX(6px); max-width: 0; }
          to   { opacity: 1; transform: translateX(0);   max-width: 90px; }
        }
        @keyframes fabIconBounce {
          0%, 100% { transform: translateY(0); }
          40%      { transform: translateY(-3px); }
          70%      { transform: translateY(1px); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
          50%      { opacity: 0.6; transform: scale(1.3) rotate(180deg); }
        }

        /* ── wrapper: gradient border ───────────────────── */
        .fab-border-wrap {
          position: fixed;
          bottom: 22px;
          right: 22px;
          z-index: 9998;
          padding: 2px;
          border-radius: 30px;
          background: linear-gradient(135deg, #1d4ed8, #5b9aff, #93c5fd, #fbbf24, #5b9aff, #1d4ed8);
          background-size: 300% 300%;
          transition: border-radius 0.4s cubic-bezier(0.34,1.56,0.64,1), padding 0.3s;
          filter: drop-shadow(0 8px 24px rgba(37,99,235,0.55));
        }
        .fab-border-wrap.is-open {
          border-radius: 50%;
          padding: 1.5px;
          background: linear-gradient(135deg, rgba(91,154,255,0.4), rgba(91,154,255,0.15));
          filter: drop-shadow(0 4px 16px rgba(0,0,0,0.5));
        }

        /* spinning gradient overlay when closed */
        .fab-spin-ring {
          position: absolute;
          inset: -60%;
          border-radius: inherit;
          background: conic-gradient(
            from 0deg,
            #1d4ed8 0%,
            #5b9aff 25%,
            #93c5fd 45%,
            #fbbf24 55%,
            #60a5fa 75%,
            #1d4ed8 100%
          );
          animation: fabBorderSpin 4s linear infinite;
          pointer-events: none;
        }
        .fab-spin-ring-mask {
          position: absolute;
          inset: 2px;
          border-radius: inherit;
          background: #0a0c16;
          pointer-events: none;
        }

        /* pulse rings (only when closed) */
        .fab-pulse-ring {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: rgba(59,130,246,0.25);
          pointer-events: none;
        }
        .fab-pulse-ring-1 { animation: fabRing1 2.4s ease-out infinite; }
        .fab-pulse-ring-2 { animation: fabRing2 2.4s ease-out infinite 0.7s; }

        /* the actual button */
        .fab-btn {
          position: relative;
          z-index: 1;
          height: 48px;
          min-width: 48px;
          border-radius: 28px;
          background: linear-gradient(135deg, #0d1526 0%, #111827 100%);
          border: none;
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 16px 0 14px;
          font-family: 'Outfit', 'Inter', sans-serif;
          font-weight: 700;
          font-size: 13.5px;
          letter-spacing: 0.02em;
          transition: background 0.25s, border-radius 0.4s cubic-bezier(0.34,1.56,0.64,1),
                      min-width 0.35s cubic-bezier(0.34,1.56,0.64,1),
                      padding 0.35s cubic-bezier(0.34,1.56,0.64,1),
                      transform 0.18s;
          overflow: hidden;
          white-space: nowrap;
        }
        .fab-btn.is-open {
          border-radius: 50%;
          min-width: 48px;
          padding: 0;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        }
        .fab-btn:hover { transform: scale(1.06); }
        .fab-btn:active { transform: scale(0.97); }

        /* icon */
        .fab-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
        }
        .fab-btn:not(.is-open) .fab-icon {
          animation: fabIconBounce 3s ease-in-out infinite;
        }
        .fab-btn.is-open .fab-icon {
          transform: rotate(90deg) scale(0.9);
        }

        /* label */
        .fab-label {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          overflow: hidden;
          max-width: 90px;
          animation: fabLabelIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
          color: #e2e8f0;
        }
        .fab-sparkle {
          font-size: 11px;
          animation: sparkle 2.5s ease-in-out infinite;
          line-height: 1;
        }

        /* online dot */
        .fab-online {
          position: absolute;
          top: 7px;
          right: 7px;
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
          border: 1.5px solid #111827;
          z-index: 2;
          transition: opacity 0.2s;
        }
        .fab-btn.is-open .fab-online { opacity: 0; }

        /* tooltip */
        .fab-border-wrap:not(.is-open):hover .fab-tooltip {
          opacity: 1;
          transform: translateX(0);
          pointer-events: auto;
        }
        .fab-tooltip {
          position: absolute;
          right: calc(100% + 10px);
          top: 50%;
          transform: translateY(-50%) translateX(6px);
          background: rgba(10,12,22,0.95);
          border: 1px solid rgba(91,154,255,0.2);
          border-radius: 8px;
          padding: 5px 10px;
          font-size: 11.5px;
          color: #94a3b8;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s, transform 0.2s;
          font-family: 'Outfit', sans-serif;
        }
        .fab-tooltip::after {
          content: '';
          position: absolute;
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          border: 5px solid transparent;
          border-left-color: rgba(91,154,255,0.2);
        }
      `}</style>

      <div className={`fab-border-wrap${open ? ' is-open' : ''}`}>

        {/* Spinning gradient border ring (only when closed) */}
        {!open && (
          <>
            <div className="fab-spin-ring" />
            <div className="fab-spin-ring-mask" />
            <div className="fab-pulse-ring fab-pulse-ring-1" />
            <div className="fab-pulse-ring fab-pulse-ring-2" />
          </>
        )}

        {/* Tooltip */}
        {!open && (
          <span className="fab-tooltip">Ask the Physical AI textbook</span>
        )}

        <button
          className={`fab-btn${open ? ' is-open' : ''}`}
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Close chat' : 'Ask the Physical AI textbook'}
        >
          {/* Online status dot */}
          <span className="fab-online" />

          {/* Icon */}
          <span className="fab-icon">
            {open ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="7" width="18" height="13" rx="3" stroke="#93c5fd" strokeWidth="1.7"/>
                <circle cx="9" cy="13.5" r="1.5" fill="#fff"/>
                <circle cx="15" cy="13.5" r="1.5" fill="#fff"/>
                <path d="M12 2.5v4.5" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
                <rect x="9.5" y="1.5" width="5" height="2.2" rx="1.1" fill="rgba(255,255,255,0.6)"/>
                <circle cx="9" cy="13.5" r="0.6" fill="#93c5fd"/>
                <circle cx="15" cy="13.5" r="0.6" fill="#93c5fd"/>
              </svg>
            )}
          </span>

          {/* Label — only when closed */}
          {!open && (
            <span className="fab-label">
              Ask AI
              <span className="fab-sparkle">✦</span>
            </span>
          )}
        </button>
      </div>

      <ChatPanel isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
