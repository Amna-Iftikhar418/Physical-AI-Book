import React, { useEffect, useState } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { authClient, UserSession } from '../../lib/auth-client';

export function AuthButton(): React.ReactElement {
  const signinUrl = useBaseUrl('/signin');
  const signupUrl = useBaseUrl('/signup');
  const homeUrl = useBaseUrl('/');
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = authClient.getCachedUser();
    if (cached) {
      setSession(cached);
      setLoading(false);
    }
    authClient.getSession().then((s) => {
      setSession(s);
      setLoading(false);
    });
  }, []);

  if (loading) return <span style={{ fontSize: 14, opacity: 0.7 }}>...</span>;

  if (session) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13, opacity: 0.9 }}>{session.email}</span>
        <button
          onClick={() => {
            authClient.signOut();
            setSession(null);
            window.location.href = homeUrl;
          }}
          style={{
            fontSize: 13,
            padding: '4px 10px',
            borderRadius: 4,
            border: '1px solid currentColor',
            background: 'transparent',
            cursor: 'pointer',
            color: 'inherit',
          }}
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <a
        href={signinUrl}
        style={{ fontSize: 13, textDecoration: 'none', color: 'inherit', opacity: 0.9 }}
      >
        Sign In
      </a>
      <a
        href={signupUrl}
        style={{
          fontSize: 13,
          padding: '4px 10px',
          borderRadius: 4,
          border: '1px solid currentColor',
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        Sign Up
      </a>
    </div>
  );
}
