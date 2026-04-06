# SmartLib — Municipal Library Management System

A full-stack Library Management System built for municipal corporations.

## Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, Prisma ORM
- **Database**: PostgreSQL
- **Auth**: JWT + bcrypt
- **Payments**: Razorpay (test mode)

## Quick Start

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd Verse-Core

# Install frontend deps
cd artifacts/lms && npm install

# Install backend deps
cd ../../server && npm install
```

### 2. Setup Backend
```bash
cd server
cp .env.example .env
# Edit .env — set DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET

npx prisma db push
npx tsx src/db/seed-full.ts
```

### 3. Setup Frontend
```bash
cd artifacts/lms
cp .env.example .env.local
# Leave VITE_API_URL empty for local dev (uses Vite proxy)
```

### 4. Run
```bash
# Terminal 1 — Backend
cd server && npx tsx src/index.ts

# Terminal 2 — Frontend
cd artifacts/lms && npm run dev
```

Open: `http://localhost:5173/lms/login`

## Login Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@corp.gov.in | admin@123 |
| Librarian | meera.kulkarni@lib.gov.in | librarian@123 |
| Citizen | rajesh@email.com | citizen@123 |

## Project Structure
```
Verse-Core/
├── artifacts/lms/     # React frontend
│   ├── src/
│   │   ├── pages/     # All page components
│   │   ├── contexts/  # Auth, Books context
│   │   ├── lib/       # API client, utilities
│   │   └── components/
│   └── .env.example
└── server/            # Express backend
    ├── src/
    │   ├── routes/    # API routes
    │   ├── middleware/ # Auth, upload
    │   └── db/        # Prisma client, seed
    ├── prisma/
    │   └── schema.prisma
    └── .env.example
```

## Features
- Role-based access (Admin / Librarian / Citizen)
- Citizen registration with library card + QR code
- Book catalog, digital resources (PDF/audio/video reader)
- Borrow requests, approvals, fines management
- Membership plans with per-library pricing
- Events management
- Real-time notifications
- QR-based check-in/check-out
- Razorpay payment integration
- PWA-ready (installable on mobile)
