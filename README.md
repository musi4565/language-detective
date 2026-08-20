# 🕵️ Language Detective

**Stop repeating the same language mistakes.**

Language Detective is an AI-powered language learning platform that **detects your personal mistakes**, **explains them**, and creates **personalized practice** based on exactly those mistakes. Unlike generic language apps that teach the same lesson to everyone, Language Detective builds your curriculum from what YOU get wrong.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | Register / login / JWT / bcrypt password hashing / protected routes |
| 🧭 **Onboarding** | Native & learning language selection, level picker (A1–C2) |
| 📝 **Placement test** | 26-question grammar/vocabulary/reading test → recommended level, weak & strong areas |
| ✍️ **Writing Detective** | AI analyzes your text: corrected version, score, every mistake with category, topic, severity and explanation |
| 🗄️ **Mistake Database** | Every AI-detected mistake is saved; filter by category/severity; charts: by category, over time, most common |
| 🎯 **Personalized Practice** | AI generates 5 exercises from your *weakest topics* (multiple choice, fill-blank, correct sentence, translate, rearrange) |
| 🔁 **Spaced Repetition** | Mistakes re-tested at 1, 2, 4, 7, 14, 30 days; mastery score up on correct, resets on wrong |
| 💬 **AI Chat** | Natural conversation; AI corrects you *without interrupting*; corrections saved to your mistake DB |
| 🎙️ **Speaking** | Browser speech recognition → transcript → AI scores pronunciation/grammar/fluency/vocabulary |
| 📚 **Vocabulary** | Add any word; AI auto-explains (definition, translation, example, pronunciation); spaced review |
| 📊 **Progress** | XP, streak, weekly activity chart, skill scores, mistake-reduction trend |
| 🏆 **Gamification** | XP system (+10 analysis, +10 practice, +15 speaking, +20 daily challenge), 8 achievements |
| 🗓️ **Daily Challenge** | AI-generated sentence-correction challenge every day (+20 XP) |
| 👑 **Admin Panel** | Users (search/block), analytics, languages CRUD, most-common mistakes |
| 🎨 **UI/UX** | Dark/light mode, responsive sidebar → mobile drawer, skeletons, toasts, empty states |

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router, Axios, Lucide icons, Zustand
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL, Prisma ORM
- **Auth:** JWT, bcrypt
- **AI:** Google Gemini **or** OpenAI (provider chosen via env, abstraction layer)
- **Validation:** Zod
- **Security:** Helmet, CORS, rate limiting, input validation, global error handler

---

## 📁 Folder Structure

```
language-detective/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── api/             # Axios client with interceptors
│       ├── components/      # Spinner, Toasts, ScoreRing, Modal, Empty/Error states
│       ├── layouts/         # AppLayout (sidebar + topbar)
│       ├── pages/           # Landing, Login, Register, Onboarding, PlacementTest,
│       │                    # Dashboard, Writing, Mistakes, Practice, Chat, Speaking,
│       │                    # Vocabulary, Progress, Achievements, Profile, AdminPanel
│       ├── store/           # Zustand stores (auth, theme, toasts)
│       └── utils/
├── server/                  # Express backend
│   ├── prisma/
│   │   ├── schema.prisma    # 20+ models
│   │   ├── seed.js          # admin/demo users, languages, achievements, sample data
│   │   └── migrations/
│   ├── src/
│   │   ├── config/          # env config
│   │   ├── controllers/     # auth, writing, mistakes, practice, vocabulary,
│   │   │                    # chat, speaking, progress, placement, challenge, admin
│   │   ├── middleware/      # auth (JWT), admin guard, validation, error handler
│   │   ├── routes/          # REST routes
│   │   ├── services/
│   │   │   ├── ai/          # aiService (Gemini/OpenAI gateway), aiSchemas (Zod),
│   │   │   │                # aiOrchestrator, prompts/ (separate prompt templates)
│   │   │   ├── gamification.service.js   # XP, streaks, achievements
│   │   │   └── spacedRepetition.service.js
│   │   ├── utils/
│   │   └── validators/      # Zod schemas
│   └── tests/               # node:test API + unit tests
└── README.md
```

---

## 🚀 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Clone & install

```bash
git clone <your-repo-url> language-detective
cd language-detective

cd server && npm install
cd ../client && npm install
```

### 2. Environment variables

**Server** — copy and fill:

```bash
cd server
cp .env.example .env
```

```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/language_detective?schema=public"
JWT_SECRET="a-very-long-random-secret"
PORT=5000
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"

# AI — set at least ONE of these (preference: Gemini)
GEMINI_API_KEY="your-gemini-api-key"
OPENAI_API_KEY=""
```

