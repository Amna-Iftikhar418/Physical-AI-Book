import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { postChat, postChatSelect, ChatResponse, SourceRef } from '../../lib/api-client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceRef[];
  ts?: number;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  prefillText?: string;
  prefillChapterId?: string;
  useSelectEndpoint?: boolean;
}

const SUGGESTED = [
  'What is Physical AI?',
  'Explain humanoid robot locomotion',
  'How does ROS 2 work?',
  'What sensors do robots use?',
];

export function ChatPanel({
  isOpen,
  onClose,
  prefillText,
  prefillChapterId,
  useSelectEndpoint,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && prefillText) setInput(prefillText);
  }, [isOpen, prefillText]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => textareaRef.current?.focus(), 120);
  }, [isOpen]);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }

  async function handleSend() {
    const query = input.trim();
    if (!query || loading) return;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setError(null);
    setMessages(prev => [...prev, { role: 'user', content: query, ts: Date.now() }]);
    setLoading(true);
    try {
      let response: ChatResponse;
      if (useSelectEndpoint && prefillChapterId) {
        response = await postChatSelect({ query, session_id: sessionId, chapter_id: prefillChapterId });
      } else {
        response = await postChat({ query, session_id: sessionId, chapter_id: prefillChapterId });
      }
      setSessionId(response.session_id);
      setMessages(prev => [...prev, { role: 'assistant', content: response.answer, sources: response.sources, ts: Date.now() }]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Connection error — please retry.');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes panelIn {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
          30%            { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .chat-panel-scroll::-webkit-scrollbar { width: 4px; }
        .chat-panel-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-panel-scroll::-webkit-scrollbar-thumb { background: rgba(91,154,255,0.25); border-radius: 4px; }
        .chat-panel-scroll::-webkit-scrollbar-thumb:hover { background: rgba(91,154,255,0.45); }
        .chat-msg-assistant p { margin: 0 0 8px; line-height: 1.6; }
        .chat-msg-assistant p:last-child { margin-bottom: 0; }
        .chat-msg-assistant ul, .chat-msg-assistant ol { margin: 4px 0 8px 16px; padding: 0; }
        .chat-msg-assistant li { margin-bottom: 4px; line-height: 1.55; }
        .chat-msg-assistant code { background: rgba(91,154,255,0.12); border: 1px solid rgba(91,154,255,0.2); border-radius: 4px; padding: 1px 5px; font-size: 12px; color: #93c5fd; }
        .chat-msg-assistant pre { background: rgba(0,0,0,0.4); border: 1px solid rgba(91,154,255,0.15); border-radius: 8px; padding: 10px 12px; overflow-x: auto; margin: 6px 0; }
        .chat-msg-assistant pre code { background: none; border: none; padding: 0; color: #e2e8f0; font-size: 12px; }
        .chat-msg-assistant strong { color: #fbbf24; }
        .chat-msg-assistant h1,.chat-msg-assistant h2,.chat-msg-assistant h3 { color: #fbbf24; margin: 8px 0 4px; font-size: 14px; }
        .chat-send-btn:hover:not(:disabled) { background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%) !important; transform: scale(1.05); }
        .chat-send-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .chat-suggest-chip:hover { background: rgba(91,154,255,0.18) !important; border-color: rgba(91,154,255,0.5) !important; }
        .chat-source-chip { display: inline-flex; align-items: center; gap: 4px; background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.25); border-radius: 20px; padding: 2px 8px; font-size: 10.5px; color: #fbbf24; margin: 2px 2px 0; cursor: default; }
        .chat-textarea { scrollbar-width: thin; scrollbar-color: rgba(91,154,255,0.2) transparent; }
        .chat-header-pulse { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; position: relative; }
        .chat-header-pulse::after { content: ''; position: absolute; inset: -2px; border-radius: 50%; background: rgba(34,197,94,0.3); animation: pulseRing 2s ease-out infinite; }
        @keyframes pulseRing { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2.2); opacity: 0; } }

        /* ── Responsive chat panel ── */
        .chat-panel {
          position: fixed;
          bottom: 88px;
          right: 20px;
          /* min() ensures panel never exceeds viewport even at the 390px fixed size */
          width: min(390px, calc(100vw - 40px));
          height: 580px;
          /* Hard overflow guard: internal content must never push the panel wider */
          overflow: hidden;
        }
        @media (max-width: 768px) {
          .chat-panel {
            width: min(390px, calc(100vw - 2rem));
            right: 1rem;
          }
        }
        @media (max-width: 640px) {
          .chat-panel {
            width: calc(100vw - 2rem);
            height: calc(100svh - 7rem);
            max-height: 580px;
            right: 1rem;
            bottom: 5.5rem;
          }
        }
        @media (max-width: 460px) {
          .chat-panel {
            width: calc(100vw - 1.5rem);
            height: calc(100svh - 6.5rem);
            max-height: 560px;
            right: 0.75rem;
            bottom: 5rem;
          }
        }
        @media (max-width: 360px) {
          .chat-panel {
            width: calc(100vw - 1rem);
            right: 0.5rem;
            height: calc(100svh - 6rem);
          }
        }
      `}</style>

      <div className="chat-panel" style={{
        display: 'flex',
        flexDirection: 'column',
        zIndex: 9999,
        borderRadius: 20,
        overflow: 'hidden',
        background: 'rgba(10, 12, 22, 0.97)',
        border: '1px solid rgba(91,154,255,0.18)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)',
        backdropFilter: 'blur(24px)',
        animation: 'panelIn 0.28s cubic-bezier(0.34,1.56,0.64,1)',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 16px',
          background: 'linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(91,154,255,0.06) 100%)',
          borderBottom: '1px solid rgba(91,154,255,0.12)',
          flexShrink: 0,
        }}>
          {/* Bot avatar */}
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="8" width="18" height="12" rx="3" stroke="#fff" strokeWidth="1.6"/>
              <circle cx="9" cy="14" r="2" fill="#fff"/>
              <circle cx="15" cy="14" r="2" fill="#fff"/>
              <path d="M12 3v5M9 3h6" stroke="#93c5fd" strokeWidth="1.6" strokeLinecap="round"/>
              <rect x="9" y="2" width="6" height="2.5" rx="1.25" fill="#93c5fd"/>
            </svg>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: '#f1f5f9', letterSpacing: 0.1 }}>
              Physical AI Assistant
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <div className="chat-header-pulse" />
              <span style={{ fontSize: 11, color: '#94a3b8' }}>Online · Powered by Gemini</span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close chat"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              color: '#94a3b8',
              cursor: 'pointer',
              width: 44,
              height: 44,
              minWidth: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background 0.15s, color 0.15s',
              touchAction: 'manipulation',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLButtonElement).style.color = '#f1f5f9'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div
          className="chat-panel-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {messages.length === 0 && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: 'auto 0', paddingBottom: 8 }}>
              {/* Welcome */}
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
                boxShadow: '0 8px 24px rgba(59,130,246,0.35)',
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="8" width="18" height="12" rx="3" stroke="#fff" strokeWidth="1.6"/>
                  <circle cx="9" cy="14" r="2" fill="#fff"/>
                  <circle cx="15" cy="14" r="2" fill="#fff"/>
                  <path d="M12 3v5" stroke="#93c5fd" strokeWidth="1.6" strokeLinecap="round"/>
                  <rect x="9" y="2" width="6" height="2.5" rx="1.25" fill="#93c5fd"/>
                </svg>
              </div>
              <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15, margin: '0 0 4px', textAlign: 'center' }}>
                Ask me anything
              </p>
              <p style={{ color: '#64748b', fontSize: 12.5, margin: '0 0 18px', textAlign: 'center', lineHeight: 1.5 }}>
                I'm trained on the Physical AI & Humanoid Robotics textbook
              </p>
              {/* Suggested chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                {SUGGESTED.map(q => (
                  <button
                    key={q}
                    className="chat-suggest-chip"
                    onClick={() => { setInput(q); textareaRef.current?.focus(); }}
                    style={{
                      background: 'rgba(91,154,255,0.08)',
                      border: '1px solid rgba(91,154,255,0.2)',
                      borderRadius: 20,
                      color: '#93c5fd',
                      fontSize: 11.5,
                      padding: '5px 11px',
                      cursor: 'pointer',
                      transition: 'background 0.15s, border-color 0.15s',
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-end',
                gap: 8,
                animation: 'msgIn 0.22s ease',
              }}
            >
              {/* Avatar dot */}
              <div style={{
                width: 26,
                height: 26,
                borderRadius: msg.role === 'user' ? '50%' : 8,
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, #2563eb 0%, #5b9aff 100%)'
                  : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                border: msg.role === 'assistant' ? '1px solid rgba(91,154,255,0.2)' : 'none',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                color: '#fff',
              }}>
                {msg.role === 'user' ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="9" width="16" height="11" rx="2.5" stroke="#93c5fd" strokeWidth="1.6"/>
                    <circle cx="9" cy="14.5" r="1.5" fill="#93c5fd"/>
                    <circle cx="15" cy="14.5" r="1.5" fill="#93c5fd"/>
                    <path d="M12 4v5" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                )}
              </div>

              <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div
                  className={msg.role === 'assistant' ? 'chat-msg-assistant' : undefined}
                  style={{
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)'
                      : 'rgba(20,24,40,0.9)',
                    color: msg.role === 'user' ? '#fff' : '#cbd5e1',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                    padding: '9px 13px',
                    fontSize: 13,
                    lineHeight: 1.6,
                    border: msg.role === 'assistant' ? '1px solid rgba(91,154,255,0.12)' : 'none',
                    boxShadow: msg.role === 'user'
                      ? '0 4px 16px rgba(37,99,235,0.3)'
                      : '0 2px 8px rgba(0,0,0,0.3)',
                  }}
                >
                  {msg.role === 'user' ? (
                    <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
                  ) : (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  )}
                </div>

                {msg.sources && msg.sources.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, paddingLeft: 2 }}>
                    {msg.sources.map((s, si) => (
                      <span key={si} className="chat-source-chip">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.8 }}>
                          <path d="M9 4.5a.75.75 0 0 1 .75.75v.751a5.25 5.25 0 0 1 4.5 5.249v.75a3 3 0 0 1-3 3h-4.5a3 3 0 0 1-3-3v-.75a5.25 5.25 0 0 1 4.5-5.249V5.25A.75.75 0 0 1 9 4.5z"/>
                        </svg>
                        {s.chapter_id}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, animation: 'msgIn 0.2s ease' }}>
              <div style={{
                width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                border: '1px solid rgba(91,154,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="9" width="16" height="11" rx="2.5" stroke="#93c5fd" strokeWidth="1.6"/>
                  <circle cx="9" cy="14.5" r="1.5" fill="#93c5fd"/>
                  <circle cx="15" cy="14.5" r="1.5" fill="#93c5fd"/>
                  <path d="M12 4v5" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={{
                background: 'rgba(20,24,40,0.9)',
                border: '1px solid rgba(91,154,255,0.12)',
                borderRadius: '4px 16px 16px 16px',
                padding: '11px 16px',
                display: 'flex',
                gap: 5,
                alignItems: 'center',
              }}>
                {[0, 1, 2].map(n => (
                  <div key={n} style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#5b9aff',
                    animation: `dot 1.2s ease-in-out ${n * 0.18}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(220,38,38,0.08)',
              border: '1px solid rgba(220,38,38,0.25)',
              borderRadius: 10,
              padding: '8px 12px',
              fontSize: 12,
              color: '#fca5a5',
              animation: 'msgIn 0.2s ease',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div style={{
          padding: '10px 12px 12px',
          borderTop: '1px solid rgba(91,154,255,0.1)',
          background: 'rgba(8,10,20,0.6)',
          flexShrink: 0,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 8,
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${loading ? 'rgba(91,154,255,0.25)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 14,
            padding: '8px 8px 8px 12px',
            transition: 'border-color 0.2s',
          }}>
            <textarea
              ref={textareaRef}
              className="chat-textarea"
              value={input}
              onChange={e => { setInput(e.target.value); autoResize(); }}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about Physical AI…"
              rows={1}
              disabled={loading}
              style={{
                flex: 1,
                resize: 'none',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#e2e8f0',
                fontSize: 13.5,
                lineHeight: 1.55,
                fontFamily: 'inherit',
                padding: 0,
                minHeight: 22,
                maxHeight: 120,
                overflow: 'auto',
              }}
            />
            <button
              className="chat-send-btn"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              style={{
                width: 44,
                height: 44,
                minWidth: 44,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(59,130,246,0.35)',
                transition: 'background 0.15s, transform 0.15s, box-shadow 0.15s',
                touchAction: 'manipulation',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <p style={{ margin: '6px 4px 0', fontSize: 10.5, color: '#475569', textAlign: 'center' }}>
            Enter to send · Shift+Enter for newline
          </p>
        </div>
      </div>
    </>
  );
}
