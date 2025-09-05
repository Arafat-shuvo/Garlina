import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { authRequired, adminOnly } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^\w.\-]+/g, '_');
    const unique = Date.now() + '-' + Math.round(Math.random()*1e9) + '-' + safe;
    cb(null, unique);
  }
});

const upload = multer({ storage });

const router = express.Router();

router.post('/', authRequired, adminOnly, upload.single('image'), (req, res) => {
  const fileUrl = '/uploads/' + req.file.filename;
  res.json({ url: fileUrl });
});

export default router;
