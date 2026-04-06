import multer from 'multer';
import path from 'path';
import { v4 as uuid } from 'uuid';
import fs from 'fs';

const uploadDir = process.env.UPLOAD_DIR ?? './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuid()}${ext}`);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = /jpeg|jpg|png|gif|webp|pdf|mp3|mp4|wav|ogg|m4a|epub/;
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error(`File type .${ext} not allowed`));
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 500 * 1024 * 1024 } }); // 500MB
export const uploadPhoto = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB photos
