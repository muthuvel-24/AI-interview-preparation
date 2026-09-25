# 🎯 AI Interview Preparation Platform

A production-grade, full-stack platform designed to prepare CSE students and software engineering candidates for technical & HR interviews using AI-driven evaluation, ATS resume matching, sandboxed coding challenges, and placement cohort analytics.

---

## 🌟 Key Architecture & Technical Highlights

- **Dynamic Rubric-Based Interview Evaluation** — Unlike simplistic question counters, candidate responses are graded against a weighted 4-dimension engineering rubric:
  - 🧠 **Technical Accuracy (35% weight)**: Domain depth, memory management, concurrency, database indexing, and algorithmic complexity.
  - 🛠️ **Problem Solving & Architectural Trade-offs (25% weight)**: Trade-off justification (e.g., SQL vs. NoSQL, caching strategies, horizontal scaling).
  - 🗣️ **Communication & Articulation (25% weight)**: Professional conciseness, structured argumentation, and STAR method adoption.
  - 🎯 **Question Relevance & Directness (15% weight)**: Focus, avoidance of evasive filler, and direct address of edge cases.
- **Real-Time Token Streaming (SSE)** — Server-Sent Events (`text/event-stream`) streaming token chunks directly from LLM completions into chat UI with zero artificial delay.
- **Voice Mock Interviews** — Web Speech API integration (`SpeechRecognition` & `SpeechSynthesis`) providing speech-to-text input and natural voice audio replies.
- **AI Resume Studio & Live JD Matcher** — Machine-readable ATS scoring, skill-gap detection, keyword density overlap analysis against custom Job Descriptions, and STAR-format bullet point rephraser.
- **Sandboxed Code Execution Engine** — Safe in-memory runtime VM running test cases against JavaScript/Python solutions with Big-O Time & Space complexity analysis.
- **Placement Officer / Admin Portal** — Role-based access control (`STUDENT` vs `ADMIN`), batch readiness metrics, CSV cohort exports, and custom company prompt builder.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | Next.js 16 (App Router), TypeScript, TailwindCSS | High-performance React UI with server and client components |
| **Backend** | Node.js, Express.js (TypeScript), REST API | Robust modular service architecture with strict Zod validation |
| **Database** | PostgreSQL + Prisma ORM | Relational schema with migrations, foreign keys, and indexes |
| **Security & RBAC** | JWT Auth, Role-Based Access Control, Rate Limiting | Protected admin routes (`/api/admin/*`) & AI rate limiting |
| **File Storage** | AWS S3 Presigned URLs + Local Fallback | Secure resume document storage |
| **AI Integration** | OpenAI GPT-4o-mini + Resilient Rubric Heuristics | Real-time token streaming and multi-turn conversational agents |
| **DevOps / Containers** | Docker, Docker Compose, Multi-stage Dockerfile | Containerized PostgreSQL database and backend runtime |

---

## 📐 Scoring Formula & Rubric Mechanics

The interview grading engine calculates the composite session score using the following deterministic formula:

$$\text{Final Score} = (\text{Tech} \times 0.35) + (\text{Problem Solving} \times 0.25) + (\text{Communication} \times 0.25) + (\text{Relevance} \times 0.15)$$

- When an **OpenAI API Key** is configured, the transcript is evaluated by GPT-4o-mini using structured JSON rubric enforcement.
- When offline or in fallback mode, an **algorithmic NLP analyzer** inspects candidate answers for domain vocabulary density, explanation depth, and structure, penalizing superficial or evasive answers.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- Docker & Docker Compose
- npm or pnpm

### 2. Start PostgreSQL Database
```bash
docker compose up -d
```
*This starts a local PostgreSQL 16 Alpine instance on port `5432`.*

### 3. Backend Setup
```bash
cd backend
cp .env.example .env

# Generate Prisma client and push schema
npx prisma generate
npx prisma db push

# Start backend server
npm install
npm run dev # Runs on http://localhost:5000
```

### 4. Frontend Setup
```bash
cd ../frontend
cp .env.example .env.local

npm install
npm run dev # Runs on http://localhost:3000
```

### 5. Verify Health
- Backend health endpoint: `GET http://localhost:5000/api/health`
- Frontend application: `http://localhost:3000`

---

## 💼 Resume & Interview Talking Points

When presenting this project in an engineering interview:

1. **How did you handle AI interview evaluation?**
   > *"Rather than relying on naive heuristics or raw turn counts, I implemented a 4-dimension weighted scoring rubric modeled after FAANG hiring committees: Technical Accuracy (35%), Problem Solving (25%), Communication (25%), and Relevance (15%). It evaluates trade-off reasoning, vocabulary depth, and structure."*

2. **How does the real-time token streaming work?**
   > *"I integrated Server-Sent Events (SSE) using `text/event-stream`. On the backend, an asynchronous generator consumes incoming tokens from the OpenAI API and flushes them chunk-by-chunk to the client. The frontend consumes the `ReadableStream` through `fetch` and appends incoming tokens to the message buffer in real-time."*

3. **How is the system secured and scaled?**
   > *"I implemented Role-Based Access Control (RBAC) middleware verifying JWT tokens with `STUDENT` and `ADMIN` privileges. Critical AI endpoints are safeguarded using sliding-window rate limiters to prevent API quota exhaustion and DDoS attacks."*

---

## 📂 Project Structure

```
.
├── backend/
│   ├── prisma/             # Prisma schema (PostgreSQL)
│   ├── src/
│   │   ├── controllers/    # Request handlers (auth, interview, resume, test, admin)
│   │   ├── middleware/     # Auth, RBAC (requireRole), rateLimiter
│   │   ├── routes/         # Express router modules
│   │   ├── services/       # AI service (rubrics, SSE stream), S3, tests, auth
│   │   └── types/          # Express Request extensions
├── frontend/
│   ├── app/                # Next.js App Router pages
│   │   ├── admin/          # Admin & Placement Officer Portal
│   │   ├── analytics/      # Performance dashboard & charts
│   │   ├── interview/      # Voice & text AI mock interview with rubric scorecard
│   │   ├── leaderboard/    # Peer leaderboard
│   │   ├── resume/         # ATS resume studio & live JD matcher
│   │   └── tests/          # MCQ testing engine & coding sandbox
│   ├── components/         # Navbar, ProtectedRoute, AdminRoute, Toast, SkeletonLoader
│   └── context/            # AuthContext (JWT, user roles, gamification streaks)
├── docker-compose.yml      # Containerized PostgreSQL service
└── README.md
```

---

## 📄 License
MIT License
