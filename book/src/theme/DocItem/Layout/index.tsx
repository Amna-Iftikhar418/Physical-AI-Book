import React, { useState } from 'react';
import OriginalLayout from '@theme-original/DocItem/Layout';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import ReactMarkdown from 'react-markdown';
import PersonalizeButton from '@site/src/components/PersonalizationBar/PersonalizeButton';

export default function DocItemLayout(props: Record<string, unknown>): React.ReactElement {
  const { metadata } = useDoc();
  const [personalizedContent, setPersonalizedContent] = useState<string | null>(null);

  return (
    <>
      <PersonalizeButton docId={metadata.id} onPersonalize={setPersonalizedContent} />
      {personalizedContent ? (
        <div style={{ maxWidth: '100%' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem',
              padding: '0.5rem 0.75rem',
              background: 'var(--ifm-color-success-lightest, #e6f4ea)',
              borderRadius: '6px',
              borderLeft: '4px solid var(--ifm-color-success, #28a745)',
            }}
          >
            <span style={{ fontWeight: 600, color: 'var(--ifm-color-success, #28a745)', fontSize: '0.95rem' }}>
              ✅ Personalized for your skill level
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
              ↩ Back to original
            </button>
          </div>
          <div className="markdown">
            <ReactMarkdown>{personalizedContent}</ReactMarkdown>
          </div>
        </div>
      ) : (
        <OriginalLayout {...props} />
      )}
    </>
  );
}
