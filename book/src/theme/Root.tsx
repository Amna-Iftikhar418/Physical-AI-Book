import React, { useState, useEffect } from 'react';
import siteConfig from '@generated/docusaurus.config';
import { ChatPanel } from '../components/ChatWidget/ChatPanel';
import { SelectionButton } from '../components/ChatWidget/SelectionButton';


// Docs are served at the site root (routeBasePath '/'), under baseUrl
// (e.g. '/Physical-AI-Book/'). Strip baseUrl to recover the chapter_id,
// which matches the manifest/Qdrant keys (e.g. 'module-1-ros2/week-1-2-foundations').
// Landing pages resolve to '/module-x/'; the backend maps the bare path to
// '<path>/index' when an exact match yields no chunks.
function getChapterIdFromPath(): string | undefined {
  const baseUrl = siteConfig.baseUrl || '/';
  let path = window.location.pathname;
  if (path.startsWith(baseUrl)) {
    path = path.slice(baseUrl.length);
  }
  path = path.replace(/^\/+/, '').replace(/\/+$/, '');
  return path === '' ? 'intro' : path;
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
        className="chatFab"
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
