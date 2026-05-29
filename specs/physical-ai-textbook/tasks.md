# Tasks: Physical AI & Humanoid Robotics Textbook — Full System

**Feature**: `physical-ai-textbook`
**Spec**: `specs/physical-ai-textbook/spec.md`
**Plan**: `specs/physical-ai-textbook/plan.md`

---

## Landing Page Redesign — Dark Neural Aesthetic (2026-05-27)

| ID | Title | Status | Depends On |
|----|-------|--------|-----------|
| T-LP01 | Create `index.module.css` with dark neural design tokens and layout styles | ⬜ TODO | — |
| T-LP02 | Create NeuralCanvas component (canvas animated neural-net background) | ⬜ TODO | T-LP01 |
| T-LP03 | Create HeroSection component (headline, tagline, "Start Reading" CTA) | ⬜ TODO | T-LP01 |
| T-LP04 | Create StatsSection component (4 animated counters with IntersectionObserver) | ⬜ TODO | T-LP01 |
| T-LP05 | Create ModulesSection component (4 glowing module cards) | ⬜ TODO | T-LP01 |
| T-LP06 | Create FeaturesSection component (4 feature highlights grid) | ⬜ TODO | T-LP01 |
| T-LP07 | Create TechSection component (floating tech stack badges) | ⬜ TODO | T-LP01 |
| T-LP08 | Create CtaSection component (bottom call-to-action strip) | ⬜ TODO | T-LP01 |
| T-LP09 | Assemble full `index.tsx` replacing the old one-line redirect | ⬜ TODO | T-LP02–T-LP08 |
| T-LP10 | Update `custom.css` dark-mode primary color to neural cyan | ⬜ TODO | — |
| T-LP11 | TypeScript build verification — `npm run build` exits 0 | ⬜ TODO | T-LP09, T-LP10 |
| T-LP12 | Manual browser verification of full landing page | ⬜ TODO | T-LP11 |

### T-LP01 — Create `index.module.css`

**File**: `book/src/pages/index.module.css` (CREATE NEW)

