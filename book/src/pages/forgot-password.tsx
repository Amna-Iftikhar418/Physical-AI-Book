import React, { useState } from 'react';
import Layout from '@theme/Layout';
import { authClient } from '../lib/auth-client';
import useBaseUrl from '@docusaurus/useBaseUrl';

type Step = 'email' | 'newPassword' | 'done';

export default function ForgotPasswordPage(): React.ReactElement {
  const signinUrl = useBaseUrl('/signin');
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email.'); return; }
    setStep('newPassword');
  }

  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await authClient.resetPassword(email, password);
      setStep('done');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('404')) {
        setError('No account found with that email. Check the address and try again.');
        setStep('email');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout title="Reset Password" description="Reset your Physical AI account password">
      <div style={pageWrap}>
        <div style={{ ...orb, top: '15%', left: '20%', width: 320, height: 320, animationDelay: '0s' }} />
        <div style={{ ...orb, bottom: '20%', right: '18%', width: 240, height: 240, background: 'radial-gradient(circle, rgba(91,154,255,0.06) 0%, transparent 70%)', animationDelay: '1.5s' }} />

        <div style={card}>
          <div style={brandRow}>
            <span style={brandDot} />
            <span style={brandText}>Physical AI</span>
          </div>

          {step === 'email' && (
            <>
              <h1 style={heading}>Reset password</h1>
              <p style={sub}>Enter your account email to continue</p>
              <form onSubmit={handleEmailSubmit} style={form}>
                <Field label="Email">
                  <input
                    type="email"
                    required
                    value={email}
                    placeholder="you@example.com"
                    style={input}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={focusIn}
                    onBlur={focusOut}
                  />
                </Field>
                {error && <ErrorBox message={error} />}
                <button type="submit" style={submitBtn} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
                  Continue →
                </button>
              </form>
            </>
          )}

          {step === 'newPassword' && (
            <>
              <h1 style={heading}>New password</h1>
              <p style={sub}>Set a new password for <strong style={{ color: '#96c4ff' }}>{email}</strong></p>
              <form onSubmit={handleResetSubmit} style={form}>
                <Field label="New Password">
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={password}
                      placeholder="Min. 8 characters"
                      style={{ ...input, paddingRight: '3rem' }}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={focusIn}
                      onBlur={focusOut}
                    />
                    <button type="button" style={eyeBtn} onClick={() => setShowPass((v) => !v)} tabIndex={-1}>
                      <EyeIcon open={showPass} />
                    </button>
                  </div>
                </Field>

                <Field label="Confirm Password">
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      required
                      value={confirm}
                      placeholder="Re-enter password"
                      style={{ ...input, paddingRight: '3rem', borderColor: confirm && confirm !== password ? 'rgba(239,68,68,0.5)' : undefined }}
                      onChange={(e) => setConfirm(e.target.value)}
                      onFocus={focusIn}
                      onBlur={focusOut}
                    />
                    <button type="button" style={eyeBtn} onClick={() => setShowConfirm((v) => !v)} tabIndex={-1}>
                      <EyeIcon open={showConfirm} />
                    </button>
                  </div>
                  {confirm && confirm !== password && (
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.75rem', color: '#ff8080', marginTop: '0.2rem' }}>
                      Passwords do not match
                    </span>
                  )}
                </Field>

                {error && <ErrorBox message={error} />}

                <button
                  type="submit"
                  disabled={loading}
                  style={{ ...submitBtn, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                  onMouseEnter={(e) => { if (!loading) hoverIn(e); }}
                  onMouseLeave={hoverOut}
                >
                  {loading ? <Spinner label="Updating…" /> : 'Update Password →'}
                </button>

                <button
                  type="button"
                  style={backBtn}
                  onClick={() => { setStep('email'); setError(''); setPassword(''); setConfirm(''); }}
                >
                  ← Change email
                </button>
              </form>
            </>
          )}

          {step === 'done' && (
            <div style={{ textAlign: 'center' }}>
              <div style={successIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h1 style={{ ...heading, fontSize: '1.8rem' }}>Password updated</h1>
              <p style={{ ...sub, marginBottom: '2rem' }}>Your password has been changed successfully.</p>
              <a href={signinUrl} style={submitBtn as React.CSSProperties} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
                Sign In →
              </a>
            </div>
          )}

          {step !== 'done' && (
            <div style={{ marginTop: '1.75rem', textAlign: 'center' }}>
              <a
                href={signinUrl}
                style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.82rem', color: '#505070', textDecoration: 'none' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#7a9adf'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#505070'; }}
              >
                Back to Sign In
              </a>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

/* ─── Sub-components ──────────────────────────────────────── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <span style={fieldLabel}>{label}</span>
      {children}
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div style={errorBox}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ff8080" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span>{message}</span>
    </div>
  );
}

function Spinner({ label }: { label: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
      <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff', borderRadius: '50%', animation: 'authSpin 0.65s linear infinite', display: 'inline-block', flexShrink: 0 }} />
      {label}
    </span>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/* ─── Focus handlers ─────────────────────────────────────── */

function focusIn(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = 'rgba(91,154,255,0.65)';
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(91,154,255,0.12)';
  e.currentTarget.style.background = 'rgba(91,154,255,0.04)';
}
function focusOut(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = 'rgba(91,154,255,0.2)';
  e.currentTarget.style.boxShadow = 'none';
  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
}
function hoverIn(e: React.MouseEvent<HTMLElement>) {
  const el = e.currentTarget as HTMLElement;
  el.style.background = 'linear-gradient(135deg, #3575f5 0%, #78b0ff 100%)';
  el.style.boxShadow = '0 4px 28px rgba(91,154,255,0.4)';
  el.style.transform = 'translateY(-1px)';
}
function hoverOut(e: React.MouseEvent<HTMLElement>) {
  const el = e.currentTarget as HTMLElement;
  el.style.background = 'linear-gradient(135deg, #2563eb 0%, #5b9aff 100%)';
  el.style.boxShadow = '0 2px 16px rgba(91,154,255,0.25)';
  el.style.transform = 'translateY(0)';
}

/* ─── Styles ─────────────────────────────────────────────── */

const pageWrap: React.CSSProperties = {
  minHeight: 'calc(100vh - 62px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem 1rem',
  background: 'linear-gradient(160deg, #08080f 0%, #0d0d1a 55%, #070710 100%)',
  position: 'relative',
  overflow: 'hidden',
};

const orb: React.CSSProperties = {
  position: 'absolute',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(91,154,255,0.08) 0%, transparent 70%)',
  pointerEvents: 'none',
  filter: 'blur(1px)',
};

const card: React.CSSProperties = {
  width: '100%',
  maxWidth: 440,
  background: 'rgba(11,13,22,0.94)',
  border: '1px solid rgba(91,154,255,0.16)',
  borderRadius: 16,
  padding: '2.75rem 2.5rem',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  boxShadow: '0 8px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(91,154,255,0.04) inset',
  position: 'relative',
  zIndex: 1,
};

const brandRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginBottom: '2rem',
};

const brandDot: React.CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: '#5b9aff',
  boxShadow: '0 0 10px rgba(91,154,255,0.8)',
  display: 'inline-block',
  animation: 'authPulse 2.5s ease-in-out infinite',
};

const brandText: React.CSSProperties = {
  fontFamily: "'Playfair Display', serif",
  fontSize: '0.88rem',
  fontWeight: 700,
  fontStyle: 'italic',
  color: '#a8c0f0',
  letterSpacing: '0.01em',
};

const heading: React.CSSProperties = {
  fontFamily: "'Playfair Display', serif",
  fontSize: '2.1rem',
  fontWeight: 800,
  color: '#e8f0ff',
  margin: '0 0 0.45rem',
  lineHeight: 1.15,
  letterSpacing: '-0.01em',
};

const sub: React.CSSProperties = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.875rem',
  color: '#505070',
  margin: '0 0 2rem',
  lineHeight: 1.5,
};

const form: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.15rem',
};

const fieldLabel: React.CSSProperties = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#6a6a8a',
};

