import React, { useState } from 'react';
import Layout from '@theme/Layout';
import { authClient } from '../lib/auth-client';
import useBaseUrl from '@docusaurus/useBaseUrl';

const SURVEY_FIELDS = [
  {
    id: 'software_level',
    label: 'Software Development Level',
    options: ['beginner', 'intermediate', 'advanced'],
  },
  {
    id: 'python_familiarity',
    label: 'Python Familiarity',
    options: ['none', 'basic', 'intermediate', 'advanced'],
  },
  {
    id: 'linux_familiarity',
    label: 'Linux Familiarity',
    options: ['none', 'basic', 'intermediate', 'advanced'],
  },
  {
    id: 'hardware_background',
    label: 'Hardware / Electronics Background',
    options: ['none', 'basic', 'intermediate', 'advanced'],
  },
  {
    id: 'ai_ml_familiarity',
    label: 'AI / ML Familiarity',
    options: ['none', 'basic', 'intermediate', 'advanced'],
  },
] as const;

type SurveyKey = (typeof SURVEY_FIELDS)[number]['id'];

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
        setError(`Please select a value for "${field.label}"`);
        return;
      }
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
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

  return (
    <Layout title="Sign Up" description="Create your Physical AI account">
      <main style={{ maxWidth: 480, margin: '60px auto', padding: '0 20px' }}>
        <h1>Create Account</h1>
        <p style={{ opacity: 0.7, marginBottom: 24 }}>
          Answer a few background questions so we can personalize your learning experience.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label>
            <div style={{ marginBottom: 4, fontWeight: 600 }}>Email</div>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              style={inputStyle}
            />
          </label>
          <label>
            <div style={{ marginBottom: 4, fontWeight: 600 }}>Password (min 8 characters)</div>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              value={form.password}
              onChange={handleChange}
              style={inputStyle}
            />
          </label>
          {SURVEY_FIELDS.map((field) => (
            <label key={field.id}>
              <div style={{ marginBottom: 4, fontWeight: 600 }}>{field.label}</div>
              <select
                name={field.id}
                required
                value={form[field.id as SurveyKey]}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">— Select —</option>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </option>
                ))}
              </select>
            </label>
          ))}
          {error && (
            <div style={{ color: '#c0392b', background: '#fdecea', padding: '10px 14px', borderRadius: 6 }}>
              {error}
            </div>
          )}
          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <p style={{ marginTop: 20, opacity: 0.7 }}>
          Already have an account?{' '}
          <a href={signinUrl}>Sign in</a>
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
  opacity: 1,
};
