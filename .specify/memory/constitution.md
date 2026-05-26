<!-- SYNC IMPACT REPORT
  Version change: 1.1.1 → 1.1.2
  Reason: Technology substitution — OpenAI API stack replaced with Google Gemini free tier (ADR-001)
  Modified sections:
    - Principle III: SDK reference updated from "OpenAI Agents SDK / ChatKit SDK" to "Google Generative AI SDK"
    - Principle V: SDK reference in personalization bullet updated
    - Technology Stack table: RAG Chatbot SDK row replaced; LLM model + embedding model rows added
  Templates reviewed:
    - .specify/templates/plan-template.md ✅ not affected
    - .specify/templates/spec-template.md ✅ not affected
    - .specify/templates/tasks-template.md ✅ not affected
  Dependent artifacts updated:
    - specs/physical-ai-textbook/spec.md ✅
    - specs/physical-ai-textbook/plan.md ✅
    - requirements.md ✅
  ADR: history/adr/001-replace-openai-with-gemini.md
  Deferred TODOs: none
-->

<!-- SYNC IMPACT REPORT
  Version change: 1.0.0 → 1.1.1
  Modified principles:
    - I. Content-First → now names all 4 modules, 13-week structure, 6 outcomes, 4 assessments
    - III. RAG Pipeline Integrity → text-selection UI mechanism now specified
    - IV. Security → signup background survey questions now mandated
    - V. Personalization → removed invented review/flagging clause; LLM transformation specified
    - VII. Observability → removed invented structured-log mandates; scoped to deployment gate
  Added sections:
    - VIII. Reusable Intelligence via Subagents and Agent Skills (was entirely missing)
    - Scoring & Evaluation (was entirely missing)
    - Submission Requirements (was entirely missing)
  Technology Stack table:
    - Added Vercel (alternative deployment)
    - Added Claude Code Subagents / Agent Skills
  Templates reviewed:
    - .specify/templates/plan-template.md ✅ aligned
    - .specify/templates/spec-template.md ✅ aligned
    - .specify/templates/tasks-template.md ✅ aligned
  Deferred TODOs: none
-->

# Physical AI & Humanoid Robotics Textbook — Constitution

## Core Principles

### I. Content-First, Spec-Driven Authorship with Full Course Coverage

All textbook content MUST be written using Spec-Driven Development (SDD) via Spec-Kit Plus
and Claude Code. Every chapter, module, or section MUST originate from an approved feature
spec before implementation begins. Invented or hallucinated technical facts MUST NOT appear
in any published chapter.

The textbook MUST cover the following course structure in full — this is non-negotiable:

**4 Modules (each MUST become one or more Docusaurus chapters):**
- Module 1 — The Robotic Nervous System (ROS 2): Nodes, Topics, Services, rclpy, URDF.
- Module 2 — The Digital Twin (Gazebo & Unity): Physics simulation, LiDAR/Depth Camera/IMU
  sensors, URDF/SDF formats, Unity visualization.
- Module 3 — The AI-Robot Brain (NVIDIA Isaac™): Isaac Sim, Isaac ROS, VSLAM, Nav2,
  synthetic data generation, Sim-to-Real transfer.
- Module 4 — Vision-Language-Action (VLA): OpenAI Whisper voice commands, LLM → ROS 2
  action planning, capstone Autonomous Humanoid project.

**13-Week Weekly Breakdown MUST be documented:**
- Weeks 1-2: Physical AI foundations, embodied intelligence, humanoid landscape, sensor systems.
- Weeks 3-5: ROS 2 architecture, nodes/topics/services/actions, Python packages, launch files.
- Weeks 6-7: Gazebo setup, URDF/SDF, physics/sensor simulation, Unity intro.
- Weeks 8-10: NVIDIA Isaac SDK/Sim, perception, reinforcement learning, Sim-to-Real.
- Weeks 11-12: Humanoid kinematics/dynamics, bipedal locomotion, manipulation, HRI design.
- Week 13: Conversational robotics, GPT integration, speech recognition, multi-modal interaction.

