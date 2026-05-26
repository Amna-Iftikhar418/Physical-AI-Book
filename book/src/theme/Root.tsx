import React, { useState, useEffect } from 'react';
import { ChatPanel } from '../components/ChatWidget/ChatPanel';
import { SelectionButton } from '../components/ChatWidget/SelectionButton';

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

function getChapterIdFromPath(): string | undefined {
  const match = window.location.pathname.match(/\/docs\/(.+)/);
  return match ? match[1] : undefined;
}

export default function Root({ children }: { children: React.ReactNode }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [prefillText, setPrefillText] = useState<string | undefined>();
  const [prefillChapterId, setPrefillChapterId] = useState<string | undefined>();
  const [useSelectEndpoint, setUseSelectEndpoint] = useState(false);

  const [selectionPos, setSelectionPos] = useState<{ x: number; y: number } | null>(null);
  const [pendingText, setPendingText] = useState('');
  const [pendingChapterId, setPendingChapterId] = useState<string | undefined>();

  useEffect(() => {
    function handleMouseUp() {
      setTimeout(() => {
        const sel = window.getSelection();
        const text = sel?.toString().trim() ?? '';
        if (text.length >= 10 && sel && sel.rangeCount > 0) {
          const rect = sel.getRangeAt(0).getBoundingClientRect();
          setPendingText(text);
          setPendingChapterId(getChapterIdFromPath());
          setSelectionPos({ x: rect.left + rect.width / 2, y: rect.top });
        } else {
          setSelectionPos(null);
        }
      }, 10);
    }

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  function handleAskAboutThis() {
    setPrefillText(pendingText);
    setPrefillChapterId(pendingChapterId);
    setUseSelectEndpoint(!!pendingChapterId);
    setChatOpen(true);
    setSelectionPos(null);
  }

  function handleFabClick() {
    if (chatOpen) {
      setChatOpen(false);
    } else {
      setPrefillText(undefined);
      setPrefillChapterId(undefined);
      setUseSelectEndpoint(false);
      setChatOpen(true);
    }
    setSelectionPos(null);
  }

  return (
    <>
      {children}
      {selectionPos && (
        <SelectionButton
          x={selectionPos.x}
          y={selectionPos.y}
          onClick={handleAskAboutThis}
        />
      )}
      <button
        style={FAB_STYLE}
        onClick={handleFabClick}
        aria-label={chatOpen ? 'Close chat' : 'Open chat'}
        title="Ask the textbook"
      >
        {chatOpen ? '✕' : '💬'}
      </button>
      <ChatPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        prefillText={prefillText}
        prefillChapterId={prefillChapterId}
        useSelectEndpoint={useSelectEndpoint}
      />
    </>
  );
}
