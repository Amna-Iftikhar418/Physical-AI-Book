import React, { useState } from 'react';
import { ChatPanel } from './ChatPanel';

export function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <style>{`
        /* ─── Keyframes ──────────────────────────────────────── */
        @keyframes sonarPing {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes haloBorderSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes glowBreath {
          0%, 100% {
            box-shadow:
              0 0 18px 4px  rgba(59,130,246,0.45),
              0 0 50px 10px rgba(37,99,235,0.22),
              0 8px 32px     rgba(0,0,0,0.55);
          }
          50% {
            box-shadow:
              0 0 28px 8px  rgba(59,130,246,0.65),
              0 0 70px 18px rgba(37,99,235,0.32),
              0 12px 40px   rgba(0,0,0,0.6);
          }
        }
        @keyframes iconFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          45%      { transform: translateY(-4px) scale(1.06); }
          75%      { transform: translateY(1px) scale(0.97); }
        }
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.45; }
          30%           { transform: translateY(-3px); opacity: 1; }
        }
        @keyframes closeRotate {
          from { transform: rotate(-45deg) scale(0.7); opacity: 0; }
          to   { transform: rotate(0deg)  scale(1);   opacity: 1; }
        }
        @keyframes onlinePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.6); }
          50%      { box-shadow: 0 0 0 4px rgba(34,197,94,0); }
        }

        /* ─── Sonar ping rings ───────────────────────────────── */
        .fab-sonar {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1.5px solid rgba(59,130,246,0.55);
          pointer-events: none;
        }
        .fab-sonar-1 { animation: sonarPing 2.6s ease-out infinite; }
        .fab-sonar-2 { animation: sonarPing 2.6s ease-out infinite 0.9s; }

        /* ─── Spinning gradient halo border ─────────────────── */
        .fab-halo-wrap {
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          padding: 3px;
          animation: haloBorderSpin 6s linear infinite;
          background: conic-gradient(
            from 0deg,
            #1e3a8a 0%,
            #3b82f6 20%,
            #93c5fd 38%,
            #fbbf24 50%,
            #93c5fd 62%,
            #3b82f6 80%,
            #1e3a8a 100%
          );
          pointer-events: none;
        }
        .fab-halo-inner {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #080e1f;
        }

        /* ─── Main circle button ─────────────────────────────── */
        .fab-circle-btn {
          position: relative;
          z-index: 2;
          width: 62px;
          height: 62px;
          border-radius: 50%;
          background: linear-gradient(145deg, #0a1628 0%, #0e1f50 35%, #1a3680 65%, #1d4ed8 100%);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: glowBreath 3s ease-in-out infinite;
          transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1), background 0.3s;
          overflow: visible;
        }
        .fab-circle-btn:hover {
          transform: scale(1.1);
        }
        .fab-circle-btn:active {
          transform: scale(0.95);
        }
        .fab-circle-btn.is-open {
          background: linear-gradient(145deg, #0f172a 0%, #1e293b 100%);
          animation: none;
          box-shadow: 0 4px 20px rgba(0,0,0,0.6), 0 0 0 1px rgba(91,154,255,0.2);
        }

        /* ─── Chat bubble icon wrapper ───────────────────────── */
        .fab-icon-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .fab-circle-btn:not(.is-open) .fab-icon-wrap {
          animation: iconFloat 3.2s ease-in-out infinite;
        }

        /* ─── Typing dots inside bubble ──────────────────────── */
        .fab-dot-row {
          display: flex;
          gap: 3px;
          margin-top: -1px;
        }
        .fab-typing-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #1d4ed8;
        }
        .fab-typing-dot:nth-child(1) { animation: typingDot 1.3s ease-in-out 0.0s infinite; }
        .fab-typing-dot:nth-child(2) { animation: typingDot 1.3s ease-in-out 0.18s infinite; }
        .fab-typing-dot:nth-child(3) { animation: typingDot 1.3s ease-in-out 0.36s infinite; }

        /* ─── Close icon ─────────────────────────────────────── */
        .fab-close-icon {
          animation: closeRotate 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }

        /* ─── Online status dot ──────────────────────────────── */
        .fab-online-dot {
          position: absolute;
          top: 5px;
          right: 5px;
          width: 10px;
          height: 10px;
          background: #22c55e;
          border-radius: 50%;
          border: 2px solid #080e1f;
          animation: onlinePulse 2s ease-in-out infinite;
          z-index: 3;
          transition: opacity 0.2s;
        }

        /* ─── Tooltip ────────────────────────────────────────── */
        .fab-container:not(.is-open):hover .fab-tooltip {
          opacity: 1;
          transform: translateY(-50%) translateX(0);
          pointer-events: auto;
        }
        .fab-tooltip {
          position: absolute;
          right: calc(100% + 14px);
          top: 50%;
          transform: translateY(-50%) translateX(8px);
          background: rgba(8,14,31,0.96);
          border: 1px solid rgba(59,130,246,0.25);
          border-radius: 10px;
          padding: 7px 13px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.22s, transform 0.22s;
          font-family: 'Outfit', sans-serif;
          font-size: 12px;
          color: #cbd5e1;
          letter-spacing: 0.01em;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4);
        }
        .fab-tooltip-title {
          font-weight: 600;
          color: #e2e8f0;
          display: block;
          margin-bottom: 1px;
        }
        .fab-tooltip-sub {
          font-size: 10.5px;
          color: #64748b;
          display: block;
        }
        .fab-tooltip::after {
          content: '';
          position: absolute;
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          border: 6px solid transparent;
          border-left-color: rgba(59,130,246,0.25);
        }

        /* ─── Container ──────────────────────────────────────── */
        .fab-container {
          position: fixed;
          bottom: 26px;
          right: 26px;
          z-index: 9998;
          width: 62px;
          height: 62px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>

      <div className={`fab-container${open ? ' is-open' : ''}`}>

        {/* Sonar ping rings — only when closed */}
        {!open && (
          <>
            <div className="fab-sonar fab-sonar-1" />
            <div className="fab-sonar fab-sonar-2" />
          </>
        )}

        {/* Spinning gradient halo border — only when closed */}
        {!open && (
          <div className="fab-halo-wrap">
            <div className="fab-halo-inner" />
          </div>
        )}

        {/* Tooltip */}
        {!open && (
          <span className="fab-tooltip">
            <span className="fab-tooltip-title">Ask Physical AI</span>
            <span className="fab-tooltip-sub">RAG-powered textbook assistant</span>
          </span>
        )}

        {/* Main button */}
        <button
          className={`fab-circle-btn${open ? ' is-open' : ''}`}
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Close chat' : 'Ask the Physical AI textbook'}
        >
          {/* Online dot */}
          {!open && <span className="fab-online-dot" />}

          {open ? (
            /* Close icon */
            <span className="fab-close-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </span>
          ) : (
            /* Chat bubble icon with typing dots */
            <div className="fab-icon-wrap">
              <svg width="30" height="28" viewBox="0 0 32 30" fill="none">
                {/* Shadow/depth layer */}
                <path
                  d="M3 2h26a2 2 0 0 1 2 2v17a2 2 0 0 1-2 2H11.5L4 30V4a2 2 0 0 1 2-2z"
                  fill="rgba(30,58,138,0.35)"
                  transform="translate(0.5, 1)"
                />
                {/* Main bubble */}
                <path
                  d="M3 2h26a2 2 0 0 1 2 2v17a2 2 0 0 1-2 2H11.5L4 30V4a2 2 0 0 1 2-2z"
                  fill="white"
                  opacity="0.97"
                />
                {/* Inner shine */}
                <path
                  d="M6 3h20a1 1 0 0 1 1 1v6H5V4a1 1 0 0 1 1-1z"
                  fill="rgba(255,255,255,0.4)"
                />
                {/* Dots row */}
                <circle cx="11" cy="13" r="2.2" fill="#1d4ed8"/>
                <circle cx="16" cy="13" r="2.2" fill="#1d4ed8"/>
                <circle cx="21" cy="13" r="2.2" fill="#1d4ed8"/>
              </svg>
              {/* Animated typing dots overlaid */}
              <div className="fab-dot-row" style={{ position: 'absolute', top: 17, left: '50%', transform: 'translateX(-50%)', gap: 4 }}>
                <div className="fab-typing-dot" />
                <div className="fab-typing-dot" />
                <div className="fab-typing-dot" />
              </div>
            </div>
          )}
        </button>
      </div>

      <ChatPanel isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