**6 Learning Outcomes MUST be covered:**
1. Physical AI principles and embodied intelligence.
2. ROS 2 for robotic control.
3. Robot simulation with Gazebo and Unity.
4. NVIDIA Isaac AI robot platform development.
5. Humanoid robot design for natural interactions.
6. GPT model integration for conversational robotics.

**4 Assessments MUST be documented in the book:**
ROS 2 package development project; Gazebo simulation implementation; Isaac-based perception
pipeline; Capstone: Simulated humanoid robot with conversational AI.

**Hardware requirements MUST be documented** in a dedicated chapter or appendix, covering:
the Digital Twin Workstation (RTX GPU, CPU, 64GB RAM, Ubuntu 22.04), the Physical AI Edge
Kit (Jetson Orin Nano/NX, RealSense D435i, IMU, ReSpeaker), and Robot Lab tiers (Unitree
Go2 proxy, Unitree G1 miniature humanoid, premium G1 Sim-to-Real), plus the Cloud-Native
alternative (AWS g5.2xlarge / NVIDIA Omniverse Cloud).

### II. Unified, Modular, Independently Deployable System

The project is a single unified system submitted at one public URL. That URL MUST serve the
complete book, the embedded RAG chatbot, and all auth/personalization features together.

Internally the system MUST be architected as three loosely coupled layers:
- **Book layer**: Docusaurus static site (content + UI) deployed to GitHub Pages or Vercel.
- **AI/RAG layer**: RAG chatbot backend (FastAPI + Neon Postgres + Qdrant Cloud) deployed as
  a standalone service accessible from within the Docusaurus interface.
- **Auth layer**: User authentication and personalization (better-auth), integrated into both
  the book layer (UI) and the AI layer (context enrichment).

Each layer MUST be independently functional and testable. A failure in the AI layer MUST NOT
render the book unreadable. Cross-layer communication MUST use defined API contracts only.

### III. RAG Pipeline Integrity with Text-Selection Support

The embedded chatbot MUST answer questions exclusively from indexed book content. It MUST NOT
fabricate answers from general training knowledge when the answer is not in the book corpus.

The RAG pipeline MUST support text-selection-based queries via a concrete UI mechanism:
the Docusaurus frontend MUST expose a floating action button or context menu that appears
when the user selects text in a chapter, captures the selected DOM text, and passes it as
the query context to the chatbot. The chatbot MUST then answer specifically about that
selected passage.

Vector embeddings MUST be stored in Qdrant Cloud (Free Tier). Structured metadata and
conversation state MUST be stored in Neon Serverless Postgres. The Google Generative AI SDK
(`google-generativeai`) MUST be used for both LLM orchestration and embedding generation —
no raw HTTP LLM calls outside the SDK boundary. (See ADR-001:
`history/adr/001-replace-openai-with-gemini.md`) The chatbot widget MUST be embedded
directly within the Docusaurus pages, not linked externally.

### IV. Security, Secrets Management, and Signup Survey

No secrets, API keys, database credentials, or tokens MUST ever be hardcoded in source code
or committed to the repository. All secrets MUST be managed via environment variables (`.env`
files locally, platform environment variables in deployment). The `.env` file MUST be listed
in `.gitignore`.

Auth flows MUST use better-auth for signup and signin. User passwords MUST be hashed; sessions
MUST be managed securely per better-auth defaults.

At signup, the system MUST collect the following user background information to enable content
personalization:
- Software background level (e.g., beginner / intermediate / advanced programmer).
- Familiarity with Python (none / basic / proficient).
- Familiarity with Linux/Ubuntu (none / basic / proficient).
- Hardware background (e.g., no robotics experience / hobbyist / professional).
- Familiarity with AI/ML concepts (none / basic / proficient).

This data MUST be stored in Neon Postgres against the user profile and used exclusively to
drive content personalization. It MUST NOT be shared with any third party.

