import React, { useState } from 'react';
import Layout from '@theme/Layout';
import { authClient } from '../lib/auth-client';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function SigninPage(): React.ReactElement {
  const homeUrl = useBaseUrl('/');
  const signupUrl = useBaseUrl('/signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authClient.signIn({ email, password });
      window.location.href = homeUrl;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg.includes('401') ? 'Invalid email or password.' : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout title="Sign In" description="Sign in to your Physical AI account">
      <main style={{ maxWidth: 420, margin: '80px auto', padding: '0 20px' }}>
        <h1>Sign In</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label>
            <div style={{ marginBottom: 4, fontWeight: 600 }}>Email</div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </label>
          <label>
            <div style={{ marginBottom: 4, fontWeight: 600 }}>Password</div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </label>
          {error && (
            <div style={{ color: '#c0392b', background: '#fdecea', padding: '10px 14px', borderRadius: 6 }}>
              {error}
            </div>
          )}
          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p style={{ marginTop: 20, opacity: 0.7 }}>
          No account yet?{' '}
          <a href={signupUrl}>Sign up</a>
        </p>
      </main>
    </Layout>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 6,
  border: '1px solid var(--ifm-color-emphasis-300, #ccc)',
  fontSize: 15,
  background: 'var(--ifm-background-color, #fff)',
  color: 'var(--ifm-font-color-base, #000)',
  boxSizing: 'border-box',
};

const btnStyle: React.CSSProperties = {
  padding: '10px 20px',
  borderRadius: 6,
  border: 'none',
  background: 'var(--ifm-color-primary, #0969da)',
  color: '#fff',
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
};
