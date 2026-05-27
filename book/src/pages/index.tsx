import React, { useRef, useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './index.module.css';

// ─── Neural Canvas ────────────────────────────────────────────────────────────

function NeuralCanvas(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();

    const NODE_COUNT = 60;
    const MAX_DIST = 150;

    type Node = { x: number; y: number; vx: number; vy: number };
    const nodes: Node[] = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
    }));

    let animId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const opacity = (1 - dist / MAX_DIST) * 0.35;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(232, 160, 32, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(232, 160, 32, 0.5)';
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    window.addEventListener('resize', setSize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', setSize);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} />;
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

function HeroSection(): JSX.Element {
  const introUrl = useBaseUrl('/intro');
  return (
    <section className={styles.hero}>
      <span className={styles.heroChip}>AI-Native University Textbook</span>
      <h1 className={styles.heroTitle}>
        Physical AI &amp;
        <span className={styles.heroAccent}>Humanoid Robotics</span>
      </h1>
      <p className={styles.heroTagline}>
        Master ROS&nbsp;2&nbsp;·&nbsp;Digital Twins&nbsp;·&nbsp;NVIDIA Isaac&nbsp;·&nbsp;Vision‑Language‑Action Models
      </p>
      <div className={styles.heroCtas}>
        <Link to={introUrl} className={styles.heroCta}>
          Start Reading →
        </Link>
        <a
          href="https://github.com/Amna-Iftikhar418/Physical-AI-Book"
          className={styles.heroSecondary}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on GitHub ↗
        </a>
      </div>
    </section>
  );
}

// ─── Stats Section ────────────────────────────────────────────────────────────

const STATS = [
  { end: 4, label: 'Modules', isText: false },
  { end: 13, label: 'Weeks', isText: false },
  { end: 18, label: 'Chapters', isText: false },
  { end: 0, label: 'Powered', text: 'AI', isText: true },
] as const;

function StatsSection(): JSX.Element {
  const [counts, setCounts] = useState<number[]>(STATS.map(() => 0));
  const [triggered, setTriggered] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered) {
          setTriggered(true);
          const duration = 1500;
          const start = performance.now();

          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = progress * (2 - progress);
            setCounts(STATS.map((s) => (s.isText ? 0 : Math.floor(s.end * eased))));
            if (progress < 1) requestAnimationFrame(animate);
            else setCounts(STATS.map((s) => s.end));
          };

          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [triggered]);

  return (
    <div className={styles.statsSection} ref={sectionRef}>
      {STATS.map((s, i) => (
        <div key={s.label} className={styles.statItem}>
          <div className={styles.statNumber}>{s.isText ? s.text : counts[i]}{!s.isText && '+'}</div>
          <div className={styles.statLabel}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Modules Section ──────────────────────────────────────────────────────────

const MODULE_DATA = [
  {
    icon: 'Module 01',
    title: 'ROS 2 Foundations',
    desc: 'Nodes, topics, services, actions, rclpy, URDF, and the robotic nervous system.',
    path: '/module-1-ros2/week-1-2-foundations',
    variant: 'cyan' as const,
  },
  {
    icon: 'Module 02',
    title: 'Digital Twins',
    desc: 'Gazebo and Unity simulation, physics engines, sensor modeling, and HRI design.',
    path: '/module-2-digital-twin/week-6-7-gazebo',
    variant: 'violet' as const,
  },
  {
    icon: 'Module 03',
    title: 'NVIDIA Isaac',
    desc: 'Isaac Sim, Isaac ROS, VSLAM, Nav2, perception pipelines, and Sim-to-Real transfer.',
    path: '/module-3-isaac/week-8-10-isaac-sim',
    variant: 'cyan' as const,
  },
  {
    icon: 'Module 04',
    title: 'VLA Models',
    desc: 'Humanoid locomotion, voice commands, GPT integration, and conversational robotics.',
    path: '/module-4-vla/week-11-12-humanoid',
    variant: 'violet' as const,
  },
];

function ModulesSection(): JSX.Element {
  return (
    <section className={styles.sectionWrapper}>
      <div className={styles.sectionInner}>
        <div className={styles.sectionLabel}>Curriculum</div>
        <h2 className={styles.sectionTitle}>Explore the Modules</h2>
        <p className={styles.sectionSubtitle}>
          13 weeks of structured Physical AI curriculum — from ROS 2 fundamentals to humanoid robots.
        </p>
        <div className={styles.modulesGrid}>
          {MODULE_DATA.map((m) => (
            <Link
              key={m.title}
              to={useBaseUrl(m.path)}
              className={`${styles.moduleCard} ${
                m.variant === 'cyan' ? styles.moduleCardCyan : styles.moduleCardViolet
              }`}
            >
              <span className={styles.moduleCardIcon}>{m.icon}</span>
              <h3 className={styles.moduleCardTitle}>{m.title}</h3>
              <p className={styles.moduleCardDesc}>{m.desc}</p>
              <span className={styles.moduleCardLink}>Explore module →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features Section ─────────────────────────────────────────────────────────

const FEATURE_DATA = [
  {
    icon: '💬',
    title: 'AI Chat Assistant',
    desc: 'RAG-powered Q&A grounded exclusively in textbook content. Get cited answers to any question.',
  },
  {
    icon: '✨',
    title: 'Personalized Learning',
    desc: 'Chapter content rewritten for your exact skill level — from beginner to advanced engineer.',
  },
  {
    icon: '🌐',
    title: 'Urdu Translation',
    desc: 'Full chapter translation to Urdu with one click. Code blocks stay in English.',
  },
  {
    icon: '🔍',
    title: 'Text Selection Q&A',
    desc: 'Highlight any passage in a chapter and instantly ask the AI about it.',
  },
];

function FeaturesSection(): JSX.Element {
  return (
    <section className={styles.sectionWrapper} style={{ background: 'rgba(5,10,20,0.6)' }}>
      <div className={styles.sectionInner}>
        <div className={styles.sectionLabel}>Features</div>
        <h2 className={styles.sectionTitle}>Built for AI-Native Learning</h2>
        <p className={styles.sectionSubtitle}>
          Every feature is designed to deepen understanding, not just deliver content.
        </p>
        <div className={styles.featuresGrid}>
          {FEATURE_DATA.map((f) => (
            <div key={f.title} className={styles.featureCard}>
              <span className={styles.featureIcon}>{f.icon}</span>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Tech Stack Section ───────────────────────────────────────────────────────

const TECH_BADGES = ['ROS 2', 'NVIDIA Isaac', 'Python', 'Gemini AI', 'Qdrant', 'FastAPI', 'React'];

function TechSection(): JSX.Element {
  return (
    <section className={styles.techSection}>
      <div className={styles.sectionLabel}>Technology</div>
      <h2 className={styles.sectionTitle}>Powered By</h2>
      <p className={styles.sectionSubtitle} style={{ marginTop: '0.5rem' }}>
        Industry-grade tools used in real Physical AI deployments.
      </p>
      <div className={styles.techBadges}>
        {TECH_BADGES.map((tech) => (
          <span key={tech} className={styles.techBadge}>
            {tech}
          </span>
        ))}
      </div>
    </section>
  );
}

// ─── Bottom CTA Section ───────────────────────────────────────────────────────

function CtaSection(): JSX.Element {
  const introUrl = useBaseUrl('/intro');
  return (
    <section className={styles.ctaSection}>
      <h2 className={styles.ctaTitle}>Ready to begin your journey?</h2>
      <p className={styles.ctaSubtitle}>
        Join the next generation of Physical AI engineers.
      </p>
      <Link to={introUrl} className={styles.ctaButton}>
        Open the Book →
      </Link>
    </section>
  );
}

// ─── Page Export ──────────────────────────────────────────────────────────────

export default function Home(): JSX.Element {
  return (
    <Layout
      title="Physical AI & Humanoid Robotics"
      description="AI-native university textbook on ROS 2, Digital Twins, NVIDIA Isaac, and Vision-Language-Action models"
    >
      <div className={styles.page}>
        <NeuralCanvas />
        <HeroSection />
        <StatsSection />
        <ModulesSection />
        <FeaturesSection />
        <TechSection />
        <CtaSection />
      </div>
    </Layout>
  );
}
