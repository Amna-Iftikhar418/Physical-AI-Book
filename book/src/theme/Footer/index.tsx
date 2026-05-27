import React from 'react';
import Link from '@docusaurus/Link';

const YEAR = new Date().getFullYear();

const MODULES = [
  { label: 'Module 1: ROS 2',          to: '/module-1-ros2' },
  { label: 'Module 2: Digital Twins',  to: '/module-2-digital-twin' },
  { label: 'Module 3: NVIDIA Isaac',   to: '/module-3-isaac' },
  { label: 'Module 4: VLA',            to: '/module-4-vla' },
];

const COURSE = [
  { label: 'Learning Outcomes',   to: '/learning-outcomes' },
  { label: 'Hardware Requirements', to: '/hardware/requirements' },
  { label: 'Assessments',         to: '/assessments' },
];

export default function Footer(): React.ReactElement {
  return (
    <footer style={{
      background: '#07070f',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── top gradient rule ── */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(91,154,255,0.5) 30%, rgba(251,191,36,0.45) 60%, transparent 100%)',
      }} />

      {/* ── subtle background glow ── */}
      <div style={{
        position: 'absolute',
        top: '-80px', left: '50%',
        transform: 'translateX(-50%)',
        width: '600px', height: '200px',
        background: 'radial-gradient(ellipse, rgba(29,78,216,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* ── main content ── */}
      <div className="footer-main-grid" style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '3.5rem 2rem 0',
        display: 'grid',
        gridTemplateColumns: '1.6fr 1fr 1fr 1fr',
        gap: '2.5rem',
        alignItems: 'start',
      }}>

        {/* Brand column */}
        <div>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            fontStyle: 'italic',
            fontSize: '1.15rem',
            background: 'linear-gradient(135deg, #f0f4ff 40%, #5b9aff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.7rem',
            lineHeight: 1.3,
          }}>
            Physical AI &amp;<br />Humanoid Robotics
          </div>
          <p style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '0.78rem',
            color: '#9898b8',
            lineHeight: 1.7,
            margin: '0 0 1.25rem',
            maxWidth: '220px',
          }}>
            A cutting-edge textbook for next-generation robotics and AI engineers.
          </p>
          <a
            href="https://github.com/Amna-Iftikhar418/Physical-AI-Book"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '0.73rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              color: '#b0b0cc',
              border: '1px solid rgba(91,154,255,0.35)',
              borderRadius: '4px',
              padding: '0.3rem 0.75rem',
              textDecoration: 'none',
              transition: 'color 0.18s, border-color 0.18s, background 0.18s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = '#c8d8ff';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(91,154,255,0.65)';
              (e.currentTarget as HTMLElement).style.background = 'rgba(91,154,255,0.08)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = '#b0b0cc';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(91,154,255,0.35)';
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </a>
        </div>

        {/* Modules column */}
        <FooterCol title="Modules" links={MODULES} />

        {/* Course column */}
        <FooterCol title="Course" links={COURSE} />

        {/* Author column */}
        <div>
          <ColTitle>Author</ColTitle>
          <a
            href="https://github.com/Amna-Iftikhar418"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              textDecoration: 'none',
            }}
          >
            <div style={{
              width: '32px', height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem',
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              color: '#e0eaff',
              flexShrink: 0,
              border: '1px solid rgba(91,154,255,0.25)',
            }}>AI</div>
            <span style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '0.82rem',
              color: '#c0c0dc',
              transition: 'color 0.18s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#e8eeff'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#c0c0dc'}
            >
              Amna Iftikhar
            </span>
          </a>
        </div>
      </div>

      {/* ── bottom bar ── */}
      <div style={{
        maxWidth: '1100px',
        margin: '2.5rem auto 0',
        padding: '1rem 2rem',
        borderTop: '1px solid rgba(91,154,255,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <span style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '0.68rem',
          color: '#8888aa',
          letterSpacing: '0.06em',
        }}>
          © {YEAR} Amna Iftikhar — All rights reserved
        </span>
        <span style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '0.68rem',
          color: '#686888',
          letterSpacing: '0.04em',
        }}>
          Built with Docusaurus · Powered by Gemini + Qdrant
        </span>
      </div>

    </footer>
  );
}

function ColTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "'Outfit', sans-serif",
      fontSize: '0.62rem',
      fontWeight: 700,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color: '#5b9aff',
      marginBottom: '1rem',
      paddingBottom: '0.55rem',
      borderBottom: '1px solid rgba(91,154,255,0.1)',
    }}>
      {children}
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <ColTitle>{title}</ColTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {links.map(l => (
          <Link
            key={l.to}
            to={l.to}
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '0.8rem',
              color: '#b8b8d8',
              textDecoration: 'none',
              letterSpacing: '0.02em',
              lineHeight: 1.5,
              transition: 'color 0.18s, padding-left 0.18s',
              display: 'inline-block',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = '#e8eeff';
              (e.currentTarget as HTMLElement).style.paddingLeft = '4px';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = '#b8b8d8';
              (e.currentTarget as HTMLElement).style.paddingLeft = '0';
            }}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
