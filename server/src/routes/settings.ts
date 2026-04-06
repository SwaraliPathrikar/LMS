import { Router } from 'express';
import { prisma } from '../db/client.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';

export const settingsRouter = Router();

// GET /api/settings/system
settingsRouter.get('/system', authenticate, requireRole('admin'), async (_req, res, next) => {
  try {
    const settings = await prisma.systemSettings.upsert({
      where: { id: 'system' },
      update: {},
      create: { id: 'system' },
    });
    res.json(settings);
  } catch (e) { next(e); }
});

// PATCH /api/settings/system
settingsRouter.patch('/system', authenticate, requireRole('admin'), async (req: AuthRequest, res, next) => {
  try {
    const settings = await prisma.systemSettings.upsert({
      where: { id: 'system' },
      update: req.body,
      create: { id: 'system', ...req.body },
    });
    res.json(settings);
  } catch (e) { next(e); }
});
