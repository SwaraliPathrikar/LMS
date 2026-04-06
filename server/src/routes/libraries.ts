import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { prisma } from '../db/client.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';

export const librariesRouter = Router();

// GET /api/libraries
librariesRouter.get('/', async (_req, res, next) => {
  try {
    const libs = await prisma.library.findMany({
      where: { isActive: true },
      include: { department: true, settings: true },
      orderBy: { name: 'asc' },
    });
    res.json(libs);
  } catch (e) { next(e); }
});

// GET /api/libraries/:id
librariesRouter.get('/:id', async (req, res, next) => {
  try {
    const lib = await prisma.library.findUnique({
      where: { id: req.params.id },
      include: { department: true, settings: true, librarians: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    });
    if (!lib) { res.status(404).json({ error: 'Library not found' }); return; }
    res.json(lib);
  } catch (e) { next(e); }
});

const librarySchema = z.object({
  name: z.string().min(2),
  address: z.string().min(5),
  phone: z.string().min(10),
  mapLink: z.string().url().optional(),
  departmentId: z.string().uuid(),
});

// POST /api/libraries (admin only)
librariesRouter.post('/', authenticate, requireRole('admin'), async (req: AuthRequest, res, next) => {
  try {
    const data = librarySchema.parse(req.body);
    const lib = await prisma.library.create({
      data: { id: uuid(), ...data },
    });
    // Create default settings
    await prisma.librarySettings.create({ data: { id: uuid(), libraryId: lib.id } });
    res.status(201).json(lib);
  } catch (e) { next(e); }
});

// PATCH /api/libraries/:id (admin only)
librariesRouter.patch('/:id', authenticate, requireRole('admin'), async (req: AuthRequest, res, next) => {
  try {
    const data = librarySchema.partial().parse(req.body);
    const lib = await prisma.library.update({ where: { id: req.params.id }, data });
    res.json(lib);
  } catch (e) { next(e); }
});

// DELETE /api/libraries/:id (admin only — soft delete)
librariesRouter.delete('/:id', authenticate, requireRole('admin'), async (req: AuthRequest, res, next) => {
  try {
    await prisma.library.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ message: 'Library deactivated' });
  } catch (e) { next(e); }
});

// PATCH /api/libraries/:id/settings
librariesRouter.patch('/:id/settings', authenticate, requireRole('admin', 'librarian'), async (req: AuthRequest, res, next) => {
  try {
    const settings = await prisma.librarySettings.upsert({
      where: { libraryId: req.params.id },
      update: req.body,
      create: { id: uuid(), libraryId: req.params.id, ...req.body },
    });
    res.json(settings);
  } catch (e) { next(e); }
});
