# 🎯 AI Interview Preparation Platform

> A full-stack AI platform for structured interview preparation, resume analysis, coding practice, and interactive mock interviews.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

## ✨ Overview

The **AI Interview Preparation Platform** brings several interview-preparation activities into one application. Candidates can work on resumes, MCQs, coding challenges, and AI-driven interview practice while tracking their preparation.

## 🌟 Core Features

### 🤖 AI Interview Practice
- Multi-turn AI interview conversations
- Structured interview evaluation
- Technical, problem-solving, communication, and relevance assessment
- Real-time response streaming with Server-Sent Events (SSE)
- Voice-based mock interview support using browser speech APIs

### 📄 AI Resume Studio
- ATS-oriented resume analysis
- Skill-gap identification
- Job-description matching
- Keyword overlap analysis
- STAR-style bullet improvement

### 💻 Coding & Tests
- MCQ testing engine
- Coding challenges
- JavaScript/Python sandbox execution
- Time and space complexity analysis

### 📊 Analytics & Progress
- Interview performance tracking
- Preparation analytics
- Leaderboard
- Placement-readiness views

### 🛡️ Admin / Placement Portal
- Student and admin roles
- Role-based access control
- Cohort readiness metrics
- CSV exports
- Company-specific prompt management

## 🏗️ Architecture

```text
                    ┌──────────────────────┐
                    │     Next.js UI        │
                    │  TypeScript + Tailwind│
                    └──────────┬───────────┘
                               │ REST / SSE
                               ▼
                    ┌──────────────────────┐
                    │ Node.js + Express    │
                    │      Backend         │
                    └──────┬───────┬───────┘
                           │       │
                 ┌─────────┘       └──────────┐
                 ▼                            ▼
        ┌─────────────────┐          ┌────────────────┐
        │ PostgreSQL      │          │ AI Integration │
        │ + Prisma ORM    │          │ GPT / Rubrics  │
        └─────────────────┘          └────────────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ AWS S3 / Files  │
        └─────────────────┘
```

## 🧠 Interview Evaluation

The interview evaluation uses a weighted rubric:

| Dimension | Weight |
|---|---:|
| Technical Accuracy | 35% |
| Problem Solving & Trade-offs | 25% |
| Communication & Articulation | 25% |
| Relevance & Directness | 15% |

```text
Final Score =
(Technical × 0.35) +
(Problem Solving × 0.25) +
(Communication × 0.25) +
(Relevance × 0.15)
```

The platform can use the AI provider for transcript evaluation and has a fallback analysis path for offline scenarios.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL, Prisma ORM |
| Authentication | JWT, Google OAuth |
| Authorization | Role-Based Access Control (Student/Admin) |
| AI | OpenAI GPT-4o-mini + evaluation logic |
| File Storage | AWS S3 presigned URLs + local fallback |
| Streaming | Server-Sent Events (SSE) |
| Validation | Zod |
| Containers | Docker, Docker Compose |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm or pnpm

### 1. Clone

```bash
git clone https://github.com/muthuvel-24/AI-interview-preparation.git
cd AI-interview-preparation
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

### 3. Start the backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Backend: `http://localhost:5000`

### 4. Start the frontend

```bash
cd ../frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend: `http://localhost:3000`

### 5. Health check

```text
GET http://localhost:5000/api/health
```

## 🔐 Security

- JWT-based authentication
- Role-based authorization
- Rate limiting for AI endpoints
- Environment variables for secrets
- Presigned URLs for secure file access
- Input validation with Zod

**Never commit API keys, database passwords, or private credentials.**

## 📂 Project Structure

```text
.
├── backend/
│   ├── prisma/
│   └── src/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       └── types/
│
├── frontend/
│   ├── app/
│   │   ├── admin/
│   │   ├── analytics/
│   │   ├── interview/
│   │   ├── leaderboard/
│   │   ├── resume/
│   │   └── tests/
│   ├── components/
│   └── context/
│
└── docker-compose.yml
```

## 🔮 Future Improvements

- More personalized interview generation
- Additional company-specific preparation flows
- Expanded coding-language support
- More detailed analytics
- Production observability and monitoring

## 📄 License

MIT License
