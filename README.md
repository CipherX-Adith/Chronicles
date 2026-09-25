# Untold Letterbox

> **"Say it. Leave it here."**  
> An intimate, anonymous letterbox platform and editorial publishing pipeline.

---

## ✦ Product Philosophy

**The website is primarily a beautiful place to write. Instagram is the public distribution channel.**

Untold Letterbox is designed like a physical letter drop combined with a high-end independent editorial magazine. There are **no accounts, no passwords, no student IDs, no profiles, no public comment feeds, and zero IP address logging**. 

Writers drop notes anonymously; the editorial admin team privately reviews submissions, ensures community safety, and exports crisp 1080 × 1350 (4:5 portrait) Instagram-ready visuals.

---

## 🏛️ System Architecture

```text
Writer (Web Client)
        │
        ▼ (POST /api/submissions)
Express REST API (Rate limiting, Zod validation, Zero PII logging)
        │
        ▼
Prisma ORM (SQLite for dev / PostgreSQL for prod)
        │
        ▼
Admin Review Desk (JWT Auth, Guidelines checklist, Moderation flags)
        │
        ▼
Instagram Canvas Engine (1080 × 1350 editorial graphics generator)
        │
        ▼
Download PNG & Copy Caption ➔ Manual Instagram Posting
(Meta Graph API service ready for direct auto-publishing)
```

---

## 🎨 Visual Design Language

- **Palette**: Warm paper (`#ebe7de`, `#f5f2eb`), rich charcoal ink (`#111719`), coral accent (`#ef6878`), subtle parchment grain.
- **Typography**: `Space Grotesk` (headings/sans) + `DM Mono` (metadata/stamps) + `Newsreader` (editorial italics).
- **Physical Details**: Tactile message card, tape strip decorations, stamps, inset field shadows.
- **Mobile First**: Fluidly responsive layout tuned for mobile phone writers.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v20+)
- **npm** v9+

### 2. Setup & Database Seeding

Run the following commands from the project root:

```bash
# Install backend dependencies
cd backend
npm install

# Initialize Prisma Database & Seed Sample Submissions + Admin
npx prisma db push
npm run prisma:seed

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Run Locally

Open two terminal windows:

**Terminal 1 — Backend API (Port 4000):**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend Dev Server (Port 5180):**
```bash
cd frontend
npm run dev
```

Now open **http://localhost:5180** in your browser.

---

## 🔑 Admin Credentials (Pre-seeded)

- **URL**: `http://localhost:5180/#admin`
- **Email**: `admin@untoldletterbox.com`
- **Password**: `admin_password_123`

*(You can customize these credentials in `backend/.env`)*

---

## 📸 Instagram Post Generator

1. Log into the **Admin Deck** at `/#admin`.
2. Review pending letters & confessions.
3. Click **"📸 GENERATE INSTAGRAM POST"** on any approved note.
4. The system dynamically renders a **1080 × 1350 (4:5 portrait)** graphic with auto-wrapped text, optimal font sizing, and brand styling.
5. Click **"📥 DOWNLOAD INSTAGRAM POST (.PNG)"** and **"📋 COPY INSTAGRAM CAPTION"**.
6. Upload to the official Instagram account and click **"MARK AS POSTED"**.

---

## 🛡️ Privacy & Security

- **Strict Anonymity**: Sender IP addresses, browser agents, and device fingerprints are deliberately excluded from the database schema.
- **Generic Confirmations**: Submissions return `{ received: true, reference: "MC-XXXX" }` without leaking internal moderation status.
- **Server-Side Validation**: Zod schema validation on payload boundaries.
- **Rate Limiting**: IP-based rate limiting via `express-rate-limit` prevents spam flooding.
- **Security Headers**: `helmet` enabled with CORS whitelisting.

---

## 📦 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Canvas API, Lucide Icons, Custom Editorial CSS
- **Backend**: Node.js, Express, TypeScript, Helmet, CORS, Express-Rate-Limit, Zod, JWT, Bcrypt
- **Database**: Prisma ORM (SQLite / PostgreSQL)
