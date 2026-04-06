import { Router, Request, Response } from 'express';
import path from 'path';
import { authenticate } from '../middleware/auth.js';
import { upload, uploadPhoto } from '../middleware/upload.js';

export const uploadRouter = Router();

const baseUrl = () => process.env.SERVER_URL ?? `http://localhost:${process.env.PORT ?? 4000}`;

// POST /api/upload/photo — profile/card photos
uploadRouter.post('/photo', authenticate, uploadPhoto.single('file'), (req: Request, res: Response) => {
  if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }
  const url = `${baseUrl()}/uploads/${req.file.filename}`;
  res.json({ url, filename: req.file.filename });
});

// POST /api/upload/media — books, PDFs, audio, video
uploadRouter.post('/media', authenticate, upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }
  const url = `${baseUrl()}/uploads/${req.file.filename}`;
  res.json({ url, filename: req.file.filename, size: req.file.size, mimetype: req.file.mimetype });
});
