import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { prisma } from '../db/client.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';

export const borrowRouter = Router();

// GET /api/borrow?libraryId=&status=&userId=
borrowRouter.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { libraryId, status, userId, page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: any = {};

    if (req.user!.role === 'citizen') where.userId = req.user!.id;
    else {
      if (userId) where.userId = userId;
      if (libraryId) where.libraryId = libraryId;
    }
    if (status) where.status = status;

    const [requests, total] = await Promise.all([
      prisma.borrowRequest.findMany({
        where, skip, take: parseInt(limit),
        include: {
          user: { select: { id: true, name: true, email: true, mobile: true } },
          book: { select: { id: true, title: true, author: true, coverImageUrl: true } },
          library: { select: { id: true, name: true } },
        },
        orderBy: { requestDate: 'desc' },
      }),
      prisma.borrowRequest.count({ where }),
    ]);

    res.json({ requests, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (e) { next(e); }
});

const createSchema = z.object({
  bookId: z.string().uuid(),
  libraryId: z.string().uuid(),
  issueType: z.string(),
  reason: z.string().min(5),
  purpose: z.string().min(3),
  mobile: z.string().min(10),
});

// POST /api/borrow
borrowRouter.post('/', authenticate, requireRole('citizen'), async (req: AuthRequest, res, next) => {
  try {
    const data = createSchema.parse(req.body);
    const request = await prisma.borrowRequest.create({
      data: { id: uuid(), userId: req.user!.id, ...data as any },
      include: { book: true, library: true },
    });

    // Notify librarian
    const librarians = await prisma.user.findMany({ where: { libraryId: data.libraryId, role: 'librarian' } });
    await prisma.notification.createMany({
      data: librarians.map(l => ({
        id: uuid(), userId: l.id, type: 'borrow_request' as any,
        title: 'New Borrow Request',
        message: `${req.user!.email} requested "${request.book.title}"`,
        actionUrl: `/admin/requests-approve`,
      })),
    });

    res.status(201).json(request);
  } catch (e) { next(e); }
});

// PATCH /api/borrow/:id/approve
borrowRouter.patch('/:id/approve', authenticate, requireRole('admin', 'librarian'), async (req: AuthRequest, res, next) => {
  try {
    const { dueDate } = req.body;
    const request = await prisma.borrowRequest.update({
      where: { id: req.params.id },
      data: { status: 'approved', responseDate: new Date(), dueDate: dueDate ? new Date(dueDate) : undefined },
      include: { book: true, user: true },
    });

    // Decrease inventory
    await prisma.bookInventory.updateMany({
      where: { bookId: request.bookId, libraryId: request.libraryId },
      data: { availableCount: { decrement: 1 } },
    });

    // Notify citizen
    await prisma.notification.create({
      data: {
        id: uuid(), userId: request.userId, type: 'approval' as any,
        title: 'Borrow Request Approved',
        message: `Your request for "${request.book.title}" has been approved. Due: ${dueDate ?? 'TBD'}`,
        actionUrl: '/user/borrowed',
      },
    });

    res.json(request);
  } catch (e) { next(e); }
});

// PATCH /api/borrow/:id/reject
borrowRouter.patch('/:id/reject', authenticate, requireRole('admin', 'librarian'), async (req: AuthRequest, res, next) => {
  try {
    const { rejectionReason } = req.body;
    const request = await prisma.borrowRequest.update({
      where: { id: req.params.id },
      data: { status: 'rejected', responseDate: new Date(), rejectionReason },
      include: { book: true, user: true },
    });

    await prisma.notification.create({
      data: {
        id: uuid(), userId: request.userId, type: 'approval' as any,
        title: 'Borrow Request Rejected',
        message: `Your request for "${request.book.title}" was rejected. Reason: ${rejectionReason}`,
      },
    });

    res.json(request);
  } catch (e) { next(e); }
});

// PATCH /api/borrow/:id/return
borrowRouter.patch('/:id/return', authenticate, requireRole('admin', 'librarian'), async (req: AuthRequest, res, next) => {
  try {
    const request = await prisma.borrowRequest.update({
      where: { id: req.params.id },
      data: { status: 'returned', returnDate: new Date() },
      include: { book: true },
    });

    // Restore inventory
    await prisma.bookInventory.updateMany({
      where: { bookId: request.bookId, libraryId: request.libraryId },
      data: { availableCount: { increment: 1 } },
    });

    res.json(request);
  } catch (e) { next(e); }
});
