import React, { useEffect, useState } from 'react';
import siteConfig from '@generated/docusaurus.config';
import { authClient, type UserSession } from '@site/src/lib/auth-client';

const BASE_URL = (
  (siteConfig.customFields?.apiUrl as string | undefined) ?? 'http://localhost:8000'
).replace(/\/$/, '');

interface Props {
  docId: string;
  onPersonalize: (text: string) => void;
}

export default function PersonalizeButton({ docId, onPersonalize }: Props): React.ReactElement | null {
  const [user, setUser] = useState<UserSession | null>(authClient.getCachedUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authClient.getSession().then(setUser);
  }, []);

  if (!user) return null;

  async function handlePersonalize() {
    setLoading(true);
    setError(null);
    try {
      const token = authClient.getToken();
      const res = await fetch(`${BASE_URL}/api/personalize`, {
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
      const data = (await res.json()) as { personalized_text: string };
      onPersonalize(data.personalized_text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Personalization failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        marginBottom: '1.5rem',
        padding: '0.75rem 1rem',
        background: 'var(--ifm-color-primary-lightest, #e8f4fd)',
        borderRadius: '8px',
        borderLeft: '4px solid var(--ifm-color-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap',
      }}
    >
      {loading ? (
        <span style={{ fontStyle: 'italic', color: 'var(--ifm-color-primary)', fontSize: '0.95rem' }}>
          ⏳ Personalizing for your level…
        </span>
      ) : (
        <button
          onClick={handlePersonalize}
          style={{
            background: 'var(--ifm-color-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '0.45rem 1.1rem',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.95rem',
          }}
        >
          ✨ Personalize for Me
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
