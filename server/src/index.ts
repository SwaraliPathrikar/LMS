import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { librariesRouter } from './routes/libraries.js';
import { booksRouter } from './routes/books.js';
import { digitalResourcesRouter } from './routes/digitalResources.js';
import { borrowRouter } from './routes/borrow.js';
import { finesRouter } from './routes/fines.js';
import { eventsRouter } from './routes/events.js';
import { membershipsRouter } from './routes/memberships.js';
import { settingsRouter } from './routes/settings.js';
import { notificationsRouter } from './routes/notifications.js';
import { paymentsRouter } from './routes/payments.js';
import { uploadRouter } from './routes/upload.js';
import { checkInsRouter } from './routes/checkIns.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: true, // allow all origins in development
  credentials: true,
}));

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many requests' }));
app.use('/api', rateLimit({ windowMs: 60 * 1000, max: 300 }));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Static uploads ────────────────────────────────────────────────────────────
app.use('/uploads', express.static(process.env.UPLOAD_DIR ?? './uploads'));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',           authRouter);
app.use('/api/users',          usersRouter);
app.use('/api/libraries',      librariesRouter);
app.use('/api/books',          booksRouter);
app.use('/api/digital',        digitalResourcesRouter);
app.use('/api/borrow',         borrowRouter);
app.use('/api/fines',          finesRouter);
app.use('/api/events',         eventsRouter);
app.use('/api/memberships',    membershipsRouter);
app.use('/api/settings',       settingsRouter);
app.use('/api/notifications',  notificationsRouter);
app.use('/api/payments',       paymentsRouter);
app.use('/api/upload',         uploadRouter);
app.use('/api/checkins',       checkInsRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }));

// ── Error handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 LMS Server running on http://localhost:${PORT}`);
});
