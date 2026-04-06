# LMS Backend — Setup Guide

## Prerequisites
- Node.js 20+
- PostgreSQL 15+ (local or cloud — Supabase, Neon, Railway all work)
- pnpm

## 1. Install dependencies
```bash
cd server
pnpm install
```

## 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your database URL, JWT secrets, Razorpay keys
```

## 3. Set up the database
```bash
# Push schema to your PostgreSQL database
pnpm db:push

# Seed with initial data (admin user, sample libraries, plans)
pnpm db:seed
```

## 4. Run the server
```bash
# Development (auto-reload)
pnpm dev

# Production
pnpm build && pnpm start
```

## 5. Run the frontend
```bash
cd ../artifacts/lms
# Make sure .env.local has VITE_API_URL=http://localhost:4000
pnpm dev
```

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/login | — | Login |
| POST | /api/auth/register | — | Citizen self-registration |
| POST | /api/auth/refresh | — | Refresh access token |
| GET | /api/auth/me | ✓ | Current user |
| GET | /api/libraries | — | List all libraries |
| POST | /api/libraries | admin | Create library |
| GET | /api/books | — | Search books |
| POST | /api/books | admin/librarian | Add book |
| GET | /api/digital | — | List digital resources |
| POST | /api/borrow | citizen | Submit borrow request |
| PATCH | /api/borrow/:id/approve | admin/librarian | Approve request |
| GET | /api/fines | ✓ | View fines |
| GET | /api/memberships | — | List plans |
| POST | /api/memberships/card | citizen | Issue library card |
| POST | /api/payments/order | ✓ | Create Razorpay order |
| POST | /api/payments/verify | ✓ | Verify payment |
| GET | /api/notifications | ✓ | User notifications |
| POST | /api/upload/photo | ✓ | Upload photo |
| POST | /api/upload/media | ✓ | Upload book/media file |
| POST | /api/checkins | admin/librarian | QR check-in |

---

## Production Deployment

### Option A: Railway (easiest)
1. Push code to GitHub
2. Create Railway project → Add PostgreSQL service
3. Deploy server from GitHub
4. Set environment variables in Railway dashboard

### Option B: VPS (DigitalOcean / AWS EC2)
1. Install Node.js, PostgreSQL, nginx
2. Clone repo, `pnpm install`, `pnpm build`
3. Use PM2: `pm2 start dist/index.js --name lms-server`
4. Configure nginx reverse proxy to port 4000
5. SSL via Let's Encrypt: `certbot --nginx`

### Frontend (Vercel / Netlify)
1. Set `VITE_API_URL` to your server's public URL
2. Deploy `artifacts/lms` folder
3. Set build command: `pnpm build`
4. Set output directory: `dist/public`

---

## Razorpay Integration
1. Create account at razorpay.com
2. Get Key ID and Key Secret from Dashboard → Settings → API Keys
3. Set in `.env`:
   ```
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxx
   RAZORPAY_KEY_SECRET=your_secret
   ```
4. Add webhook in Razorpay dashboard → `https://yourserver.com/api/payments/webhook`

## File Storage (Production)
For production, replace local storage with S3:
1. Create S3 bucket in AWS
2. Set `STORAGE_TYPE=s3` and AWS credentials in `.env`
3. Update `src/middleware/upload.ts` to use `multer-s3`
