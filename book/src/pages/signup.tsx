import React, { useState } from 'react';
import Layout from '@theme/Layout';
import { authClient } from '../lib/auth-client';
import useBaseUrl from '@docusaurus/useBaseUrl';

const SURVEY_FIELDS = [
  {
    id: 'software_level',
    label: 'Software Development',
    options: ['beginner', 'intermediate', 'advanced'],
  },
  {
    id: 'python_familiarity',
    label: 'Python',
    options: ['none', 'basic', 'intermediate', 'advanced'],
  },
  {
    id: 'linux_familiarity',
    label: 'Linux',
    options: ['none', 'basic', 'intermediate', 'advanced'],
  },
  {
    id: 'hardware_background',
    label: 'Hardware / Electronics',
    options: ['none', 'basic', 'intermediate', 'advanced'],
  },
  {
    id: 'ai_ml_familiarity',
    label: 'AI / ML',
    options: ['none', 'basic', 'intermediate', 'advanced'],
  },
] as const;

type SurveyKey = (typeof SURVEY_FIELDS)[number]['id'];

const LEVEL_COLORS: Record<string, string> = {
  none: '#505070',
  basic: '#7a9adf',
  beginner: '#7a9adf',
  intermediate: '#5b9aff',
  advanced: '#96c4ff',
};

export default function SignupPage(): React.ReactElement {
  const homeUrl = useBaseUrl('/');
  const signinUrl = useBaseUrl('/signin');
  const [form, setForm] = useState({
    email: '',
    password: '',
    software_level: '',
    python_familiarity: '',
    linux_familiarity: '',
    hardware_background: '',
    ai_ml_familiarity: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    for (const field of SURVEY_FIELDS) {
      if (!form[field.id as SurveyKey]) {
        setError(`Please select your ${field.label} level.`);
        return;
      }
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await authClient.signUp(form);
      window.location.href = homeUrl;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg.includes('409') ? 'Email already registered.' : msg);
    } finally {
      setLoading(false);
    }
  }

  const filledSurvey = SURVEY_FIELDS.filter((f) => form[f.id as SurveyKey]).length;
  const progress = Math.round((filledSurvey / SURVEY_FIELDS.length) * 100);

  return (
    <Layout title="Sign Up" description="Create your Physical AI account">
      <div style={pageWrap}>
        <div style={{ ...orb, top: '10%', right: '15%', width: 360, height: 360 }} />
        <div style={{ ...orb, bottom: '15%', left: '10%', width: 260, height: 260, background: 'radial-gradient(circle, rgba(91,154,255,0.05) 0%, transparent 70%)' }} />

        <div className="authCard" style={card}>
          {/* Brand */}
          <div style={brandRow}>
            <span style={brandDot} />
            <span style={brandText}>Physical AI</span>
          </div>

          <h1 style={heading}>Create account</h1>
          <p style={sub}>Personalized learning starts with knowing your background</p>

          <form onSubmit={handleSubmit} style={formEl}>

            {/* ── Section 1: Credentials ── */}
            <SectionLabel icon="01" title="Account Credentials" />

            <Field label="Email">
              <input
                type="email"
                name="email"
                required
                value={form.email}
                placeholder="you@example.com"
                style={input}
                onChange={handleChange}
                onFocus={focusIn}
                onBlur={focusOut}
              />
            </Field>

            <Field label="Password — min 8 characters">
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  required
                  minLength={8}
                  value={form.password}
                  placeholder="••••••••"
                  style={{ ...input, paddingRight: '3rem' }}
                  onChange={handleChange}
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
                <button type="button" style={eyeBtn} onClick={() => setShowPass((v) => !v)} tabIndex={-1}>
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </Field>

            {/* ── Section 2: Learning Profile ── */}
            <div style={{ marginTop: '0.5rem' }}>
              <SectionLabel icon="02" title="Learning Profile" />
              <p style={sectionNote}>
                Your answers shape how the AI explains concepts to you.
              </p>

              {/* Progress bar */}
              <div style={progressTrack}>
                <div style={{ ...progressBar, width: `${progress}%` }} />
              </div>
              <p style={progressLabel}>{filledSurvey}/{SURVEY_FIELDS.length} fields filled</p>
            </div>

            <div style={surveyGrid}>
              {SURVEY_FIELDS.map((field) => {
                const val = form[field.id as SurveyKey];
                return (
                  <Field key={field.id} label={field.label}>
                    <div style={{ position: 'relative' }}>
                      <select
                        name={field.id}
                        required
                        value={val}
                        onChange={handleChange}
                        style={{
                          ...selectStyle,
                          color: val ? (LEVEL_COLORS[val] ?? '#d0d8f0') : '#404060',
                          borderColor: val ? 'rgba(91,154,255,0.35)' : 'rgba(91,154,255,0.2)',
                        }}
                        onFocus={focusIn}
                        onBlur={focusOut}
                      >
                        <option value="" disabled>— select —</option>
                        {field.options.map((opt) => (
                          <option key={opt} value={opt} style={{ background: '#0d0d1a', color: '#d0d8f0' }}>
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                          </option>
                        ))}
                      </select>
                      <span style={selectArrow}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 3.5L5 6.5L8 3.5" stroke="#5b9aff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </div>
                  </Field>
                );
              })}
            </div>

            {error && <ErrorBox message={error} />}

            <button
              type="submit"
              disabled={loading}
              style={{ ...submitBtn, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
              onMouseEnter={(e) => { if (!loading) Object.assign(e.currentTarget.style, submitHover); }}
              onMouseLeave={(e) => { Object.assign(e.currentTarget.style, { background: 'linear-gradient(135deg, #2563eb 0%, #5b9aff 100%)', boxShadow: '0 2px 16px rgba(91,154,255,0.25)', transform: 'translateY(0)' }); }}
            >
              {loading ? <Spinner label="Creating account…" /> : 'Create Account →'}
            </button>
          </form>

          <Divider label="Already have an account?" />

          <a
            href={signinUrl}
            style={altLink}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, { borderColor: 'rgba(91,154,255,0.45)', color: '#96c4ff', background: 'rgba(91,154,255,0.06)' })}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, { borderColor: 'rgba(91,154,255,0.18)', color: '#7a9adf', background: 'transparent' })}
          >
            Sign in
          </a>
        </div>
      </div>
    </Layout>
  );
}