CSS classes required:
- `.page` — dark bg (#050A14), white text, full width
- `.canvas` — `position: fixed; inset: 0; z-index: 0; pointer-events: none`
- `.hero` — `min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; position: relative; z-index: 1; padding: 2rem 1.5rem`
- `.heroChip` — pill badge: `background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.3); color: #00D4FF; border-radius: 100px; padding: 0.3rem 1rem; font-size: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 1.5rem; display: inline-block`
- `.heroTitle` — `font-size: clamp(2.5rem,6vw,5rem); font-weight: 800; line-height: 1.1; margin: 0 0 1.5rem; color: #E2E8F0`
- `.heroAccent` — cyan-violet gradient text: `background: linear-gradient(135deg, #00D4FF, #7B2FFF); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text`
- `.heroTagline` — `font-size: 1.1rem; color: #94A3B8; max-width: 600px; margin: 0 auto 2.5rem; line-height: 1.7`
- `.heroCta` — primary button: cyan bg, dark text, border-radius 8px, hover glow + translateY(-2px)
- `.heroSecondary` — muted secondary link
- `.statsSection` — `display: flex; flex-wrap: wrap; justify-content: space-around; gap: 2rem; padding: 4rem 2rem; background: rgba(10,22,40,0.5); border-top/bottom: 1px solid rgba(0,212,255,0.1); position: relative; z-index: 1`
- `.statItem` — `text-align: center; flex: 1; min-width: 120px`
- `.statNumber` — large gradient text number
- `.statLabel` — muted uppercase label
- `.sectionWrapper` — `position: relative; z-index: 1; padding: 5rem 1.5rem`
- `.sectionInner` — `max-width: 1200px; margin: 0 auto`
- `.sectionTitle` — large centered heading
- `.sectionSubtitle` — muted centered subheading
- `.modulesGrid` — `display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-top: 3rem`
- `.moduleCard` — glassmorphism card: dark bg, cyan border, blur, transition
- `.moduleCardCyan:hover` — cyan glow
- `.moduleCardViolet:hover` — violet glow
- `.moduleCardIcon`, `.moduleCardTitle`, `.moduleCardDesc`, `.moduleCardLink` — card inner elements
- `.featuresGrid` — same as `.modulesGrid`
- `.featureCard` — slightly simpler card variant
- `.featureIcon`, `.featureTitle`, `.featureDesc` — feature card inner elements
- `.techSection` — centered, z-index 1
- `.techBadges` — flex wrap centered
- `.techBadge` — pill shape, dark bg, cyan border; nth-child float animations with staggered delays
- `@keyframes float` — `0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); }`
- `.ctaSection` — centered, gradient bg, top border
- `.ctaTitle`, `.ctaSubtitle`, `.ctaButton` — CTA strip elements
- `@media (max-width: 768px)` — responsive overrides

**Acceptance criteria**: File created, all classes defined, no syntax errors

---

### T-LP02 — NeuralCanvas component

**File**: Part of `book/src/pages/index.tsx`

```tsx
function NeuralCanvas(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    // Set dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // 60 nodes
    const nodes = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
    }));
    let animId: number;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Move & bounce nodes
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });
      // Draw lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${(1 - dist/150) * 0.4})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      // Draw nodes
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 212, 255, 0.6)';
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    }
    draw();
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  return <canvas ref={canvasRef} className={styles.canvas} />;
}
```

**Acceptance criteria**: Canvas renders, nodes move, lines appear/disappear based on proximity

---

### T-LP03 — HeroSection component

```tsx
function HeroSection(): JSX.Element {
  return (
    <section className={styles.hero}>
      <span className={styles.heroChip}>AI-Native University Textbook</span>
      <h1 className={styles.heroTitle}>
        Physical AI &<br />
        <span className={styles.heroAccent}>Humanoid Robotics</span>
      </h1>
      <p className={styles.heroTagline}>
        Master ROS 2 · Digital Twins · NVIDIA Isaac · Vision-Language-Action Models
      </p>
      <div>
        <Link to={useBaseUrl('/intro')} className={styles.heroCta}>
          Start Reading →
        </Link>
        <a
          href="https://github.com/Amna-Iftikhar418/Physical-AI-Book"
          className={styles.heroSecondary}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on GitHub
        </a>
      </div>
    </section>
  );
}
```

**Acceptance criteria**: Hero renders at full viewport height, CTA links to `/intro`

---

### T-LP04 — StatsSection component

Uses `useState` for displayed values + `IntersectionObserver` to trigger count-up animation when section scrolls into view.

Stats: `[{ end: 4, label: 'Modules' }, { end: 13, label: 'Weeks' }, { end: 18, label: 'Chapters' }, { text: 'AI', label: 'Powered' }]`

**Acceptance criteria**: Numbers count up from 0 when section enters viewport; animation runs once

---

### T-LP05 — ModulesSection component

Module data (defined as const outside component):
- `{ icon: '🤖', title: 'Module 1: ROS 2', desc: 'Nodes, topics, services, actions, and the robotic nervous system.', path: '/module-1-ros2/module-1-ros2', variant: 'cyan' }`
- `{ icon: '🌐', title: 'Module 2: Digital Twins', desc: 'Gazebo and Unity simulation, physics engines, and sensor modeling.', path: '/module-2-digital-twin/module-2-digital-twin', variant: 'violet' }`
- `{ icon: '⚡', title: 'Module 3: NVIDIA Isaac', desc: 'Isaac Sim, VSLAM, Nav2, perception pipelines, and Sim-to-Real.', path: '/module-3-isaac/module-3-isaac', variant: 'cyan' }`
- `{ icon: '🧠', title: 'Module 4: VLA Models', desc: 'Humanoid locomotion, voice commands, GPT integration, conversational AI.', path: '/module-4-vla/module-4-vla', variant: 'violet' }`

**Acceptance criteria**: 4 cards in 2-column grid; hover shows correct glow color; links navigate correctly

---

### T-LP06 — FeaturesSection component

Feature data (const):
- `{ icon: '💬', title: 'AI Chat Assistant', desc: 'RAG-powered Q&A grounded exclusively in textbook content.' }`
- `{ icon: '✨', title: 'Personalized Learning', desc: 'Chapter content rewritten for your exact skill level.' }`
- `{ icon: '🌐', title: 'Urdu Translation', desc: 'Full chapter translation to Urdu with one click.' }`
- `{ icon: '🔍', title: 'Text Selection Q&A', desc: 'Highlight any passage in a chapter to ask about it.' }`

**Acceptance criteria**: 4 feature cards render; no links needed (informational only)

---

### T-LP07 — TechSection component

Badges: `['ROS 2', 'NVIDIA Isaac', 'Python', 'Gemini AI', 'Qdrant', 'FastAPI', 'React']`

**Acceptance criteria**: 7 badges render with float animation visible in browser

---

### T-LP08 — CtaSection component

Simple centered strip with title, subtitle, and "Open the Book →" link to `/intro`.

**Acceptance criteria**: Renders at page bottom with distinct gradient background

---

### T-LP09 — Assemble full index.tsx

Replace `book/src/pages/index.tsx` with complete file:
- All imports at top
- All component functions (T-LP02 through T-LP08) defined
- `export default function Home()` with `Layout` wrapper + all sections

**Critical**: Remove `Redirect` import and usage entirely.

**Acceptance criteria**: File saved; `npm run build` exits 0; no TS errors

---

### T-LP10 — Update custom.css dark-mode colors

**File**: `book/src/css/custom.css`

Change only `[data-theme='dark']` block — replace `#25c2a0` teal family with `#00bcd4` cyan family.

**Acceptance criteria**: Only `[data-theme='dark']` block changed; light mode unchanged

---

### T-LP11 — TypeScript build verification

Run: `cd "C:\Hackathon 1\book" && npm run build`

**Acceptance criteria**: Build exits with code 0; no errors in output

---

### T-LP12 — Manual browser verification

Run: `cd "C:\Hackathon 1\book" && npm start`

Open: `http://localhost:3000/Physical-AI-Book/`

**Acceptance criteria**:
- [ ] Dark landing page visible (not redirect)
- [ ] Neural canvas animating
- [ ] "Start Reading →" navigates to intro
- [ ] Stats counters animate on scroll
- [ ] Module cards link correctly
- [ ] Navbar (Auth) and footer unchanged
- [ ] Docs pages still work
- [ ] No console errors
**Constitution**: `.specify/memory/constitution.md` v1.1.2
**Submission Deadline**: Nov 30, 2025 at 06:00 PM
**Max Score**: 300 pts (100 base + 4 × 50 bonus)

## Format: `[ID] [P?] [Story?] Description — file path`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[US#]**: User story this task belongs to (from spec.md)
- No tests unless explicitly requested — none requested in spec

## User Story Map

| ID | Story | Priority | Points |
|----|-------|----------|--------|
| US1 | Read Book and Ask Questions (book + RAG chatbot) | P1 | 100 pts base |
| US2 | Text-Selection Contextual Q&A | P1 | (part of base) |
| US3 | Signup with Background Survey (better-auth) | P3 | +50 pts |
| US4 | Personalize Chapter Content | P4 | +50 pts |
| US5 | Translate Chapter to Urdu | P5 | +50 pts |
| — | Claude Code Subagents + Agent Skills (bonus milestone, not a user story) | P2 | +50 pts |

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Repo scaffolding, tooling, CI/CD skeleton — no features yet

- [ ] T001 Create root `.gitignore` listing `.env`, `node_modules/`, `__pycache__/`, `*.pyc`, `.env.*`, `build/`, `.docusaurus/` — `.gitignore`
- [ ] T002 Create root `.env` (local only, never committed) with placeholder keys: `GOOGLE_API_KEY`, `QDRANT_URL`, `QDRANT_API_KEY`, `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_BASE_URL` — `.env`
- [ ] T003 Initialize Docusaurus 3.x TypeScript project in `book/` via `npx create-docusaurus@latest book classic --typescript` — `book/`
- [ ] T004 [P] Configure `book/docusaurus.config.js`: title "Physical AI & Humanoid Robotics", tagline, `onBrokenLinks: 'throw'`, blog disabled, `routeBasePath: '/'`, placeholder `url`/`baseUrl`/`organizationName`/`projectName` — `book/docusaurus.config.js`
- [ ] T005 [P] Configure `book/sidebars.js` with sidebar categories: intro, learning-outcomes, hardware, module-1-ros2, module-2-digital-twin, module-3-isaac, module-4-vla, assessments — `book/sidebars.js`
- [ ] T006 Initialize Python 3.11 FastAPI project in `backend/` with `backend/requirements.txt` containing: `fastapi==0.111.*`, `uvicorn[standard]`, `google-generativeai`, `qdrant-client`, `asyncpg`, `sqlalchemy[asyncio]`, `alembic`, `python-dotenv`, `pydantic` — `backend/requirements.txt`
- [ ] T007 [P] Create `backend/config.py` loading all env vars via `python-dotenv` with validation (raises on missing required keys) — `backend/config.py`
- [ ] T008 Create GitHub Actions workflow for Docusaurus deployment on push to `main` (paths: `book/**`) — `.github/workflows/deploy-book.yml`

**Checkpoint**: `npm run start` in `book/` renders locally. `backend/` directory structure exists.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure MUST be complete before any user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 Provision Neon Serverless Postgres free tier database — copy connection string to `.env` `DATABASE_URL`
- [ ] T010 [P] Provision Qdrant Cloud free tier cluster — copy `QDRANT_URL` and `QDRANT_API_KEY` to `.env`
- [ ] T011 [P] Obtain Google AI Studio API key (`GOOGLE_API_KEY`) — add to `.env`
- [ ] T012 Initialize Alembic in `backend/db/migrations/` via `alembic init` — configure `alembic.ini` to use `DATABASE_URL` from env — `backend/db/migrations/`
- [ ] T013 Create Alembic initial migration creating `conversations` and `messages` tables (anonymous chat schema — `users`/`user_profiles` added in Phase 6) — `backend/db/migrations/versions/001_initial_chat_schema.py`
- [ ] T014 Run `alembic upgrade head` — verify `conversations` and `messages` tables exist in Neon
- [ ] T015 Implement `backend/db/connection.py` — async SQLAlchemy engine using `asyncpg`, connection pool min=1 max=5 — `backend/db/connection.py`
- [ ] T016 Implement `backend/utils/retry.py` — `with_retry()` async function with exponential backoff (2s/4s/8s) catching `ResourceExhausted` and `ServiceUnavailable` from `google.api_core.exceptions`, max 4 attempts — `backend/utils/retry.py`
- [ ] T017 Implement `GET /health` endpoint returning `{"status": "ok", "version": "1.0.0"}` — `backend/routers/health.py`
- [ ] T018 Implement `backend/main.py` — FastAPI app, register health router, configure `CORSMiddleware` (allowed origins from `CORS_ORIGINS` env var) — `backend/main.py`
- [ ] T019 Deploy FastAPI backend to Railway (or Render free tier) — set all env vars in dashboard — verify `GET /health` returns HTTP 200 at live backend URL

**Checkpoint**: `GET /health` returns 200 at live URL. Neon schema migrated. Qdrant cluster reachable via Python client.

---

## Phase 3: User Story 1 — Read Book and Ask Questions (Priority: P1) 🎯 MVP

**Goal**: Any unauthenticated user can read the complete textbook at a live public URL and ask the embedded chatbot questions grounded in book content.

**Independent Test**: Open deployed URL → navigate to any chapter → ask "What is a ROS 2 node?" in chat widget → response cites a chapter source within 8 seconds.

**⚠️ P1 GATE**: Both the Docusaurus book AND the RAG chatbot must be live and functional at the public URL before any Phase 4+ work begins (per constitution Principle VIII and spec §8).

### 3.1 — Book Content (all files independent, run in parallel)

- [X] T020 [P] [US1] Write `book/docs/intro.md` — course overview, 4-module summary, course goals, navigation guide (≥800 words, no fabricated specs) — `book/docs/intro.md`
- [X] T021 [P] [US1] Write `book/docs/learning-outcomes.md` — all 6 learning outcomes from requirements.md with descriptions and module mappings — `book/docs/learning-outcomes.md`
- [X] T022 [P] [US1] Write `book/docs/hardware/requirements.md` — Digital Twin Workstation (RTX GPU, CPU, 64GB RAM, Ubuntu 22.04), Physical AI Edge Kit (Jetson Orin Nano/NX, RealSense D435i, IMU, ReSpeaker), Robot Lab tiers (Unitree Go2 proxy, Unitree G1, premium G1), Cloud-Native alternative (AWS g5.2xlarge / NVIDIA Omniverse Cloud), Economy Jetson Kit table (≥800 words) — `book/docs/hardware/requirements.md`
- [X] T023 [P] [US1] Write `book/docs/module-1-ros2/index.md` — Module 1 overview, ROS 2 role in robotics, module learning objectives, ASCII/Mermaid architecture diagram of ROS 2 communication (≥800 words) — `book/docs/module-1-ros2/index.md`
- [X] T024 [P] [US1] Write `book/docs/module-1-ros2/week-1-2-foundations.md` — Physical AI principles, embodied intelligence definition, humanoid robotics landscape, sensor systems (LiDAR, cameras, IMUs, force/torque), code examples where applicable (≥800 words) — `book/docs/module-1-ros2/week-1-2-foundations.md`
- [X] T025 [P] [US1] Write `book/docs/module-1-ros2/week-3-5-ros2-fundamentals.md` — ROS 2 architecture, nodes, topics, services, actions, rclpy Python examples, publisher/subscriber code blocks (≥800 words) — `book/docs/module-1-ros2/week-3-5-ros2-fundamentals.md`
- [X] T026 [P] [US1] Write `book/docs/module-1-ros2/week-3-5-ros2-advanced.md` — Building ROS 2 Python packages, launch files, parameter management, URDF robot description format, code examples (≥800 words) — `book/docs/module-1-ros2/week-3-5-ros2-advanced.md`
- [X] T027 [P] [US1] Write `book/docs/module-2-digital-twin/index.md` — Module 2 overview, Gazebo + Unity roles, simulation philosophy, ASCII/Mermaid diagram of simulation pipeline (≥800 words) — `book/docs/module-2-digital-twin/index.md`
- [X] T028 [P] [US1] Write `book/docs/module-2-digital-twin/week-6-7-gazebo.md` — Gazebo simulation environment setup, URDF/SDF formats, physics simulation, LiDAR/Depth Camera/IMU sensor simulation, code examples (≥800 words) — `book/docs/module-2-digital-twin/week-6-7-gazebo.md`
- [X] T029 [P] [US1] Write `book/docs/module-2-digital-twin/week-6-7-unity.md` — Unity for robot visualization, high-fidelity rendering, human-robot interaction in Unity, ROS-Unity bridge setup (≥800 words) — `book/docs/module-2-digital-twin/week-6-7-unity.md`
- [X] T030 [P] [US1] Write `book/docs/module-3-isaac/index.md` — Module 3 overview, NVIDIA Isaac platform description, Isaac Sim vs Isaac ROS distinction, ASCII/Mermaid diagram (≥800 words) — `book/docs/module-3-isaac/index.md`
- [X] T031 [P] [US1] Write `book/docs/module-3-isaac/week-8-10-isaac-sim.md` — NVIDIA Isaac SDK and Isaac Sim, photorealistic simulation, synthetic data generation for training, USD scene format (≥800 words) — `book/docs/module-3-isaac/week-8-10-isaac-sim.md`
- [X] T032 [P] [US1] Write `book/docs/module-3-isaac/week-8-10-perception.md` — AI-powered perception with Isaac ROS, hardware-accelerated VSLAM, Nav2 path planning for bipedal humanoid movement, AI manipulation pipeline (≥800 words) — `book/docs/module-3-isaac/week-8-10-perception.md`
- [X] T033 [P] [US1] Write `book/docs/module-3-isaac/week-8-10-sim-to-real.md` — Reinforcement learning for robot control, Sim-to-Real transfer techniques, domain randomization, deploying trained models to Jetson (≥800 words) — `book/docs/module-3-isaac/week-8-10-sim-to-real.md`
- [X] T034 [P] [US1] Write `book/docs/module-4-vla/index.md` — Module 4 overview, VLA concept (Vision-Language-Action), convergence of LLMs and robotics, ASCII/Mermaid diagram (≥800 words) — `book/docs/module-4-vla/index.md`
- [X] T035 [P] [US1] Write `book/docs/module-4-vla/week-11-12-humanoid.md` — Humanoid robot kinematics and dynamics, bipedal locomotion and balance control, manipulation and grasping with humanoid hands, natural human-robot interaction design (≥800 words) — `book/docs/module-4-vla/week-11-12-humanoid.md`
- [X] T036 [P] [US1] Write `book/docs/module-4-vla/week-13-conversational.md` — OpenAI Whisper voice-to-action pipeline, LLM → ROS 2 action planning (cognitive planning), multi-modal interaction (speech, gesture, vision), Capstone: Autonomous Humanoid project description (≥800 words) — `book/docs/module-4-vla/week-13-conversational.md`
- [X] T037 [P] [US1] Write `book/docs/assessments/index.md` — all 4 assessments with descriptions and rubrics: ROS 2 package project, Gazebo simulation implementation, Isaac-based perception pipeline, Capstone simulated humanoid with conversational AI (≥800 words) — `book/docs/assessments/index.md`

### 3.2 — Book Config & First Deployment

- [X] T038 [US1] Update `book/docusaurus.config.js` with final GitHub Pages `url`, `baseUrl`, `organizationName`, `projectName` values; inject `REACT_APP_API_URL` env var reference in `customFields` — `book/docusaurus.config.js`
- [X] T039 [US1] Verify `npm run build` in `book/` exits 0 with no broken links — fix any MDX errors before deploying — `book/`
- [X] T040 [US1] Push to `main` branch — verify GitHub Actions workflow deploys book to `gh-pages` branch — confirm live GitHub Pages URL loads all chapter pages with 0 broken links — `.github/workflows/deploy-book.yml`

### 3.3 — RAG Backend

- [X] T041 [US1] Create `backend/db/models.py` — SQLAlchemy ORM models: `Conversation` (id UUID, user_id UUID nullable, chapter_id TEXT, created_at) and `Message` (id UUID, conversation_id FK, role CHECK, content TEXT, created_at) — `backend/db/models.py`
- [X] T042 [US1] Create `backend/scripts/build_manifest.py` — reads all MDX files from `book/docs/`, strips frontmatter and JSX, extracts plain text, outputs `backend/docs_manifest.json` mapping `chapter_id → plain text` — `backend/scripts/build_manifest.py`
- [X] T043 [US1] Run `python backend/scripts/build_manifest.py` — verify `backend/docs_manifest.json` contains entries for all 18 chapter files — `backend/docs_manifest.json`
- [X] T044 [US1] Implement `backend/subagents/index_to_qdrant.py` — reads `docs_manifest.json`, chunks each chapter (~500 tokens, 50-token overlap), embeds via `text-embedding-004` (768 dims, task_type="retrieval_document"), batch 10 chunks with 5s sleep between batches, upserts to Qdrant `chapter_chunks` collection with payload (chapter_id, module_id, heading, text, char_start), point ID = sha256(chapter_id + char_start) — `backend/subagents/index_to_qdrant.py`
- [X] T045 [US1] Create Qdrant `chapter_chunks` collection (size=768, distance=COSINE) inside `index_to_qdrant.py` using `recreate_collection` for idempotency — `backend/subagents/index_to_qdrant.py`
- [X] T046 [US1] Run `python backend/subagents/index_to_qdrant.py` — verify all chapter chunks indexed in Qdrant (confirm with count query ≥ expected chunks)
- [X] T047 [US1] Implement `backend/services/agents.py` — configure `genai.configure(api_key=GOOGLE_API_KEY)`, define `book_model = genai.GenerativeModel(model_name="gemini-2.0-flash", system_instruction=BOOK_SYSTEM_PROMPT)` where system prompt restricts answers to provided context — `backend/services/agents.py`
- [X] T048 [US1] Implement `backend/services/rag.py` — `embed_query(text)` using `text-embedding-004` (task_type="retrieval_query"), `search_qdrant(vector, chapter_id=None)` (top-5, score_threshold=0.70), `run_rag_query(query, context_chunks)` calling `book_model.generate_content()` wrapped with `with_retry()` — `backend/services/rag.py`
- [X] T049 [US1] Implement `POST /api/chat` in `backend/routers/chat.py` — accepts `{query, session_id?, chapter_id?}`, calls `rag.py` pipeline, persists conversation+messages to Neon, returns `{answer, session_id, sources: [{chapter_id, heading, score}]}`, returns 503 if all retries exhausted — `backend/routers/chat.py`
- [X] T050 [US1] Register chat router in `backend/main.py` — `backend/main.py`

### 3.4 — ChatWidget Frontend

- [X] T051 [US1] Create `book/src/lib/api-client.ts` — typed `fetch` wrapper with base URL from `process.env.REACT_APP_API_URL`, `postChat(payload)` and `postChatSelect(payload)` functions, 45-second timeout, surfaces error messages for UI — `book/src/lib/api-client.ts`
- [X] T052 [US1] Create `book/src/components/ChatWidget/ChatPanel.tsx` — floating button (bottom-right), expands to 300×500px inline panel, text input + send button, displays assistant responses with `react-markdown` rendering, shows source citations (chapter_id + heading), loading indicator, error state — `book/src/components/ChatWidget/ChatPanel.tsx`
- [X] T053 [US1] Create `book/src/components/ChatWidget/index.tsx` — exports `ChatWidget` component that mounts `ChatPanel` — `book/src/components/ChatWidget/index.tsx`
- [X] T054 [US1] Install `react-markdown` in `book/` — `book/package.json`
- [X] T055 [US1] Inject `ChatWidget` into all Docusaurus pages by importing and rendering it in `book/src/theme/Root.tsx` (swizzle) — `book/src/theme/Root.tsx`

### 3.5 — P1 Gate Deployment

- [X] T056 [US1] Set `REACT_APP_API_URL` to live Railway/Render backend URL in `book/.env.production` (not committed) and in GitHub Actions `deploy-book.yml` as a build env var — `book/.env.production`, `.github/workflows/deploy-book.yml`
- [X] T057 [US1] Redeploy Docusaurus with ChatWidget — verify P1 gate at live URL: all chapter pages load, chat panel opens, question returns grounded answer with citations, `GET /health` returns 200

**Checkpoint — P1 GATE PASSED**: Both book and chatbot are live. 100 base points claimable.

---

## Phase 4: User Story 2 — Text-Selection Contextual Q&A (Priority: P1)

**Goal**: User highlights text in any chapter → floating "Ask about this" button appears → chat opens pre-filled → response is scoped to that chapter.

**Independent Test**: Select 20+ words in Module 1 chapter → "Ask about this" button appears → click → chat panel opens pre-filled with selected text → response cites only Module 1 content.

**Dependency**: Requires T049 (`POST /api/chat/select`) and T055 (`Root.tsx`) from Phase 3.

- [X] T058 [US2] Implement `POST /api/chat/select` in `backend/routers/chat.py` — same RAG pipeline as `/api/chat` but Qdrant search filtered by `chapter_id` using `FieldCondition(key="chapter_id", match=MatchValue(value=body.chapter_id))`; `chapter_id` is required (returns 400 if missing) — `backend/routers/chat.py`
- [X] T059 [US2] Create `book/src/components/ChatWidget/SelectionButton.tsx` — renders floating "Ask about this" button positioned via `getBoundingClientRect()` of selection; hidden by default; triggers `ChatPanel` pre-fill with selected text + `chapter_id` extracted from current page path — `book/src/components/ChatWidget/SelectionButton.tsx`
- [X] T060 [US2] Extend `book/src/theme/Root.tsx` — add `mouseup` event listener: if `window.getSelection().toString().trim().length >= 10` show `SelectionButton` near selection rect; else hide it — `book/src/theme/Root.tsx`
- [X] T061 [US2] Wire `SelectionButton` click → opens `ChatPanel` with `selected_text` pre-filled in input and `chapter_id` stored for the `/api/chat/select` call — `book/src/components/ChatWidget/SelectionButton.tsx`, `book/src/components/ChatWidget/ChatPanel.tsx`
- [ ] 
 [US2] Deploy and verify text-selection gate at live URL: highlight text → button appears within 200ms → chat opens pre-filled → response is chapter-scoped

**Checkpoint**: US1 + US2 fully verified at live URL. P1 base gate complete.

---

## Phase 5: Bonus Milestone — Claude Code Subagents + Agent Skills (P2, +50 pts)

**Goal**: Two committed, documented, and demonstrable reusable intelligence artifacts in the repository.

**Independent Test**: `.claude/commands/generate-chapter-outline.md` exists and produces a valid outline when invoked. `.claude/agents/qdrant-indexer.md` exists and `index_to_qdrant.py` runs to completion.

**Dependency**: None — independent of auth. Can begin immediately after P1 gate.

- [X] T063 Create `.claude/commands/generate-chapter-outline.md` — Agent Skill that reads constitution to confirm topic scope, generates Markdown chapter outline with H2 sections matching weekly breakdown, 3-5 bullet sub-topics per section, one code example placeholder, one learning objective per section tied to the 6 course outcomes — `.claude/commands/generate-chapter-outline.md`
- [X] T064 Create `.claude/agents/qdrant-indexer.md` — Subagent definition that instructs Claude to run `python backend/subagents/index_to_qdrant.py` after any chapter MDX is created/updated, confirms output ("Indexed N chunks across M chapters"), reports any failed chapter_id — `.claude/agents/qdrant-indexer.md`
- [X] T065 Add "Reusable Intelligence" section to `README.md` describing both artifacts: what each does, how to invoke, expected output — `README.md`

**Checkpoint**: Both files committed. README section complete. +50 pts claimable after demo video shows both.

---

## Phase 6: User Story 3 — Signup with Background Survey (Priority: P3, +50 pts)

**Goal**: Users can create accounts with email/password and 5 required background survey fields; sessions persist; navbar reflects auth state.

**Independent Test**: Open `/signup` → fill all 5 survey dropdowns → submit → `GET /api/user/profile` returns all 5 fields → refresh page → navbar still shows email.

**Dependency**: P1 gate must be passed. Unlocks Phase 7 and Phase 8.

**⚠️ Architectural Note**: `better-auth` is a JavaScript/TypeScript library — no official Python PyPI package exists. Implementation uses better-auth on the Docusaurus frontend for session management; FastAPI validates JWT tokens independently. See ADR suggestion below.

### 6.1 — Database Schema

- [X] T066 [US3] Create Alembic migration adding `users` and `user_profiles` tables — `users(id UUID PK, email TEXT UNIQUE NOT NULL, created_at TIMESTAMPTZ)`, `user_profiles(user_id UUID PK FK→users.id, software_level TEXT CHECK, python_familiarity TEXT CHECK, linux_familiarity TEXT CHECK, hardware_background TEXT CHECK, ai_ml_familiarity TEXT CHECK, created_at TIMESTAMPTZ)` — `backend/db/migrations/versions/002_auth_and_profiles.py`
- [X] T067 [US3] Add `User` and `UserProfile` SQLAlchemy ORM models to `backend/db/models.py` — `backend/db/models.py`
- [X] T068 [US3] Run `alembic upgrade head` — verify `users` and `user_profiles` tables exist in Neon

### 6.2 — Auth Backend

- [X] T069 [US3] Implement `backend/auth.py` — password hashing with `bcrypt` directly (no passlib), JWT creation/validation using `python-jose`, `create_access_token(user_id)`, `verify_token(token) → user_id`, token expiry 24 hours — `backend/auth.py`; `bcrypt`, `python-jose[cryptography]` in `backend/requirements.txt`
- [X] T070 [US3] Implement `POST /api/auth/signup` in `backend/routers/auth.py` — validates all 5 profile fields (required), hashes password, inserts into `users` + `user_profiles`, returns `{user_id, token}`; 409 on duplicate email; 422 if any profile field missing — `backend/routers/auth.py`
- [X] T071 [US3] Implement `POST /api/auth/signin` in `backend/routers/auth.py` — verifies email + password hash, returns `{user_id, token}`; 401 on invalid credentials — `backend/routers/auth.py`
- [X] T072 [US3] Implement `GET /api/auth/session` in `backend/routers/auth.py` — validates Bearer token, returns `{user_id, email}`; 401 on invalid/expired — `backend/routers/auth.py`
- [X] T073 [US3] Implement `GET /api/user/profile` in `backend/routers/auth.py` — validates Bearer token, returns `{user_id, email, profile: {5 fields}}`; 401 if not authenticated — `backend/routers/auth.py`
- [X] T074 [US3] Register auth router in `backend/main.py` — `backend/main.py`
- [X] T075 [US3] Add `BETTER_AUTH_SECRET` and `JWT_SECRET_KEY` to Railway/Render env vars dashboard

### 6.3 — Auth Frontend

- [X] T076 [US3] Create `book/src/lib/auth-client.ts` — custom JWT auth client (better-auth Python adapter doesn't exist); exports `authClient` with `signUp()`, `signIn()`, `signOut()`, `getSession()`, `getCachedUser()`, `getToken()` — `book/src/lib/auth-client.ts`
- [X] T077 [P] [US3] Create `book/src/components/Auth/AuthButton.tsx` — shows "Sign In / Sign Up" links when logged out; shows user email + "Sign Out" button when logged in; reads session from `authClient.getCachedUser()` + `authClient.getSession()` — `book/src/components/Auth/AuthButton.tsx`
- [X] T078 [US3] Swizzle Docusaurus Navbar to render `AuthButton` — `book/src/theme/Navbar/Content/index.tsx`
- [X] T079 [US3] Create `book/src/pages/signup.tsx` — form with email, password (min 8 chars), 5 required survey dropdowns (software_level, python_familiarity, linux_familiarity, hardware_background, ai_ml_familiarity); client-side validation requires all fields; on submit calls `POST /api/auth/signup`; on success stores token in localStorage and redirects to book homepage — `book/src/pages/signup.tsx`
- [X] T080 [US3] Create `book/src/pages/signin.tsx` — form with email + password; on submit calls `POST /api/auth/signin`; stores token; redirects to homepage; shows error on 401 — `book/src/pages/signin.tsx`
- [X] T081 [US3] Deploy and verify P3 gate at live URL: signup with all 5 fields → profile in Neon → signin → session persists on refresh → navbar shows email → duplicate email returns error

**Checkpoint**: Auth fully verified. +50 pts claimable. Phase 7 and 8 can now begin.

📋 **Architectural decision detected**: `better-auth` Python adapter does not exist — JWT auth implemented natively in FastAPI. Document reasoning and tradeoffs? Run `/sp.adr better-auth-python-integration`

---

## Phase 7: User Story 4 — Personalize Chapter Content (Priority: P4, +50 pts)

**Goal**: Authenticated users can click "Personalize for Me" at the top of any chapter; chapter is rewritten for their skill level; original always restorable.

**Independent Test**: Sign in → open any chapter → click "Personalize for Me" → personalized text appears within 30s with "Back to original" visible → click "Back to original" → page reloads with default content. Button must be invisible for logged-out users.

**Dependency**: Phase 6 (auth) must be deployed and verified.

- [X] T082 [US4] Add `personalization_model = genai.GenerativeModel(model_name="gemini-2.0-flash", system_instruction=PERSONALIZATION_SYSTEM_PROMPT)` to `backend/services/agents.py` — system prompt instructs rewrite for user profile level, preserving all technical facts, code examples, and section headings — `backend/services/agents.py`
- [X] T083 [US4] Implement `backend/services/personalization.py` — `get_user_profile(user_id)` fetches from Neon, `personalize_chapter(chapter_id, profile)` reads from `docs_manifest.json`, calls `personalization_model.generate_content()` wrapped with `with_retry()` — `backend/services/personalization.py`
- [X] T084 [US4] Implement `POST /api/personalize` in `backend/routers/personalize.py` — requires Bearer token, calls personalization service, returns `{personalized_text}`; 401 if not authenticated; 404 if chapter_id not in manifest; 503 if LLM retries exhausted — `backend/routers/personalize.py`
- [X] T085 [US4] Register personalize router in `backend/main.py` — `backend/main.py`
- [X] T086 [US4] Create `book/src/components/PersonalizationBar/PersonalizeButton.tsx` — rendered at top of every chapter MDX page; visible only to authenticated users (checked via `authClient.useSession()`); on click: calls `POST /api/personalize` with `chapter_id` from current path, shows loading indicator ("Personalizing for your level…"), on response replaces page content with personalized Markdown rendered via `react-markdown`; "Back to original" link reloads the page — `book/src/components/PersonalizationBar/PersonalizeButton.tsx`
- [X] T087 [US4] Integrate `PersonalizeButton` into a shared MDX layout component so it renders at the top of every chapter page — `book/src/theme/DocItem/Layout/index.tsx` or `book/src/components/PersonalizationBar/index.tsx`
- [ ] T088 [US4] Deploy and verify P4 gate at live URL: button hidden for anonymous → visible for logged-in → personalization returns within 30s → code blocks/technical terms intact → "Back to original" restores page

**Checkpoint**: Personalization verified. +50 pts claimable.

---

## Phase 8: User Story 5 — Translate Chapter to Urdu (Priority: P5, +50 pts)

**Goal**: Authenticated users can click "Translate to Urdu" at the top of any chapter; prose appears in Urdu; all code blocks stay in English; "Switch to English" toggle restores original.

**Independent Test**: Sign in → open Module 1 ROS 2 chapter → click "Translate to Urdu" → Urdu prose appears within 30s → all fenced code blocks unchanged → "Switch to English" restores original content. Button invisible for logged-out users.

**Dependency**: Phase 6 (auth) must be deployed and verified. Independent of Phase 7.

- [X] T089 [US5] Add `translation_model = genai.GenerativeModel(model_name="gemini-2.0-flash", system_instruction=TRANSLATION_SYSTEM_PROMPT)` to `backend/services/agents.py` — system prompt: translate all prose to Urdu, preserve ALL code blocks verbatim in English, preserve technical terms (ROS 2, URDF, NVIDIA Isaac, etc.) in English within Urdu prose — `backend/services/agents.py`
- [X] T090 [US5] Implement `backend/services/translation.py` — `translate_chapter(chapter_id)` reads from `docs_manifest.json`, calls `translation_model.generate_content()` wrapped with `with_retry()` — `backend/services/translation.py`
- [X] T091 [US5] Implement `POST /api/translate` in `backend/routers/translate.py` — requires Bearer token, calls translation service, returns `{translated_text}`; 401 if not authenticated; 404 if chapter_id not in manifest; 503 if LLM retries exhausted — `backend/routers/translate.py`
- [X] T092 [US5] Register translate router in `backend/main.py` — `backend/main.py`
- [X] T093 [US5] Create `book/src/components/PersonalizationBar/TranslateButton.tsx` — rendered at top of every chapter alongside `PersonalizeButton`; visible only to authenticated users; on click: calls `POST /api/translate`, shows loading indicator ("Translating to Urdu…"), on response replaces chapter prose with Urdu Markdown rendered via `react-markdown`; renders "Switch to English" toggle button that restores original content on click — `book/src/components/PersonalizationBar/TranslateButton.tsx`
- [X] T094 [US5] Integrate `TranslateButton` into the same shared chapter layout component as `PersonalizeButton` — `book/src/theme/DocItem/Layout/index.tsx`
- [X] T095 [US5] Deploy and verify P5 gate at live URL: button hidden for anonymous → visible for logged-in → Urdu translation within 30s → all fenced code blocks in English → "Switch to English" restores original

**Checkpoint**: Translation verified. +50 pts claimable.

---

## Phase 9: Polish & Submission Assets

**Purpose**: Final preparation for hackathon submission per requirements.md items R15–R19

- [X] T096 Write `README.md` at repo root — project title, one-paragraph description, ASCII architecture diagram (3-layer: Book / RAG / Auth), setup instructions (book: npm, backend: Python, env vars), "Reusable Intelligence" section describing both `.claude/` artifacts with invocation commands, live deployed URL, demo video link placeholder — `README.md`
- [X] T097 Update `book/docusaurus.config.js` `url` and `baseUrl` to the final verified live GitHub Pages URL — `book/docusaurus.config.js`
- [X] T098 [P] Final deployment verification at live URL — confirm checklist: all chapter pages load (0 broken links), `GET /health` → 200, chat widget answers with citations, text-selection trigger fires, signup/signin/session works, personalization button works, translation button works
- [ ] T099 Make GitHub repository public — verify repo URL is publicly accessible without login
- [ ] T100 Record 90-second demo video (Loom or NotebookLM) — sequence: deployed book URL → navigate to chapter → type chatbot question → show answer with citation → select text → "Ask about this" button → (if time) signup with survey → personalization button → Urdu translation button
- [ ] T101 Submit via https://forms.gle/CQsSEGM3GeCrL43c8 before Nov 30, 2025 at 06:00 PM — submit: public GitHub repo link, deployed book URL, demo video link (≤90s), WhatsApp number

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup          → No dependencies — start immediately
Phase 2: Foundational   → Requires Phase 1 — BLOCKS all user stories
Phase 3: US1            → Requires Phase 2 — P1 gate (must pass before Phase 4+)
Phase 4: US2            → Requires Phase 3 (T049 chat endpoint, T055 Root.tsx)
Phase 5: Subagents      → Requires P1 gate — independent of auth
Phase 6: US3            → Requires P1 gate — BLOCKS Phase 7 and Phase 8
Phase 7: US4            → Requires Phase 6 (auth deployed and verified)
Phase 8: US5            → Requires Phase 6 (auth deployed and verified)
Phase 9: Submission     → Requires all desired phases verified at live URL
```

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational (Phase 2)
- **US2 (P1)**: Starts after US1 backend endpoint T049 and frontend T055 are complete
- **Subagents bonus**: Starts after P1 gate — no auth dependency
- **US3 (P3)**: Starts after P1 gate — unlocks US4 and US5
- **US4 (P4)**: Starts after US3 auth is deployed and verified
- **US5 (P5)**: Starts after US3 auth is deployed and verified — independent of US4

### Within Each Phase

- Book content tasks (T020–T037) are all independent — run in parallel
- Backend services (rag.py, agents.py) before routers
- Frontend components before integration/swizzle
- Every phase must be verified at **live URL** before declaring complete

---

## Parallel Opportunities

### Phase 3 — Book Content (16 files, all independent)

```
Parallel batch: T020, T021, T022, T023, T024, T025, T026,
                T027, T028, T029, T030, T031, T032, T033,
                T034, T035, T036, T037
```

### Phase 3 — RAG Backend

```
Sequential: T041 → T042 → T043 → T044 → T045 → T046 → T047 → T048 → T049 → T050
(each step depends on the previous)
```

### Phase 6 — Auth Implementation

```
Parallel: T077 (AuthButton.tsx) can run alongside T069–T075 (backend auth)
```

### Phase 7 + Phase 8 (after Phase 6 gate)

```
Parallel: Phase 7 (US5) and Phase 8 (US6) are independent — can run simultaneously
```

---

## Implementation Strategy

### MVP First (P1 Only — 100 base pts)

1. Complete Phase 1 (Setup)
2. Complete Phase 2 (Foundational)
3. Complete Phase 3 (US1 — book + RAG)
4. Complete Phase 4 (US2 — text-selection)
5. **STOP and VALIDATE**: P1 gate verified at live URL
6. Submit MVP if time runs short — 100 pts secured

### Full Score Strategy (300 pts)

1. Phases 1–4: P1 gate (100 pts base) — **do not skip any phase**
2. Phase 5: US3 Subagents (independent, quick — +50 pts)
3. Phase 6: US4 Auth (unlocks 2 bonus phases — +50 pts)
4. Phases 7 + 8: US4 + US5 in parallel (each +50 pts)
5. Phase 9: Submission assets — record video, submit form

### Parallel Team Strategy (if multiple contributors)

1. Complete Phases 1–2 together
2. After P1 gate:
   - Contributor A: Subagents bonus milestone (Phase 5 — quick, independent)
   - Contributor B: US3 Auth backend (Phase 6.1–6.2)
   - Contributor C: US3 Auth frontend (Phase 6.3)
3. After auth gate:
   - Contributor A: US4 Personalization (Phase 7)
   - Contributor B: US5 Translation (Phase 8)

---

## Notes

- **No hardcoded secrets**: All API keys via `.env` (local) and platform env vars (deployed) — constitution Principle IV
- **Free tiers only**: Google AI (1500 RPD/15 RPM), Qdrant Cloud (1GB), Neon (0.5GB), Railway/Render — no paid upgrades
- **Every feature verified at live URL before declaring complete** — local-only verification does not count (constitution Principle VIII)
- **Each commit references a task ID** from this file in the commit message (constitution Dev Workflow rule 9)
- **[P] tasks** = different files, no pending dependencies — safe to parallelize
- **Book content (T020–T037)**: Use real facts from requirements.md hardware/curriculum sections only — no hallucinated specs

---

## Task Count Summary

| Phase | Story | Tasks | Parallelizable |
|-------|-------|-------|---------------|
| Phase 1: Setup | — | 8 (T001–T008) | 4 |
| Phase 2: Foundational | — | 11 (T009–T019) | 3 |
| Phase 3: US1 — Book + RAG | US1 | 38 (T020–T057) | 19 |
| Phase 4: US2 — Text-Selection | US2 | 5 (T058–T062) | 0 |
| Phase 5: Subagents/Skills (bonus milestone) | — | 3 (T063–T065) | 0 |
| Phase 6: US3 — Auth | US3 | 16 (T066–T081) | 2 |
| Phase 7: US4 — Personalization | US4 | 7 (T082–T088) | 0 |
| Phase 8: US5 — Translation | US5 | 7 (T089–T095) | 0 |
| Phase 9: Polish & Submission | — | 6 (T096–T101) | 1 |
| **TOTAL** | | **101 tasks** | **29** |
