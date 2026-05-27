import React, { useState } from 'react';
import { ChatPanel } from './ChatPanel';

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <style>{`
        /* ─── Keyframes ──────────────────────────────────────── */
        @keyframes orbPulse {
          0%, 100% {
            box-shadow:
              0 0 0   0   rgba(251,191,36,0.0),
              0 0 22px 5px rgba(59,130,246,0.4),
              0 0 55px 12px rgba(29,78,216,0.25),
              0 10px 40px rgba(0,0,0,0.6);
          }
          50% {
            box-shadow:
              0 0 0   2px  rgba(251,191,36,0.15),
              0 0 32px 9px rgba(59,130,246,0.55),
              0 0 75px 20px rgba(29,78,216,0.35),
              0 14px 48px rgba(0,0,0,0.65);
          }
        }
        @keyframes haloBorderSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes sonarRing {
          0%   { transform: scale(1);   opacity: 0.55; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        @keyframes robotFloat {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-3.5px); }
        }
        @keyframes eyeGlow {
          0%, 100% { opacity: 0.75; }
          50%      { opacity: 1; filter: drop-shadow(0 0 3px #3b82f6); }
        }
        @keyframes antennaSignal {
          0%, 100% { transform: scaleY(1); }
          50%      { transform: scaleY(1.25); }
        }
        @keyframes labelSlide {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes closeIn {
          from { transform: rotate(-60deg) scale(0.6); opacity: 0; }
          to   { transform: rotate(0deg)   scale(1);   opacity: 1; }
        }
        @keyframes onlineRing {
          0%, 100% { box-shadow: 0 0 0 0 rgba(52,211,153,0.7); }
          60%      { box-shadow: 0 0 0 5px rgba(52,211,153,0); }
        }
        @keyframes glintSweep {
          0%   { opacity: 0; transform: translateX(-100%) rotate(25deg); }
          20%  { opacity: 0.35; }
          60%  { opacity: 0.18; }
          100% { opacity: 0; transform: translateX(180%) rotate(25deg); }
        }

        /* ─── Container ──────────────────────────────────────── */
        .pai-fab-root {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 9998;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
        }
        @media (max-width: 460px) {
          .pai-fab-root {
            bottom: 16px;
            right: 16px;
          }
        }

        /* ─── Hover label ────────────────────────────────────── */
        .pai-fab-label {
          animation: labelSlide 0.22s cubic-bezier(0.34,1.56,0.64,1) both;
          background: linear-gradient(135deg, rgba(8,14,31,0.97) 0%, rgba(14,24,60,0.97) 100%);
          border: 1px solid rgba(251,191,36,0.22);
          border-radius: 12px;
          padding: 8px 14px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(59,130,246,0.2);
          position: relative;
        }
        .pai-fab-label::after {
          content: '';
          position: absolute;
          right: -7px;
          top: 50%;
          transform: translateY(-50%);
          border: 7px solid transparent;
          border-left-color: rgba(251,191,36,0.22);
          pointer-events: none;
        }
        .pai-fab-label-title {
          font-family: 'Outfit', 'Inter', sans-serif;
          font-size: 12.5px;
          font-weight: 700;
          color: #f1f5f9;
          letter-spacing: 0.015em;
          white-space: nowrap;
        }
        .pai-fab-label-sub {
          font-family: 'Outfit', 'Inter', sans-serif;
          font-size: 10.5px;
          color: #64748b;
          white-space: nowrap;
          letter-spacing: 0.01em;
        }
        .pai-fab-label-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 9.5px;
          font-family: 'Outfit', 'Inter', sans-serif;
          font-weight: 600;
          color: #fbbf24;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .pai-fab-label-badge::before {
          content: '';
          display: block;
          width: 5px;
          height: 5px;
          background: #34d399;
          border-radius: 50%;
          box-shadow: 0 0 5px #34d399;
        }

        /* ─── Button wrapper ─────────────────────────────────── */
        .pai-fab-wrap {
          position: relative;
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* ─── Sonar rings ────────────────────────────────────── */
        .pai-sonar {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1.5px solid rgba(251,191,36,0.35);
          pointer-events: none;
        }
        .pai-sonar-1 { animation: sonarRing 2.8s ease-out infinite; }
        .pai-sonar-2 { animation: sonarRing 2.8s ease-out infinite 1.0s; }

        /* ─── Spinning gradient halo border ─────────────────── */
        .pai-halo-wrap {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          padding: 4px;
          animation: haloBorderSpin 5s linear infinite;
          background: conic-gradient(
            from 0deg,
            #1e3a8a   0%,
            #2563eb  18%,
            #60a5fa  32%,
            #fbbf24  50%,
            #60a5fa  68%,
            #2563eb  82%,
            #1e3a8a 100%
          );
          pointer-events: none;
        }
        .pai-halo-inner {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #080e1f;
        }

        /* ─── Main button ────────────────────────────────────── */
        .pai-fab-btn {
          position: relative;
          z-index: 2;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 35% 35%,
            #1e3a8a 0%,
            #0f2057 40%,
            #080e1f 100%
          );
          animation: orbPulse 3.2s ease-in-out infinite;
          transition:
            transform 0.2s cubic-bezier(0.34,1.56,0.64,1),
            background 0.3s ease;
          overflow: hidden;
        }
        .pai-fab-btn:hover {
          transform: scale(1.08) rotate(-3deg);
        }
        .pai-fab-btn:active {
          transform: scale(0.94);
        }
        .pai-fab-btn.is-open {
          background: radial-gradient(circle at 35% 35%,
            #1e293b 0%,
            #0f172a 100%
          );
          animation: none;
          box-shadow: 0 4px 24px rgba(0,0,0,0.7), 0 0 0 1px rgba(91,154,255,0.18);
        }

        /* ─── Button inner glint sweep ───────────────────────── */
        .pai-fab-glint {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          overflow: hidden;
          pointer-events: none;
        }
        .pai-fab-glint::after {
          content: '';
          position: absolute;
          top: -40%;
          left: -40%;
          width: 80%;
          height: 180%;
          background: linear-gradient(
            100deg,
            transparent 0%,
            rgba(255,255,255,0.08) 50%,
            transparent 100%
          );
          animation: glintSweep 4s ease-in-out infinite 1.5s;
        }

        /* ─── Online dot ─────────────────────────────────────── */
        .pai-online-dot {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 11px;
          height: 11px;
          background: #34d399;
          border-radius: 50%;
          border: 2px solid #080e1f;
          animation: onlineRing 2.2s ease-in-out infinite;
          z-index: 4;
        }

        /* ─── Robot icon wrapper ─────────────────────────────── */
        .pai-robot-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          animation: robotFloat 3s ease-in-out infinite;
        }
        .pai-robot-eye {
          animation: eyeGlow 2.4s ease-in-out infinite;
        }
        .pai-robot-eye:nth-child(2) {
          animation-delay: 0.35s;
        }
        .pai-antenna-tip {
          animation: antennaSignal 2.4s ease-in-out infinite;
          transform-origin: bottom center;
        }

        /* ─── Close icon ─────────────────────────────────────── */
        .pai-close-icon {
          animation: closeIn 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
      `}</style>

      <div className="pai-fab-root">

        {/* Side label — only when hovered and closed */}
        {!open && hovered && (
          <div className="pai-fab-label">
            <span className="pai-fab-label-badge">Physical AI</span>
            <span className="pai-fab-label-title">Ask the Textbook</span>
            <span className="pai-fab-label-sub">RAG-powered · Qdrant + Gemini</span>
          </div>
        )}

        {/* Button wrapper */}
        <div className="pai-fab-wrap">

          {/* Sonar rings — closed only */}
          {!open && (
            <>
              <div className="pai-sonar pai-sonar-1" />
              <div className="pai-sonar pai-sonar-2" />
            </>
          )}

          {/* Spinning halo border — closed only */}
          {!open && (
            <div className="pai-halo-wrap">
              <div className="pai-halo-inner" />
            </div>
          )}

          {/* Main button */}
          <button
            className={`pai-fab-btn${open ? ' is-open' : ''}`}
            onClick={() => setOpen(o => !o)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            aria-label={open ? 'Close chat' : 'Ask the Physical AI textbook assistant'}
          >
            {/* Glint sweep */}
            <div className="pai-fab-glint" />

            {/* Online dot — closed only */}
            {!open && <span className="pai-online-dot" />}

            {open ? (
              /* ── Close × ── */
              <span className="pai-close-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </span>
            ) : (
              /* ── Robot head icon ── */
              <div className="pai-robot-wrap">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Antenna base + stem */}
                  <rect x="17" y="2" width="2" height="6" rx="1" fill="#60a5fa" opacity="0.85"/>
                  {/* Antenna tip (glowing circle) */}
                  <circle className="pai-antenna-tip" cx="18" cy="2" r="2.2" fill="#fbbf24"
                    style={{ filter: 'drop-shadow(0 0 4px #fbbf24)' }}/>

                  {/* Head body — rounded rect */}
                  <rect x="6" y="8" width="24" height="18" rx="5" ry="5"
                    fill="url(#headGrad)" stroke="rgba(96,165,250,0.45)" strokeWidth="1"/>

                  {/* Inner head highlight */}
                  <rect x="7" y="9" width="22" height="7" rx="3"
                    fill="rgba(255,255,255,0.06)"/>

                  {/* Left eye */}
                  <circle className="pai-robot-eye" cx="13" cy="17" r="3.2"
                    fill="#0ea5e9" style={{ filter: 'drop-shadow(0 0 5px #38bdf8)' }}/>
                  <circle cx="13" cy="17" r="1.4" fill="white" opacity="0.9"/>
                  <circle cx="13.6" cy="16.4" r="0.55" fill="white"/>

                  {/* Right eye */}
                  <circle className="pai-robot-eye" cx="23" cy="17" r="3.2"
                    fill="#0ea5e9" style={{ filter: 'drop-shadow(0 0 5px #38bdf8)' }}/>
                  <circle cx="23" cy="17" r="1.4" fill="white" opacity="0.9"/>
                  <circle cx="23.6" cy="16.4" r="0.55" fill="white"/>

                  {/* Mouth — circuit-board style */}
                  <rect x="12" y="22.5" width="12" height="1.8" rx="0.9" fill="rgba(96,165,250,0.6)"/>
                  <rect x="14" y="21.5" width="1.5" height="3.8" rx="0.75" fill="rgba(96,165,250,0.4)"/>
                  <rect x="20.5" y="21.5" width="1.5" height="3.8" rx="0.75" fill="rgba(96,165,250,0.4)"/>

                  {/* Neck */}
                  <rect x="15" y="26" width="6" height="3" rx="1.5" fill="rgba(96,165,250,0.35)"/>

                  {/* Gold accent circuit nodes */}
                  <circle cx="8" cy="13" r="1" fill="#fbbf24" opacity="0.7"/>
                  <circle cx="28" cy="13" r="1" fill="#fbbf24" opacity="0.7"/>

                  <defs>
                    <linearGradient id="headGrad" x1="6" y1="8" x2="30" y2="26" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#1e3a8a"/>
                      <stop offset="60%" stopColor="#1e3470"/>
                      <stop offset="100%" stopColor="#0f172a"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            )}
          </button>

        </div>
      </div>

      <ChatPanel isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
