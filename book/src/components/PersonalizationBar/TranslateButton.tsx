import React, { useEffect, useState } from 'react';
import siteConfig from '@generated/docusaurus.config';
import { authClient, type UserSession } from '@site/src/lib/auth-client';

const BASE_URL = (
  (siteConfig.customFields?.apiUrl as string | undefined) ?? 'http://localhost:8000'
).replace(/\/$/, '');

interface Props {
  docId: string;
  onTranslate: (text: string) => void;
}

export default function TranslateButton({ docId, onTranslate }: Props): React.ReactElement | null {
  const [user, setUser] = useState<UserSession | null>(authClient.getCachedUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authClient.getSession().then(setUser);
  }, []);

  if (!user) return null;

  async function handleTranslate() {
    setLoading(true);
    setError(null);
    try {
      const token = authClient.getToken();
      const res = await fetch(`${BASE_URL}/api/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify({ chapter_id: docId }),
        signal: AbortSignal.timeout(60_000),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`${res.status}: ${text}`);
      }
      const data = (await res.json()) as { translated_text: string };
      onTranslate(data.translated_text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        marginBottom: '1.5rem',
        padding: '0.75rem 1rem',
        background: 'var(--ifm-color-warning-lightest, #fff8e1)',
        borderRadius: '8px',
        borderLeft: '4px solid var(--ifm-color-warning, #f0a500)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap',
      }}
    >
      {loading ? (
        <span style={{ fontStyle: 'italic', color: 'var(--ifm-color-warning-dark, #b07800)', fontSize: '0.95rem' }}>
          ⏳ Translating to Urdu…
        </span>
      ) : (
        <button
          onClick={handleTranslate}
          style={{
            background: 'var(--ifm-color-warning, #f0a500)',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '0.45rem 1.1rem',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.95rem',
          }}
        >
          🌐 Translate to Urdu
        </button>
      )}
      {error && (
        <span style={{ color: 'var(--ifm-color-danger, #e53e3e)', fontSize: '0.875rem' }}>
          {error}
        </span>
      )}
    </div>
  );
}