**Client:**

```bash
cd client
cp .env.example .env
```

```
VITE_API_URL=http://localhost:5000/api
```

> In development you can also skip `VITE_API_URL` — Vite proxies `/api` to `http://localhost:5000`.

### 3. Database setup

```bash
cd server
npx prisma migrate dev        # create tables
npm run db:seed               # seed admin, demo user, languages, achievements...
```

### 4. Run

```bash
# terminal 1 — backend
cd server && npm run dev

# terminal 2 — frontend
cd client && npm run dev
```

Open **http://localhost:5173**

---

## 🔑 Development credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@languagedetective.app` | `Admin@123` |
| **Demo user** | `demo@languagedetective.app` | `demo1234` |

> ⚠️ **Production warning:** these passwords exist only in the seed script. In production, remove the demo user and force password changes. Never deploy with default credentials.

---

## 🤖 AI API Setup

The platform needs **one** AI provider key:

1. **Google Gemini (recommended, free tier):**
   - Get a key at https://aistudio.google.com/apikey
   - Set `GEMINI_API_KEY` in `server/.env`

2. **OpenAI:**
   - Get a key at https://platform.openai.com/api-keys
   - Set `OPENAI_API_KEY` in `server/.env`

Provider selection logic (in `server/src/config/env.js`):
```
GEMINI_API_KEY set  → Gemini
else OPENAI_API_KEY → OpenAI
else                → AI endpoints return a clear "AI not configured" error
```

AI responses are validated with Zod (`server/src/services/ai/aiSchemas.js`). Invalid JSON is re-parsed; if validation still fails the user gets a friendly error.

---

## 🧪 Testing

```bash
cd server
npm test
```

Covers: register, login, duplicate email, validation, protected routes, invalid token, admin guard, writing analysis error handling, mistakes scoping, and spaced-repetition math.

---

## 📦 Build

```bash
cd server && npm start          # production backend
cd client && npm run build      # production frontend → client/dist
```

---

## 🌍 Deployment

### Backend → Render / Railway
1. Create a PostgreSQL database (Render/Railway/Supabase) and copy its connection string into `DATABASE_URL`.
2. Add all env vars from `.env.example`.
3. Build command: `npm install && npx prisma generate && npx prisma migrate deploy && npm run db:seed`
4. Start command: `npm start`

### Frontend → Vercel
1. Import the `client/` folder as a new Vercel project.
2. Set env var `VITE_API_URL` to your deployed backend URL (e.g. `https://your-api.onrender.com/api`).
3. Framework preset: **Vite**. Build command: `npm run build`, output: `dist`.

---

## 🔌 API Overview

```
Auth          POST /api/auth/register · POST /api/auth/login · GET /api/auth/me
              PATCH /api/auth/profile · POST /api/auth/change-password · POST /api/auth/onboarding
Writing       POST /api/writing/analyze · GET /api/writing/history · GET /api/writing/:id
Mistakes      GET /api/mistakes · GET /api/mistakes/stats · GET /api/mistakes/due
              GET /api/mistakes/:id · POST /api/mistakes/:id/review
Practice      GET /api/practice · POST /api/practice/:id/submit · GET /api/practice/history
Vocabulary    GET /api/vocabulary · POST /api/vocabulary · DELETE /api/vocabulary/:id
              POST /api/vocabulary/:id/review
Chat          GET /api/chat/sessions · POST /api/chat/session · GET /api/chat/session/:id
              DELETE /api/chat/session/:id · POST /api/chat/message
Speaking      POST /api/speaking/analyze · GET /api/speaking/history · GET /api/speaking/:id
Progress      GET /api/progress/dashboard · GET /api/progress/stats · GET /api/progress/weekly
              GET /api/progress/skills · GET /api/progress/challenge · POST /api/progress/challenge/submit
Placement     GET /api/placement/test · POST /api/placement/submit · GET /api/placement/history
Admin         GET /api/admin/users · GET /api/admin/users/:id · POST /api/admin/users/:id/block
              GET /api/admin/analytics · GET /api/admin/mistakes
              GET/POST/PATCH/DELETE /api/admin/languages
```

---

## 🔐 Security Notes

- Passwords hashed with bcrypt (10 rounds)
- JWT stored client-side (localStorage) with 401 auto-logout
- Helmet + CORS whitelist + per-endpoint rate limiting
- Zod validation on every input
- Prisma parameterized queries (SQL injection safe)
- AI keys live only in `server/.env`, never exposed to the client
- Each user's data is scoped by `userId` on every query
- Admin endpoints require the `ADMIN` role

---

Made with ❤️ for people who want to stop repeating their mistakes.