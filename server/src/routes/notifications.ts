import { Router } from 'express';
import { prisma } from '../db/client.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

export const notificationsRouter = Router();

// GET /api/notifications
notificationsRouter.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(notifications);
  } catch (e) { next(e); }
});

// PATCH /api/notifications/:id/read
notificationsRouter.patch('/:id/read', authenticate, async (req: AuthRequest, res, next) => {
  try {
    await prisma.notification.update({ where: { id: req.params.id, userId: req.user!.id }, data: { read: true } });
    res.json({ message: 'Marked as read' });
  } catch (e) { next(e); }
});

// PATCH /api/notifications/read-all
notificationsRouter.patch('/read-all', authenticate, async (req: AuthRequest, res, next) => {
  try {
    await prisma.notification.updateMany({ where: { userId: req.user!.id, read: false }, data: { read: true } });
    res.json({ message: 'All marked as read' });
  } catch (e) { next(e); }
});
