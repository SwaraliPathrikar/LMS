import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { prisma } from '../db/client.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';

export const checkInsRouter = Router();

// GET /api/checkins?libraryId=&active=true
checkInsRouter.get('/', authenticate, requireRole('admin', 'librarian'), async (req: AuthRequest, res, next) => {
  try {
    const { libraryId, active } = req.query as Record<string, string>;
    const where: any = {};
    if (libraryId) where.libraryId = libraryId;
    if (active === 'true') where.checkOutTime = null;
    const records = await prisma.checkInRecord.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, libraryCard: true } } },
      orderBy: { checkInTime: 'desc' },
      take: 100,
    });
    res.json(records);
  } catch (e) { next(e); }
});

// POST /api/checkins — check in by QR payload or userId
checkInsRouter.post('/', authenticate, requireRole('admin', 'librarian'), async (req: AuthRequest, res, next) => {
  try {
    const { userId, libraryId, qrPayload } = req.body;
    let resolvedUserId = userId;

    if (qrPayload && !userId) {
      const parsed = JSON.parse(qrPayload);
      const card = await prisma.libraryCard.findFirst({ where: { cardNumber: parsed.cardId } });
      if (!card) { res.status(404).json({ error: 'Card not found' }); return; }
      resolvedUserId = card.userId;
    }

    const record = await prisma.checkInRecord.create({
      data: { id: uuid(), userId: resolvedUserId, libraryId },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    });
    res.status(201).json(record);
  } catch (e) { next(e); }
});

// PATCH /api/checkins/:id/checkout
checkInsRouter.patch('/:id/checkout', authenticate, requireRole('admin', 'librarian'), async (_req, res, next) => {
  try {
    const record = await prisma.checkInRecord.update({
      where: { id: _req.params.id },
      data: { checkOutTime: new Date() },
    });
    res.json(record);
  } catch (e) { next(e); }
});
