import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { prisma } from '../db/client.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';

export const booksRouter = Router();

// GET /api/books?q=&genre=&libraryId=&type=
booksRouter.get('/', async (req, res, next) => {
  try {
    const { q, genre, libraryId, type, page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = { isActive: true };
    if (q) where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { author: { contains: q, mode: 'insensitive' } },
      { keywords: { has: q.toLowerCase() } },
    ];
    if (genre) where.genre = genre;
    if (type) where.issueTypes = { has: type };

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: libraryId
          ? { inventory: { where: { libraryId } } }
          : { inventory: true },
        orderBy: { title: 'asc' },
      }),
      prisma.book.count({ where }),
    ]);

    res.json({ books, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (e) { next(e); }
});

// GET /api/books/:id
booksRouter.get('/:id', async (req, res, next) => {
  try {
    const book = await prisma.book.findUnique({
      where: { id: req.params.id },
      include: { inventory: { include: { library: true } } },
    });
    if (!book) { res.status(404).json({ error: 'Book not found' }); return; }
    res.json(book);
  } catch (e) { next(e); }
});

const bookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  isbn: z.string().min(10),
  genre: z.string(),
  keywords: z.array(z.string()).default([]),
  description: z.string().optional(),
  publisher: z.string().optional(),
  language: z.string().default('English'),
  publishedYear: z.number().int(),
  pages: z.number().int().optional(),
  issueTypes: z.array(z.string()).default([]),
  accessType: z.enum(['open', 'restricted', 'paid']).default('open'),
  categories: z.array(z.string()).default([]),
  cost: z.number().optional(),
  borrowPeriodDays: z.number().int().optional(),
  fileUrl: z.string().url().optional(),
  coverImageUrl: z.string().url().optional(),
});

// POST /api/books (admin/librarian)
booksRouter.post('/', authenticate, requireRole('admin', 'librarian'), async (req: AuthRequest, res, next) => {
  try {
    const data = bookSchema.parse(req.body);
    const book = await prisma.book.create({ data: { id: uuid(), ...data } as any });
    res.status(201).json(book);
  } catch (e) { next(e); }
});

// PATCH /api/books/:id
booksRouter.patch('/:id', authenticate, requireRole('admin', 'librarian'), async (req: AuthRequest, res, next) => {
  try {
    const data = bookSchema.partial().parse(req.body);
    const book = await prisma.book.update({ where: { id: req.params.id }, data: data as any });
    res.json(book);
  } catch (e) { next(e); }
});

// DELETE /api/books/:id (soft delete)
booksRouter.delete('/:id', authenticate, requireRole('admin'), async (_req, res, next) => {
  try {
    await prisma.book.update({ where: { id: _req.params.id }, data: { isActive: false } });
    res.json({ message: 'Book removed' });
  } catch (e) { next(e); }
});

// PATCH /api/books/:id/inventory — update stock for a library
booksRouter.patch('/:id/inventory', authenticate, requireRole('admin', 'librarian'), async (req: AuthRequest, res, next) => {
  try {
    const { libraryId, totalCount, availableCount } = req.body;
    const inv = await prisma.bookInventory.upsert({
      where: { bookId_libraryId: { bookId: req.params.id, libraryId } },
      update: { totalCount, availableCount },
      create: { id: uuid(), bookId: req.params.id, libraryId, totalCount, availableCount },
    });
    res.json(inv);
  } catch (e) { next(e); }
});
