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
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
      {loading ? (
        <span className="actionPillLoading">Translating to Urdu…</span>
      ) : (
        <button onClick={handleTranslate} className="actionPillBtn actionPillBtn--outline">
          🌐 Translate to Urdu
        </button>
      )}
      {error && (
        <span style={{ color: '#e05555', fontSize: '0.72rem', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.02em' }}>
          {error}
        </span>
      )}
    </span>
  );
}
