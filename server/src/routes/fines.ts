import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { prisma } from '../db/client.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';

export const finesRouter = Router();

// GET /api/fines?userId=&libraryId=&status=
finesRouter.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { userId, libraryId, status } = req.query as Record<string, string>;
    const where: any = {};
    if (req.user!.role === 'citizen') where.userId = req.user!.id;
    else if (userId) where.userId = userId;
    if (status) where.status = status;

    const fines = await prisma.fine.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        book: { select: { id: true, title: true, author: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(fines);
  } catch (e) { next(e); }
});

// POST /api/fines (create fine — admin/librarian)
finesRouter.post('/', authenticate, requireRole('admin', 'librarian'), async (req: AuthRequest, res, next) => {
  try {
    const fine = await prisma.fine.create({
      data: { id: uuid(), ...req.body },
    });

    await prisma.notification.create({
      data: {
        id: uuid(), userId: fine.userId, type: 'fine_alert' as any,
        title: 'Fine Issued',
        message: `A fine of ₹${fine.amount} has been issued on your account.`,
        actionUrl: '/fees',
      },
    });

    res.status(201).json(fine);
  } catch (e) { next(e); }
});

// PATCH /api/fines/:id/pay
finesRouter.patch('/:id/pay', authenticate, requireRole('admin', 'librarian'), async (req: AuthRequest, res, next) => {
  try {
    const fine = await prisma.fine.update({
      where: { id: req.params.id },
      data: { status: 'paid', paidDate: new Date() },
    });
    res.json(fine);
  } catch (e) { next(e); }
});

// PATCH /api/fines/:id/waive
finesRouter.patch('/:id/waive', authenticate, requireRole('admin', 'librarian'), async (req: AuthRequest, res, next) => {
  try {
    const fine = await prisma.fine.update({
      where: { id: req.params.id },
      data: { status: 'waived' },
    });
    res.json(fine);
  } catch (e) { next(e); }
});
