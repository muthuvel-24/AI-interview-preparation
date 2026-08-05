# 🎯 AI Interview Preparation Platform

A full-stack platform to help final-year CSE students prepare for job interviews with AI-powered tools.

## Features

- **Resume Analysis** — Upload your resume, get AI-powered feedback (strengths, gaps, ATS score, suggestions)
- **MCQ Tests** — Timed multiple-choice tests across various CS topics
- **Coding Challenges** — In-browser coding environment with sandboxed execution
- **AI Interview Chatbots** — Practice HR and technical interviews with AI
- **Analytics Dashboard** — Track your performance across all modules
- **Company Roadmap** — Personalized prep roadmap based on target companies
- **Leaderboard** — Compare your progress with peers

## Tech Stack

| Layer      | Technology                                    |
| ---------- | --------------------------------------------- |
| Frontend   | Next.js (App Router), TypeScript, TailwindCSS |
| Backend    | Node.js, Express.js, TypeScript               |
| Database   | PostgreSQL + Prisma ORM                       |
| Auth       | JWT + Google OAuth 2.0                        |
| Storage    | AWS S3                                        |
| AI         | OpenAI / Claude API                           |
| Deployment | AWS (EC2, RDS, Lambda, CloudFront, Route 53)  |

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm

## Getting Started

### 1. Clone & Install

```bash
git clone <repo-url>
cd ai-interview-preparation
```

### 2. Start Local Database

```bash
docker compose up -d
```

### 3. Set Up Backend

```bash
cd backend
cp .env.example .env    # Fill in your secrets
npm install
npm run dev             # Starts on http://localhost:5000
```

### 4. Set Up Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev             # Starts on http://localhost:3000
```

### 5. Verify

- Backend health check: `GET http://localhost:5000/api/health`
- Frontend: Open `http://localhost:3000`

## Project Structure

```
.
├── backend/            # Express.js API server
│   ├── prisma/         # Prisma schema & migrations
│   └── src/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       └── services/
├── frontend/           # Next.js application
│   ├── app/
│   ├── components/
│   ├── hooks/
│   └── lib/
├── docker-compose.yml  # Local PostgreSQL
└── README.md
```

## Environment Variables

See `.env.example` files in both `/backend` and `/frontend` for required configuration.

## License

MIT