/* ─── Sub-components ─────────────────────────────────────── */

function SectionLabel({ icon, title }: { icon: string; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.62rem', fontWeight: 700, color: '#5b9aff', background: 'rgba(91,154,255,0.1)', border: '1px solid rgba(91,154,255,0.22)', borderRadius: 4, padding: '0.15rem 0.4rem', letterSpacing: '0.08em' }}>
        {icon}
      </span>
      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#7a7a9a' }}>
        {title}
      </span>
      <span style={{ flex: 1, height: 1, background: 'rgba(91,154,255,0.1)' }} />
    </div>
  );
}

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
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
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

function Divider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', margin: '1.75rem 0 1.25rem' }}>
      <span style={{ flex: 1, height: 1, background: 'rgba(91,154,255,0.1)' }} />
      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.72rem', color: '#505070', letterSpacing: '0.06em' }}>{label}</span>
      <span style={{ flex: 1, height: 1, background: 'rgba(91,154,255,0.1)' }} />
    </div>
  );
}

/* ─── Focus handlers ─────────────────────────────────────── */

function focusIn(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = 'rgba(91,154,255,0.65)';
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(91,154,255,0.12)';
  e.currentTarget.style.background = 'rgba(91,154,255,0.04)';
}
function focusOut(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = 'rgba(91,154,255,0.2)';
  e.currentTarget.style.boxShadow = 'none';
  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
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
  background: 'radial-gradient(circle, rgba(91,154,255,0.07) 0%, transparent 70%)',
  pointerEvents: 'none',
  filter: 'blur(2px)',
};

const card: React.CSSProperties = {
  width: '100%',
  maxWidth: 520,
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

const formEl: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.1rem',
};

const fieldLabel: React.CSSProperties = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#6a6a8a',
};

const sectionNote: React.CSSProperties = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.8rem',
  color: '#454565',
  margin: '-0.5rem 0 0.85rem',
  lineHeight: 1.5,
};

const progressTrack: React.CSSProperties = {
  height: 3,
  background: 'rgba(91,154,255,0.1)',
  borderRadius: 2,
  overflow: 'hidden',
  marginBottom: '0.35rem',
};

const progressBar: React.CSSProperties = {
  height: '100%',
  background: 'linear-gradient(90deg, #2563eb, #5b9aff)',
  borderRadius: 2,
  transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
  boxShadow: '0 0 6px rgba(91,154,255,0.5)',
};

const progressLabel: React.CSSProperties = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.68rem',
  color: '#404060',
  margin: '0 0 0.5rem',
  letterSpacing: '0.04em',
};

const surveyGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '0.85rem',
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

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.72rem 2.2rem 0.72rem 1rem',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(91,154,255,0.2)',
  borderRadius: 8,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.875rem',
  outline: 'none',
  transition: 'border-color 0.18s, box-shadow 0.18s, background 0.18s',
  boxSizing: 'border-box',
  appearance: 'none',
  WebkitAppearance: 'none',
  cursor: 'pointer',
};

const selectArrow: React.CSSProperties = {
  position: 'absolute',
  right: '0.75rem',
  top: '50%',
  transform: 'translateY(-50%)',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
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
};

const submitHover = {
  background: 'linear-gradient(135deg, #3575f5 0%, #78b0ff 100%)',
  boxShadow: '0 4px 28px rgba(91,154,255,0.4)',
  transform: 'translateY(-1px)',
};

const altLink: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '0.72rem',
  textAlign: 'center' as const,
  border: '1px solid rgba(91,154,255,0.18)',
  borderRadius: 8,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.875rem',
  color: '#7a9adf',
  textDecoration: 'none',
  transition: 'border-color 0.18s, color 0.18s, background 0.18s',
  boxSizing: 'border-box' as const,
};
