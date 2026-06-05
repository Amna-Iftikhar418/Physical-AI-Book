import React from 'react';

export type AiErrorKind = 'quota' | 'timeout' | 'generic';

const CONFIG: Record<AiErrorKind, { icon: string; title: string; body: string; accent: string; bg: string }> = {
  quota: {
    icon: '⚡',
    title: 'AI quota limit reached',
    body: 'The free-tier AI quota is temporarily exhausted. This resets every minute — please try again shortly.',
    accent: '#d4a843',
    bg: 'rgba(212,168,67,0.08)',
  },
  timeout: {
    icon: '⏱',
    title: 'Request timed out',
    body: 'The server took too long to respond. It may be busy — please try again.',
    accent: '#4a9eff',
    bg: 'rgba(74,158,255,0.08)',
  },
  generic: {
    icon: '⚠',
    title: 'Something went wrong',
    body: 'An unexpected error occurred. Please try again.',
    accent: '#e05555',
    bg: 'rgba(224,85,85,0.08)',
  },
};

interface Props {
  kind: AiErrorKind;
  onDismiss: () => void;
}

export default function AiErrorBanner({ kind, onDismiss }: Props): React.ReactElement {
  const c = CONFIG[kind];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'flex-start',
        gap: '0.55rem',
        background: c.bg,
        border: `1px solid ${c.accent}44`,
        borderLeft: `3px solid ${c.accent}`,
        borderRadius: '6px',
        padding: '0.45rem 0.65rem 0.45rem 0.55rem',
        maxWidth: '360px',
        fontFamily: "'Outfit', sans-serif",
        fontSize: '0.72rem',
        lineHeight: 1.45,
      }}
    >
      <span style={{ fontSize: '0.85rem', lineHeight: 1.3, flexShrink: 0 }}>{c.icon}</span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', flex: 1 }}>
        <span style={{ color: c.accent, fontWeight: 600, fontSize: '0.73rem' }}>{c.title}</span>
        <span style={{ color: 'var(--ifm-color-emphasis-700)' }}>{c.body}</span>
      </span>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--ifm-color-emphasis-500)',
          fontSize: '0.8rem',
          padding: '0',
          lineHeight: 1,
          flexShrink: 0,
          alignSelf: 'flex-start',
          marginTop: '1px',
        }}
      >
        ✕
      </button>
    </span>
  );
}
