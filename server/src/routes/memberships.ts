import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { prisma } from '../db/client.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';

export const membershipsRouter = Router();

// Helper: reshape plan so libraries = [{id, name}]
const shapePlan = (p: any) => ({
  ...p,
  libraries: (p.libraries ?? []).map((l: any) =>
    l.library ? { id: l.libraryId, name: l.library.name } : { id: l.id, name: l.name }
  ),
});

const planInclude = {
  libraries: { include: { library: { select: { id: true, name: true } } } },
};

// GET /api/memberships?libraryId=
membershipsRouter.get('/', async (req, res, next) => {
  try {
    const { libraryId } = req.query as Record<string, string>;
    const plans = await prisma.membershipPlan.findMany({
      where: {
        isActive: true,
        ...(libraryId ? {
          OR: [
            { libraries: { none: {} } },
            { libraries: { some: { libraryId } } },
          ],
        } : {}),
      },
      include: planInclude,
      orderBy: { monthlyPrice: 'asc' },
    });
    res.json(plans.map(shapePlan));
  } catch (e) { next(e); }
});

const planSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  monthlyPrice: z.number().min(0),
  yearlyPrice: z.number().min(0),
  maxBooks: z.number().int().min(1),
  color: z.string().default('gray'),
  libraryIds: z.array(z.string().uuid()).default([]),
});

// POST /api/memberships (admin)
membershipsRouter.post('/', authenticate, requireRole('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { libraryIds, ...data } = planSchema.parse(req.body);
    const planId = uuid();
    const plan = await prisma.membershipPlan.create({
      data: {
        id: planId,
        ...data,
        ...(libraryIds.length > 0 ? {
          libraries: {
            create: libraryIds.map(libraryId => ({ libraryId })),
          },
        } : {}),
      },
      include: planInclude,
    });
    res.status(201).json(shapePlan(plan));
  } catch (e) { next(e); }
});

// PATCH /api/memberships/:id (admin)
membershipsRouter.patch('/:id', authenticate, requireRole('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { libraryIds, ...data } = planSchema.partial().parse(req.body);
    // If libraryIds provided, replace all library associations
    if (libraryIds !== undefined) {
      await prisma.membershipPlanLibrary.deleteMany({ where: { planId: req.params.id } });
      if (libraryIds.length > 0) {
        await prisma.membershipPlanLibrary.createMany({
          data: libraryIds.map(libraryId => ({ planId: req.params.id, libraryId })),
        });
      }
    }
    const plan = await prisma.membershipPlan.update({
      where: { id: req.params.id },
      data,
      include: planInclude,
    });
    res.json(shapePlan(plan));
  } catch (e) { next(e); }
});

// DELETE /api/memberships/:id (soft delete)
membershipsRouter.delete('/:id', authenticate, requireRole('admin'), async (_req, res, next) => {
  try {
    await prisma.membershipPlan.update({ where: { id: _req.params.id }, data: { isActive: false } });
    res.json({ message: 'Plan deactivated' });
  } catch (e) { next(e); }
});

// POST /api/memberships/card — issue library card after payment
membershipsRouter.post('/card', authenticate, requireRole('citizen'), async (req: AuthRequest, res, next) => {
  try {
    const { planId, libraryIds, billingCycle, amountPaid, photoUrl, address, dateOfBirth, qrPayload } = req.body;

    const year = new Date().getFullYear();
    const count = await prisma.libraryCard.count();
    const cardNumber = `LMS-${year}-${String(count + 1).padStart(6, '0')}`;

    const expiryDate = new Date();
    if (billingCycle === 'yearly') expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    else expiryDate.setMonth(expiryDate.getMonth() + 1);

    const card = await prisma.libraryCard.create({
      data: {
        id: uuid(),
        cardNumber,
        userId: req.user!.id,
        planId,
        billingCycle,
        amountPaid,
        photoUrl,
        address,
        dateOfBirth,
        expiryDate,
        qrPayload,
        libraries: { connect: (libraryIds as string[]).map(id => ({ id })) },
      },
      include: { plan: true, libraries: true },
    });

    if (photoUrl) await prisma.user.update({ where: { id: req.user!.id }, data: { avatarUrl: photoUrl } });

    res.status(201).json(card);
  } catch (e) { next(e); }
});

// GET /api/memberships/card/me
membershipsRouter.get('/card/me', authenticate, requireRole('citizen'), async (req: AuthRequest, res, next) => {
  try {
    const card = await prisma.libraryCard.findUnique({
      where: { userId: req.user!.id },
      include: { plan: true, libraries: true },
    });
    res.json(card);
  } catch (e) { next(e); }
});
