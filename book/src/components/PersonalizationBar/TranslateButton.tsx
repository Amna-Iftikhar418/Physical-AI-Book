import React, { useEffect, useState } from 'react';
import siteConfig from '@generated/docusaurus.config';
import { authClient, type UserSession } from '@site/src/lib/auth-client';
import AiErrorBanner, { type AiErrorKind } from './AiErrorBanner';

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
  const [error, setError] = useState<AiErrorKind | null>(null);

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
        signal: AbortSignal.timeout(90_000),
      });
      if (!res.ok) {
        if (res.status === 429) { setError('quota'); return; }
        setError('generic');
        return;
      }
      const data = (await res.json()) as { translated_text: string };
      onTranslate(data.translated_text);
    } catch (err) {
      if (err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError')) {
        setError('timeout');
      } else {
        setError('generic');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.4rem' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        {loading ? (
          <span style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span className="actionPillLoading">Translating to Urdu…</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--ifm-color-emphasis-600)', fontFamily: "'Outfit', sans-serif" }}>
              First load takes ~15–30s · instant after that
            </span>
          </span>
        ) : (
          <button onClick={handleTranslate} className="actionPillBtn actionPillBtn--outline">
            🌐 Translate to Urdu
          </button>
        )}
      </span>
      {error && <AiErrorBanner kind={error} onDismiss={() => setError(null)} />}
    </span>
  );
}
