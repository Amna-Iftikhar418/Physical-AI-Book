import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { postChat, postChatSelect, ChatResponse, SourceRef } from '../../lib/api-client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceRef[];
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  prefillText?: string;
  prefillChapterId?: string;
  useSelectEndpoint?: boolean;
}

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

  // Pre-fill input when opened with selected text
  useEffect(() => {
    if (isOpen && prefillText) {
      setInput(prefillText);
    }
  }, [isOpen, prefillText]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    const query = input.trim();
    if (!query || loading) return;

    setInput('');
    setError(null);
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setLoading(true);

    try {
      let response: ChatResponse;
      if (useSelectEndpoint && prefillChapterId) {
        response = await postChatSelect({
          query,
          session_id: sessionId,
          chapter_id: prefillChapterId,
        });
      } else {
        response = await postChat({
          query,
          session_id: sessionId,
          chapter_id: prefillChapterId,
        });
      }
      setSessionId(response.session_id);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response.answer, sources: response.sources },
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
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
    <div style={styles.panel}>
      {/* Header */}
      <div style={styles.header}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>Ask the Textbook</span>
        <button onClick={onClose} style={styles.closeBtn} aria-label="Close chat">✕</button>
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {messages.length === 0 && (
          <p style={styles.placeholder}>Ask any question about the Physical AI textbook.</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={msg.role === 'user' ? styles.userMsg : styles.assistantMsg}>
            <ReactMarkdown>{msg.content}</ReactMarkdown>
            {msg.sources && msg.sources.length > 0 && (
              <div style={styles.sources}>
                <small>Sources: {msg.sources.map(s => s.chapter_id).join(', ')}</small>
              </div>
            )}
          </div>
        ))}
        {loading && <div style={styles.assistantMsg}>⏳ Thinking…</div>}
        {error && <div style={styles.errorMsg}>⚠ {error}</div>}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={styles.inputRow}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question… (Enter to send)"
          style={styles.textarea}
          rows={2}
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading || !input.trim()} style={styles.sendBtn}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    position: 'fixed',
    bottom: 80,
    right: 20,
    width: 320,
    height: 480,
    background: 'var(--ifm-background-surface-color, #fff)',
    border: '1px solid var(--ifm-color-emphasis-300, #ddd)',
    borderRadius: 12,
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 9999,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    background: 'var(--ifm-color-primary, #0969da)',
    color: '#fff',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 16,
    lineHeight: 1,
    padding: 0,
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  placeholder: {
    color: 'var(--ifm-color-emphasis-600, #888)',
    fontSize: 13,
    margin: 0,
  },
  userMsg: {
    alignSelf: 'flex-end',
    background: 'var(--ifm-color-primary, #0969da)',
    color: '#fff',
    borderRadius: '12px 12px 2px 12px',
    padding: '8px 12px',
    maxWidth: '80%',
    fontSize: 13,
  },
  assistantMsg: {
    alignSelf: 'flex-start',
    background: 'var(--ifm-color-emphasis-100, #f3f4f6)',
    borderRadius: '2px 12px 12px 12px',
    padding: '8px 12px',
    maxWidth: '90%',
    fontSize: 13,
  },
  errorMsg: {
    alignSelf: 'center',
    color: 'var(--ifm-color-danger, #d73a49)',
    fontSize: 12,
  },
  sources: {
    marginTop: 4,
    opacity: 0.6,
  },
  inputRow: {
    display: 'flex',
    gap: 6,
    padding: '8px 10px',
    borderTop: '1px solid var(--ifm-color-emphasis-200, #eee)',
  },
  textarea: {
    flex: 1,
    resize: 'none',
    borderRadius: 8,
    border: '1px solid var(--ifm-color-emphasis-300, #ddd)',
    padding: '6px 8px',
    fontSize: 13,
    background: 'var(--ifm-background-color, #fff)',
    color: 'var(--ifm-font-color-base, #000)',
  },
  sendBtn: {
    padding: '6px 12px',
    borderRadius: 8,
    background: 'var(--ifm-color-primary, #0969da)',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    alignSelf: 'flex-end',
  },
};
