import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import { prisma } from '../db/client.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(['admin', 'librarian', 'citizen']),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  mobile: z.string().min(10),
  dateOfBirth: z.string(),
  address: z.string().min(5),
});

function signTokens(userId: string, role: string, email: string) {
  const access = jwt.sign({ id: userId, role, email }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
  });
  const refresh = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  });
  return { access, refresh };
}

// POST /api/auth/login
authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password, role } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || user.role !== role || !user.isActive) {
      res.status(401).json({ error: 'Invalid credentials' }); return;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) { res.status(401).json({ error: 'Invalid credentials' }); return; }

    const { access, refresh } = signTokens(user.id, user.role, user.email);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({ data: { id: uuid(), token: refresh, userId: user.id, expiresAt } });

    const { passwordHash: _, ...safeUser } = user;
    res.json({ user: safeUser, accessToken: access, refreshToken: refresh });
  } catch (e) { next(e); }
});

// POST /api/auth/register (citizen self-registration)
authRouter.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const exists = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (exists) { res.status(409).json({ error: 'Email already registered' }); return; }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        id: uuid(),
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        mobile: data.mobile,
        role: 'citizen',
      },
    });

    const { access, refresh } = signTokens(user.id, user.role, user.email);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({ data: { id: uuid(), token: refresh, userId: user.id, expiresAt } });

    const { passwordHash: _, ...safeUser } = user;
    res.status(201).json({ user: safeUser, accessToken: access, refreshToken: refresh });
  } catch (e) { next(e); }
});

// POST /api/auth/refresh
authRouter.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) { res.status(401).json({ error: 'No refresh token' }); return; }

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken }, include: { user: true } });
    if (!stored || stored.expiresAt < new Date()) {
      res.status(401).json({ error: 'Invalid or expired refresh token' }); return;
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
    const { access, refresh: newRefresh } = signTokens(stored.user.id, stored.user.role, stored.user.email);

    // Rotate refresh token
    await prisma.refreshToken.delete({ where: { id: stored.id } });
    await prisma.refreshToken.create({
      data: { id: uuid(), token: newRefresh, userId: stored.user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });

    res.json({ accessToken: access, refreshToken: newRefresh });
  } catch (e) { next(e); }
});

// POST /api/auth/logout
authRouter.post('/logout', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    res.json({ message: 'Logged out' });
  } catch (e) { next(e); }
});

// GET /api/auth/me
authRouter.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, role: true, avatarUrl: true, mobile: true, libraryId: true, createdAt: true },
    });
    res.json(user);
  } catch (e) { next(e); }
});
