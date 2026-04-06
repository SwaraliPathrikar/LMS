import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { prisma } from '../db/client.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';

export const digitalResourcesRouter = Router();

// GET /api/digital?q=&type=
digitalResourcesRouter.get('/', async (req, res, next) => {
  try {
    const { q, type, page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: any = { isActive: true };
    if (q) where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { author: { contains: q, mode: 'insensitive' } },
    ];
    if (type) where.type = type;

    const [resources, total] = await Promise.all([
      prisma.digitalResource.findMany({ where, skip, take: parseInt(limit), orderBy: { title: 'asc' } }),
      prisma.digitalResource.count({ where }),
    ]);
    res.json({ resources, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (e) { next(e); }
});

// GET /api/digital/:id
digitalResourcesRouter.get('/:id', async (req, res, next) => {
  try {
    const r = await prisma.digitalResource.findUnique({ where: { id: req.params.id } });
    if (!r) { res.status(404).json({ error: 'Resource not found' }); return; }
    res.json(r);
  } catch (e) { next(e); }
});

const schema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  authors: z.array(z.string()).default([]),
  type: z.enum(['pdf', 'audiobook', 'video', 'research_paper', 'article', 'e_document']),
  description: z.string(),
  accessType: z.enum(['open', 'restricted', 'paid']).default('open'),
  cost: z.number().optional(),
  fileUrl: z.string().url().optional(),
  fileSize: z.number().default(0),
  keywords: z.array(z.string()).default([]),
  language: z.string().default('English'),
  publishedYear: z.number().int().optional(),
  researchDomain: z.string().optional(),
  researchField: z.string().optional(),
});

// POST /api/digital (admin/librarian)
digitalResourcesRouter.post('/', authenticate, requireRole('admin', 'librarian'), async (req: AuthRequest, res, next) => {
  try {
    const data = schema.parse(req.body);
    const resource = await prisma.digitalResource.create({ data: { id: uuid(), ...data } as any });
    res.status(201).json(resource);
  } catch (e) { next(e); }
});

// PATCH /api/digital/:id
digitalResourcesRouter.patch('/:id', authenticate, requireRole('admin', 'librarian'), async (req: AuthRequest, res, next) => {
  try {
    const data = schema.partial().parse(req.body);
    const resource = await prisma.digitalResource.update({ where: { id: req.params.id }, data: data as any });
    res.json(resource);
  } catch (e) { next(e); }
});

// DELETE /api/digital/:id
digitalResourcesRouter.delete('/:id', authenticate, requireRole('admin'), async (_req, res, next) => {
  try {
    await prisma.digitalResource.update({ where: { id: _req.params.id }, data: { isActive: false } });
    res.json({ message: 'Resource removed' });
  } catch (e) { next(e); }
});

// POST /api/digital/:id/download — log download
digitalResourcesRouter.post('/:id/download', authenticate, async (req: AuthRequest, res, next) => {
  try {
    await prisma.downloadLog.create({ data: { id: uuid(), resourceId: req.params.id, userId: req.user!.id } });
    await prisma.digitalResource.update({ where: { id: req.params.id }, data: { downloadCount: { increment: 1 } } });
    res.json({ message: 'Download logged' });
  } catch (e) { next(e); }
});