### V. Personalization and Urdu Translation by Consent

Content personalization and Urdu translation features MUST only activate for authenticated
users and MUST be triggered explicitly via a button placed at the START of each chapter.
These features MUST NOT auto-activate or affect unauthenticated readers.

**Personalization**: When a logged-in user clicks the personalization button, the system MUST
retrieve the user's background profile from Neon Postgres and send it, together with the
chapter content, to an LLM (via the Google Generative AI SDK) to generate a rewritten version of
the chapter adapted to that user's level. The original chapter content MUST remain accessible.

**Urdu Translation**: When a logged-in user clicks the translation button, the system MUST
send the chapter content to an LLM to produce an Urdu translation. The translated content
MUST replace the displayed chapter text for that session. A toggle to switch back to English
MUST be provided.

Both features are bonus deliverables. They MUST NOT block deployment of the base book and
chatbot. If these features are unimplemented, the base system MUST still function fully.

### VI. Reusable Intelligence via Claude Code Subagents and Agent Skills

To earn the +50 bonus points for reusable intelligence, the project MUST create and actively
use Claude Code Subagents and/or Agent Skills within the book-writing workflow. These are not
optional utilities — they MUST be demonstrably invoked during the development and authoring
process.

Requirements:
- At least one Claude Code Agent Skill MUST be authored and stored in the project (e.g., a
  skill for generating chapter outlines, expanding sections, or validating technical accuracy).
- At least one Claude Code Subagent pattern MUST be used for a repeatable task (e.g., indexing
  book content into Qdrant, generating quiz questions per chapter, or validating ROS 2 code
  examples).
- All Subagents and Skills MUST be committed to the repository and documented so they can be
  evaluated as reusable artifacts.

These artifacts MUST be referenced in the demo video and in the GitHub repository README.

### VII. Smallest Viable Diff — No Speculative Engineering

