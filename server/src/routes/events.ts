import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { prisma } from '../db/client.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';

export const eventsRouter = Router();

// GET /api/events?libraryId=&status=
eventsRouter.get('/', async (req, res, next) => {
  try {
    const { libraryId, status } = req.query as Record<string, string>;
    const where: any = {};
    if (libraryId) where.libraryId = libraryId;
    if (status) where.status = status;
    const events = await prisma.event.findMany({
      where,
      include: { library: { select: { id: true, name: true } }, _count: { select: { registrations: true } } },
      orderBy: { startDate: 'asc' },
    });
    res.json(events);
  } catch (e) { next(e); }
});

const eventSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  category: z.enum(['reading', 'book_fair', 'storytelling', 'author_talk', 'workshop']),
  startDate: z.string(),
  endDate: z.string(),
  location: z.string(),
  libraryId: z.string().uuid(),
  capacity: z.number().int().min(1),
  imageUrl: z.string().url().optional(),
});

// POST /api/events
eventsRouter.post('/', authenticate, requireRole('admin', 'librarian'), async (req: AuthRequest, res, next) => {
  try {
    const data = eventSchema.parse(req.body);
    const event = await prisma.event.create({ data: { id: uuid(), ...data as any } });
    res.status(201).json(event);
  } catch (e) { next(e); }
});

// PATCH /api/events/:id
eventsRouter.patch('/:id', authenticate, requireRole('admin', 'librarian'), async (req: AuthRequest, res, next) => {
  try {
    const data = eventSchema.partial().parse(req.body);
    const event = await prisma.event.update({ where: { id: req.params.id }, data: data as any });
    res.json(event);
  } catch (e) { next(e); }
});

// DELETE /api/events/:id
eventsRouter.delete('/:id', authenticate, requireRole('admin', 'librarian'), async (_req, res, next) => {
  try {
    await prisma.event.update({ where: { id: _req.params.id }, data: { status: 'cancelled' } });
    res.json({ message: 'Event cancelled' });
  } catch (e) { next(e); }
});

// POST /api/events/:id/register
eventsRouter.post('/:id/register', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event) { res.status(404).json({ error: 'Event not found' }); return; }
    if (event.registeredCount >= event.capacity) { res.status(400).json({ error: 'Event is full' }); return; }

    const reg = await prisma.eventRegistration.create({
      data: { id: uuid(), eventId: req.params.id, userId: req.user!.id },
    });
    await prisma.event.update({ where: { id: req.params.id }, data: { registeredCount: { increment: 1 } } });
    res.status(201).json(reg);
  } catch (e) { next(e); }
});
