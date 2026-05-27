import React, { useState } from 'react';
import OriginalLayout from '@theme-original/DocItem/Layout';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import ReactMarkdown from 'react-markdown';
import { DocOverrideContext } from '@site/src/lib/doc-override-context';

type OverrideMode = 'personalized' | 'translated' | null;

export default function DocItemLayout(props: Record<string, unknown>): React.ReactElement {
  const { metadata } = useDoc();
  const [overrideContent, setOverrideContent] = useState<string | null>(null);
  const [overrideMode, setOverrideMode] = useState<OverrideMode>(null);

  function handlePersonalize(text: string) {
    setOverrideContent(text);
    setOverrideMode('personalized');
  }

  function handleTranslate(text: string) {
    setOverrideContent(text);
    setOverrideMode('translated');
  }

  const isTranslated = overrideMode === 'translated';

  return (
    <DocOverrideContext.Provider value={{ handlePersonalize, handleTranslate, docId: metadata.id }}>
      {overrideContent ? (
        <div style={{ maxWidth: '100%' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem',
              padding: '0.5rem 0.75rem',
              background: isTranslated
                ? 'var(--ifm-color-warning-lightest, #fff8e1)'
                : 'var(--ifm-color-success-lightest, #e6f4ea)',
              borderRadius: '6px',
              borderLeft: `4px solid ${
                isTranslated
                  ? 'var(--ifm-color-warning, #f0a500)'
                  : 'var(--ifm-color-success, #28a745)'
              }`,
            }}
          >
            <span
              style={{
                fontWeight: 600,
                color: isTranslated
                  ? 'var(--ifm-color-warning-dark, #b07800)'
                  : 'var(--ifm-color-success, #28a745)',
                fontSize: '0.95rem',
              }}
            >
              {isTranslated ? '🌐 Translated to Urdu' : '✅ Personalized for your skill level'}
            </span>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'transparent',
                border: '1px solid var(--ifm-color-primary)',
                color: 'var(--ifm-color-primary)',
                borderRadius: '4px',
                padding: '0.25rem 0.75rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              {isTranslated ? '🔄 Switch to English' : '↩ Back to original'}
            </button>
          </div>
          <div className="markdown">
            <ReactMarkdown>{overrideContent}</ReactMarkdown>
          </div>
        </div>
      ) : (
        <OriginalLayout {...props} />
      )}
    </DocOverrideContext.Provider>
  );
}
