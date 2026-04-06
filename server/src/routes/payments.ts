import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import crypto from 'crypto';
import { prisma } from '../db/client.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

export const paymentsRouter = Router();

// POST /api/payments/order — create Razorpay order
paymentsRouter.post('/order', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { amount, planId, billingCycle } = req.body;

    // Dynamically import Razorpay only if key is configured
    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('xxxx')) {
      // Demo mode — return a mock order
      const mockOrder = { id: `order_demo_${Date.now()}`, amount: amount * 100, currency: 'INR', status: 'created' };
      const payment = await prisma.payment.create({
        data: { id: uuid(), userId: req.user!.id, planId, billingCycle, amount, razorpayOrderId: mockOrder.id, status: 'pending' },
      });
      res.json({ order: mockOrder, paymentId: payment.id, demo: true });
      return;
    }

    const Razorpay = (await import('razorpay')).default;
    const rzp = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID!, key_secret: process.env.RAZORPAY_KEY_SECRET! });
    const order = await rzp.orders.create({ amount: amount * 100, currency: 'INR', receipt: uuid() });

    const payment = await prisma.payment.create({
      data: { id: uuid(), userId: req.user!.id, planId, billingCycle, amount, razorpayOrderId: order.id as string, status: 'pending' },
    });

    res.json({ order, paymentId: payment.id, key: process.env.RAZORPAY_KEY_ID });
  } catch (e) { next(e); }
});

// POST /api/payments/verify — verify Razorpay signature
paymentsRouter.post('/verify', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentId } = req.body;

    // Demo mode
    if (razorpayOrderId?.startsWith('order_demo_')) {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'completed', razorpayPaymentId: `pay_demo_${Date.now()}` },
      });
      res.json({ verified: true });
      return;
    }

    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSig !== razorpaySignature) {
      res.status(400).json({ error: 'Invalid payment signature' }); return;
    }

    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'completed', razorpayPaymentId },
    });

    res.json({ verified: true });
  } catch (e) { next(e); }
});

// GET /api/payments/history
paymentsRouter.get('/history', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const where = req.user!.role === 'citizen' ? { userId: req.user!.id } : {};
    const payments = await prisma.payment.findMany({
      where,
      include: { plan: true, user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(payments);
  } catch (e) { next(e); }
});
