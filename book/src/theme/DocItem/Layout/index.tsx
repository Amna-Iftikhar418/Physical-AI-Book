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
          <div className={`docOverrideBanner ${isTranslated ? 'docOverrideBanner--urdu' : 'docOverrideBanner--personalized'}`}>
            <div className="docOverrideBanner__icon">
              {isTranslated ? '🌐' : '✨'}
            </div>
            <div className="docOverrideBanner__content">
              <span className="docOverrideBanner__label">
                {isTranslated ? 'Translated to Urdu' : 'Personalized for your skill level'}
              </span>
              <span className="docOverrideBanner__sub">
                {isTranslated
                  ? 'Showing AI-generated Urdu translation'
                  : 'Content adapted to your background'}
              </span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="docOverrideBanner__reset"
            >
              {isTranslated ? 'Switch to English' : 'Back to original'}
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
