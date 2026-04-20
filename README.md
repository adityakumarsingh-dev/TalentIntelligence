# 🛡️ TalentIntelligence: Enterprise AI Auditing Engine

**Official Submission for CIMAGE Hackathon 2026**
*The Future of Semantic Resume Intelligence & Placement Analytics*

---

## 🔗 Project Ecosystem

| Resource | Access Link |
| :--- | :--- |
| **Live Production Link** | [https://talent-intelligence-nine.vercel.app](https://talent-intelligence-nine.vercel.app) |
| **GitHub Repository** | [https://github.com/adityakumarsingh-dev/TalentIntelligence](https://github.com/adityakumarsingh-dev/TalentIntelligence) |
| **Build Status** | ![Vercel Deployment](https://img.shields.io/badge/Vercel-Success-brightgreen) |

---

## 📌 1. Executive Summary

**TalentIntelligence** is a high-performance auditing engine designed to eliminate the "ATS Gap." Traditional keyword-based systems overlook high-potential candidates; our engine utilizes a **Multi-Model LLM Orchestration** to evaluate resumes with the technical nuance of a Senior CTO. By leveraging **Groq's LPU (Language Processing Unit)**, we achieve sub-2-second inference speeds.

---

## ✨ 2. Core Modules & Features

### 🛡️ CTO-Level Technical Audit

- **Semantic Scoring:** Evaluates project complexity rather than just keyword density.
- **Gap Identification:** Pinpoints specific industry-standard tools missing from the profile.

### 🎙️ AI-Driven Interview Kit

- **Contextual Questions:** Generates 5 unique technical questions based *only* on the projects listed in the resume.
- **Difficulty Scaling:** Adjusts complexity based on the candidate's self-claimed expertise.

### 📊 Market Benchmarking

- Compares the resume against real-time 2026 job market requirements for Full-Stack, AI, and DevOps roles.

### 🗺️ Personalized Growth Roadmap

- Provides a structured 4-step actionable learning path to bridge identified skill gaps.

---

## 🏗️ 3. Technical Architecture & Engineering

The system utilizes a **Serverless Parallel Dispatch Architecture** for maximum efficiency:

- **Concurrency Model:** Uses `Promise.all()` to trigger 4 independent AI agents simultaneously, reducing total latency from ~4.5s to **~1.7s**.
- **Hybrid AI Routing:**
  - **Reasoning:** Routed to `Llama-3.3-70b-versatile`.
  - **Data Extraction:** Routed to `Llama-3.1-8b-instant`.
- **Integer Defense:** Custom validation logic that sanitizes AI-generated JSON before it hits the frontend.
- **Edge Parsing:** PDF text extraction is performed on the client-side (`pdfjs-dist`), ensuring zero server-side memory bottlenecks.

---

## 📂 4. Project Structure

The repository follows a strict, modular Next.js 15 App Router architecture:

```text
PLACEMENT-AI/
├── app/                  # Next.js App Router (Pages & Layouts)
│   ├── api/
│   │   ├── analyze/      # POST: Core AI Orchestration & Parallel Dispatch
│   │   └── history/      # GET: Audited history retrieval from MongoDB
│   ├── globals.css       # Global design system & Tailwind tokens
│   ├── layout.tsx        # Root layout with context providers
│   └── page.tsx          # Main Landing & Dashboard UI logic
├── lib/
│   └── dbConnect.ts      # Singleton pattern for Database connection
├── models/
│   └── Analysis.ts       # Mongoose Schema for type-safe resume data
├── public/               # Optimized SVG assets (Logos, Icons)
├── .env.local            # Local secrets (Git ignored for security)
├── docker-compose.yml    # Production container orchestration
├── Dockerfile            # Multi-stage production build
├── package.json          # Dependencies & Scripts
└── README.md             # Project documentation
```

---

## 🚀 5. Setup & Evaluation Instructions

To evaluate the project locally, please follow these steps exactly:

**1. Clone this repository:**

```bash
git clone https://github.com/adityakumarsingh-dev/TalentIntelligence.git
cd TalentIntelligence
```

**2. Setup Environment Variables:**

Create a `.env.local` file in the root directory and add your credentials:

```env
GROQ_API_KEY=your_actual_api_key_here
MONGODB_URI=your_mongodb_atlas_uri_here
```

**3. Run via Docker (Recommended for Judges):**

```bash
docker-compose up --build -d
```

**4. Run via NPM (Local Development Mode):**

```bash
npm install
npm run dev
```

The application will be accessible at `http://localhost:3000`

---

## 🛠️ 6. Technology Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router) |
| **AI Engine** | Groq Cloud LPU (Llama 3.3 70b & 3.1 8b) |
| **Database** | MongoDB Atlas + Mongoose ODM |
| **Styling** | Tailwind CSS + Framer Motion (Animations) |
| **Deployment** | Vercel (Production) & Docker (Containerization) |

---

*Developed by **Aditya Kumar Singh** | Bachelor of Computer Applications (BCA) | CIMAGE College, Patna*