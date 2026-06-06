import React, { useEffect, useState } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { authClient, UserSession } from '../../lib/auth-client';

const pill: React.CSSProperties = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.78rem',
  fontWeight: 500,
  letterSpacing: '0.06em',
  color: '#ffffff',
  background: 'transparent',
  border: '1px solid rgba(91, 154, 255, 0.25)',
  borderRadius: '3px',
  padding: '0.28rem 0.85rem',
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'inline-block',
  lineHeight: '1.4',
  transition: 'color 0.18s, border-color 0.18s, background 0.18s',
  whiteSpace: 'nowrap',
};

const emailText: React.CSSProperties = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.78rem',
  letterSpacing: '0.02em',
  color: '#ffffff',
  maxWidth: '130px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const hoverIn = (e: React.MouseEvent<HTMLElement>) => {
  const el = e.currentTarget as HTMLElement;
  el.style.color = '#5b9aff';
  el.style.borderColor = 'rgba(91,154,255,0.6)';
  el.style.background = 'rgba(91,154,255,0.06)';
};

const hoverOut = (e: React.MouseEvent<HTMLElement>) => {
  const el = e.currentTarget as HTMLElement;
  el.style.color = '#ffffff';
  el.style.borderColor = 'rgba(91,154,255,0.25)';
  el.style.background = 'transparent';
};

export function AuthButton(): React.ReactElement {
  const signinUrl = useBaseUrl('/signin');
  const signupUrl = useBaseUrl('/signup');
  const homeUrl = useBaseUrl('/');
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    setReturning(authClient.hasAccount());
    const cached = authClient.getCachedUser();
    if (cached) { setSession(cached); setLoading(false); }
    authClient.getSession().then((s) => { setSession(s); setLoading(false); });
  }, []);

  if (loading) return <span style={{ ...emailText, opacity: 0.3, marginLeft: '0.5rem' }}>···</span>;

  if (session) {
    return (
      <>
        <span style={{ ...emailText, marginLeft: '0.25rem' }} title={session.email}>
          {session.email}
        </span>
        <button
          style={pill}
          onClick={() => { authClient.signOut(); setSession(null); window.location.href = homeUrl; }}
          onMouseEnter={hoverIn}
          onMouseLeave={hoverOut}
        >
          Sign Out
        </button>
      </>
    );
  }

  if (returning) {
    return (
      <a href={signinUrl} style={pill} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
        Sign In
      </a>
    );
  }

  return (
    <a href={signupUrl} style={pill} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
      Sign Up
    </a>
  );
}