Every implementation task MUST represent the smallest change that satisfies the acceptance
criteria. Abstractions, helper utilities, or refactors MUST NOT be introduced unless required
by a current task. YAGNI (You Aren't Gonna Need It) is enforced. Each pull request or commit
MUST reference a specific task ID from `tasks.md`. No feature MUST be built for hypothetical
future requirements outside the scoring rubric.

### VIII. Deployment Readiness and Accessibility

The Docusaurus site MUST be deployed and publicly accessible at either GitHub Pages or Vercel
before any feature is declared complete. The RAG backend MUST be deployed to a reachable
public endpoint (not localhost). All components — book, chatbot widget, auth — MUST function
at the single submitted public URL.

The FastAPI backend MUST include a `/health` endpoint. No additional observability
infrastructure beyond application-level error responses is required by these requirements.

## Technology Stack Constraints

The following technology choices are FIXED and MUST NOT be substituted without a documented
ADR and explicit decision:

| Layer | Technology | Tier / Notes |
|-------|-----------|--------------|
| Book Frontend | Docusaurus | Latest stable |
| Deployment | GitHub Pages **or** Vercel | Either is acceptable per requirements |
| RAG Chatbot SDK | Google Generative AI SDK (`google-generativeai`) | Latest stable; replaces openai-agents (ADR-001) |
| LLM Model | `gemini-2.0-flash` | Free tier: 1500 RPD, 15 RPM (with retry logic) |
| Embedding Model | `text-embedding-004` (768 dims) | Free with Google AI key; task_type aware |
| API Backend | FastAPI | Latest stable; Python |
| Vector Store | Qdrant Cloud | Free Tier only |
| Relational DB | Neon Serverless Postgres | Free Tier only |
| Authentication | better-auth | Latest stable |
| AI Authoring | Claude Code + Spec-Kit Plus | Current versions |
| Reusable Intelligence | Claude Code Subagents + Agent Skills | Required for +50 pts bonus |

Python is the primary backend language. TypeScript/React is the primary frontend language
(Docusaurus default). No additional databases or vector stores MUST be introduced.

## Scoring & Evaluation

All implementation decisions MUST be prioritized in this order:

| Priority | Deliverable | Points |
|----------|------------|--------|
| P1 | Docusaurus book (full content) **AND** RAG chatbot — both required together | 100 pts base |
| P2 | Claude Code Subagents and Agent Skills (reusable) | +50 pts bonus |
| P3 | better-auth signup/signin + background survey | +50 pts bonus |
| P4 | Per-chapter content personalization (logged-in users) | +50 pts bonus |
| P5 | Per-chapter Urdu translation (logged-in users) | +50 pts bonus |

**Maximum possible score: 300 pts** (100 base + 4 × 50 bonus).

P1 is a single combined gate: both the Docusaurus book and the embedded RAG chatbot MUST be
deployed and functional together to receive the 100 base points. Neither alone qualifies.
P1 MUST be complete before any P2–P5 work begins. P2–P5 are strictly additive and independent.

## Submission Requirements

The following MUST be prepared before the submission deadline (Nov 30, 2025, 6:00 PM):

1. **Public GitHub Repository**: The repository MUST be public. It MUST contain the Docusaurus
   source, FastAPI backend, all Subagents/Skills artifacts, and a README documenting setup.
2. **Single Deployed Public URL**: The deployed URL (GitHub Pages or Vercel) MUST serve the
   complete system: book + chatbot widget + auth + any bonus features. All components MUST
   be reachable from this URL for evaluator review.
3. **90-Second Demo Video**: A demo video MUST be produced and linked (e.g., via Loom or
   NotebookLM). Judges will watch only the first 90 seconds. The video MUST demonstrate:
   the deployed book, the chatbot answering a question, and text-selection-based querying.
   If bonus features are implemented, they SHOULD be shown within the 90 seconds.
4. **WhatsApp Number**: Required for live presentation invitation (top submissions only).

Submission form: https://forms.gle/CQsSEGM3GeCrL43c8

## Development Workflow & Quality Gates

1. **Spec before code**: Every feature MUST have an approved `spec.md` before implementation.
2. **Plan before tasks**: Architecture (`plan.md`) MUST precede task generation (`tasks.md`).
3. **P1 gate**: The deployed public URL with base functionality MUST be verified before any
   P2–P5 bonus feature work begins.
4. **No secrets in git**: `.env` and credential files MUST be excluded from all commits.
5. **PHR after every significant prompt**: Prompt History Records MUST be created under
   `history/prompts/` after every implementation, planning, or architecture session.
6. **API contracts first**: FastAPI endpoint request/response schemas MUST be defined in
   `specs/<feature>/contracts/` before backend implementation begins.
7. **Deployment gate**: Every feature MUST be verified at the live public URL before it is
   declared complete. Local-only verification does not count.
8. **ADR for significant decisions**: Framework choices, data model decisions, or API design
   choices affecting multiple modules MUST be proposed as ADRs via `/sp.adr`.
9. **Task-level commits**: Each commit MUST complete exactly one task from `tasks.md` and
   reference its task ID in the commit message.

## Governance

This constitution supersedes all other practices, preferences, or conventions in this
repository. Any amendment requires:
1. A clear rationale explaining why the change is needed.
2. An updated version number following semantic versioning (MAJOR.MINOR.PATCH):
   - MAJOR: Removal or redefinition of a core principle; breaking governance change.
   - MINOR: New principle added or section materially expanded.
   - PATCH: Clarification, wording fix, or non-semantic refinement.
3. A Sync Impact Report (HTML comment at top of this file) documenting affected templates.
4. All dependent templates MUST be reviewed and updated if the amendment affects their
   Constitution Check sections.

All contributors MUST verify compliance with this constitution during PR review. Complexity
violations (e.g., adding a 4th deployment target, an extra database) MUST be justified in
the plan's Complexity Tracking table before implementation.

**Version**: 1.1.2 | **Ratified**: 2026-05-26 | **Last Amended**: 2026-05-26