const input: React.CSSProperties = {
  width: '100%',
  padding: '0.72rem 1rem',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(91,154,255,0.2)',
  borderRadius: 8,
  color: '#d0d8f0',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'border-color 0.18s, box-shadow 0.18s, background 0.18s',
  boxSizing: 'border-box',
};

const eyeBtn: React.CSSProperties = {
  position: 'absolute',
  right: '0.75rem',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#505070',
  padding: '0.1rem',
  display: 'flex',
  alignItems: 'center',
  lineHeight: 1,
  transition: 'color 0.18s',
};

const errorBox: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.5rem',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.82rem',
  color: '#ff8080',
  background: 'rgba(239,68,68,0.08)',
  border: '1px solid rgba(239,68,68,0.22)',
  borderRadius: 8,
  padding: '0.65rem 1rem',
  lineHeight: 1.5,
};

const submitBtn: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '0.82rem',
  background: 'linear-gradient(135deg, #2563eb 0%, #5b9aff 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.9rem',
  fontWeight: 600,
  letterSpacing: '0.04em',
  cursor: 'pointer',
  boxShadow: '0 2px 16px rgba(91,154,255,0.25)',
  transition: 'background 0.18s, box-shadow 0.18s, transform 0.15s, opacity 0.18s',
  marginTop: '0.3rem',
  textAlign: 'center',
  textDecoration: 'none',
};

const backBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.82rem',
  color: '#505070',
  textAlign: 'center',
  padding: '0.3rem',
  transition: 'color 0.18s',
};

const successIcon: React.CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: '50%',
  background: 'rgba(74,222,128,0.1)',
  border: '1px solid rgba(74,222,128,0.25)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 1.5rem',
};
