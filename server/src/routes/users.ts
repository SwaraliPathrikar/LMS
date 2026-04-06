import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { prisma } from '../db/client.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';

export const usersRouter = Router();

// GET /api/users?role=&libraryId=
usersRouter.get('/', authenticate, requireRole('admin', 'librarian'), async (req: AuthRequest, res, next) => {
  try {
    const { role, libraryId } = req.query as Record<string, string>;
    const where: any = {};
    if (role) where.role = role;
    if (libraryId) where.libraryId = libraryId;
    const users = await prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true, mobile: true, avatarUrl: true, libraryId: true, isActive: true, createdAt: true },
      orderBy: { name: 'asc' },
    });
    res.json(users);
  } catch (e) { next(e); }
});

// GET /api/users/:id
usersRouter.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (req.user!.role === 'citizen' && req.user!.id !== req.params.id) {
      res.status(403).json({ error: 'Forbidden' }); return;
    }
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, email: true, role: true, mobile: true, avatarUrl: true, libraryId: true, isActive: true, createdAt: true, libraryCard: { include: { plan: true, libraries: true } } },
    });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json(user);
  } catch (e) { next(e); }
});

// POST /api/users (admin creates librarian/admin)
usersRouter.post('/', authenticate, requireRole('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { name, email, password, role, mobile, libraryId } = req.body;
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { id: uuid(), name, email: email.toLowerCase(), passwordHash, role, mobile, libraryId },
      select: { id: true, name: true, email: true, role: true, mobile: true, libraryId: true },
    });
    res.status(201).json(user);
  } catch (e) { next(e); }
});

// PATCH /api/users/:id
usersRouter.patch('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (req.user!.role === 'citizen' && req.user!.id !== req.params.id) {
      res.status(403).json({ error: 'Forbidden' }); return;
    }
    const { password, ...rest } = req.body;
    const data: any = { ...rest };
    if (password) data.passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: { id: true, name: true, email: true, role: true, mobile: true, avatarUrl: true },
    });
    res.json(user);
  } catch (e) { next(e); }
});

// DELETE /api/users/:id (soft delete)
usersRouter.delete('/:id', authenticate, requireRole('admin'), async (_req, res, next) => {
  try {
    await prisma.user.update({ where: { id: _req.params.id }, data: { isActive: false } });
    res.json({ message: 'User deactivated' });
  } catch (e) { next(e); }
});
