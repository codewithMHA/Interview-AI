# 🚀 InterviewAI – AI-Powered Interview Preparation Platform

> A comprehensive, production-grade full-stack interview preparation platform engineered for Computer Science & Engineering (CSE) students targeting Tier-1 and product-based software engineering placements.

---

## 🌟 Core Modules

- **AI Mock Interviews**: Dynamically generated technical, HR, and behavioral questions powered by Google Gemini API with real-time quantitative rubrics (Accuracy, Technical Depth, Clarity, STAR framework).
- **AI Resume & ATS Placement Scanner**: Instant ATS match score (0-100%), skill-gap detection for Tier-1 companies (Amazon, Google, Microsoft, TCS), and Google X-Y-Z bullet rewrites.
- **Monaco Code Sandbox & Judge0 Execution**: In-browser coding practice supporting Python, JavaScript, Java, and C++ with test case execution and remote sandboxing.
- **AI Code Complexity & Bug Analysis**: Instant Big-O (Time & Space) evaluations and line-by-line beginner explanations.
- **Adaptive 30-Day Placement Roadmap**: Milestone-based curriculum personalized to the student's target role, experience level, and verified weak areas.
- **Placement Analytics & Gamification**: Readiness scores, topic mastery radar, daily streaks, and XP progression.
- **Curated Question Bank**: 500+ placement questions covering Core CS (DBMS, OS, CN, OOP) and Modern Web Development.

---

## 🏗️ Architecture & Technology Stack

```
interview-ai/
├── client/                     # React + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Design System: Button, Card, Badge, Modal, Input, Skeleton
│   │   │   └── layout/         # Navbar, Footer, MainLayout
│   │   ├── context/            # ThemeContext (Dark/Light Mode)
│   │   ├── pages/              # LandingPage, Login, Register, Dashboard
│   │   ├── services/           # Axios API client with interceptors
│   │   ├── types/              # TypeScript interfaces
│   │   └── utils/              # Utility functions (cn helper)
│   ├── tailwind.config.js      # Modern SaaS design palette & animations
│   └── vite.config.ts          # Vite bundler configuration
│
├── server/                     # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── config/             # DB & Environment variable configuration
│   │   ├── middleware/         # Centralized error handler & 404 handler
│   │   ├── routes/             # REST API routes (Health, Auth, Interview, Coding)
│   │   ├── types/              # Backend TypeScript types
│   │   ├── app.ts              # Express application factory with CORS & security
│   │   └── server.ts           # Server bootstrap and graceful shutdown
│   └── tsconfig.json           # NodeNext TypeScript configuration
│
├── .env.example                # Sample environment variables
├── .gitignore                  # Git ignore rules
└── package.json                # Monorepo workspaces runner
```

### Frontend Stack
- **Framework**: React 18 / Vite 6 / TypeScript
- **Styling**: Tailwind CSS with dark/light mode and custom glassmorphism
- **Routing**: React Router DOM v6
- **Icons**: Lucide React
- **HTTP Client**: Axios with unified error handling and token interceptors
- **Visuals**: Recharts for performance analytics

### Backend Stack
- **Runtime**: Node.js & Express with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing
- **AI Engine**: Google Gemini API via secure server proxy
- **Code Execution**: Judge0 API

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- MongoDB instance (local or MongoDB Atlas)

### 2. Clone and Install Dependencies
```bash
# Clone the repository
git clone <repo-url>
cd interview-ai

# Install all dependencies across client and server
npm run install:all
```

### 3. Environment Setup
Copy the sample environment file to `.env`:
```bash
cp .env.example .env
```
Fill in the following variables:
```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/interviewai
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_judge0_key
```

### 4. Running the Development Servers
```bash
# Run both Backend API (Port 5000) and Frontend Client (Port 3000) concurrently:
npm run dev

# Or run separately:
npm run dev:server   # In terminal 1
npm run dev:client   # In terminal 2
```

### 5. Automated System Verification (Phase 9)
```bash
# Run the complete end-to-end integration and security test suite:
npm run test:system
```

- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 📋 Implementation Roadmap

| Phase | Milestone | Status |
| :--- | :--- | :--- |
| **Phase 1** | Project setup + architecture + frontend design system | ✅ Completed |
| **Phase 2** | Authentication + MongoDB + User Profile & Onboarding | ✅ Completed |
| **Phase 3** | Student Dashboard + 500+ Curated Question Bank | ✅ Completed |
| **Phase 4** | Coding Practice + Monaco Sandbox + Judge0 Execution | ✅ Completed |
| **Phase 5** | Google Gemini AI Service (Code Analysis + Step-by-Step Explain) | ✅ Completed |
| **Phase 6** | AI Mock Interview Engine (Voice Speech-to-Text + Campus Rubrics) | ✅ Completed |
| **Phase 7** | Adaptive 30-Day Placement Roadmap Curriculum | ✅ Completed |
| **Phase 8** | Placement Analytics & Gamification (Dynamic Scoring, Multi-Track CS, Weak Areas) | ✅ Completed |
| **Phase 9** | Automated System Verification (21/21 Tests) + Security + Code-Splitting | ✅ Completed |
| **Phase 10** | AI Resume ATS Scanner + Docker Containerization + Production Deployment | ✅ Completed |

---

## 🐳 Docker Production Deployment

Run the complete multi-container production stack (Client + Server + MongoDB) with a single command:

```bash
# Build and start all services in detached mode
docker compose up --build -d

# Check service logs
docker compose logs -f

# Stop all services
docker compose down
```

- **Frontend App (Nginx SPA)**: [http://localhost:3000](http://localhost:3000)
- **Backend API (Node.js)**: [http://localhost:5000/api](http://localhost:5000/api)
- **MongoDB Database**: `mongodb://localhost:27017/interviewai`

---

## 🔒 Security Principles
1. **Zero Client-Side Secret Exposure**: Gemini and Judge0 API keys are strictly accessed via the server proxy layer.
2. **Password Security**: Passwords hashed with bcrypt using high salt rounds; plain-text passwords never stored.
3. **Safe Code Execution**: Arbitrary student code is strictly isolated inside Judge0 containers, never executed directly on the application host.

