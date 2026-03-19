import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import FtpImage from '../models/FtpImage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ftpUploadsDir = path.join(__dirname, '../ftp-uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(ftpUploadsDir)) {
      fs.mkdirSync(ftpUploadsDir, { recursive: true });
    }
    cb(null, ftpUploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

const router = express.Router();

// GET /api/ftp-images -> return all images
router.get('/', async (req, res) => {
  try {
    const images = await FtpImage.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/ftp-images/search?query= -> search by filename
router.get('/search', async (req, res) => {
  try {
    const query = req.query.query;
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }
    const images = await FtpImage.find({ filename: { $regex: query, $options: 'i' } }).sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/ftp-images/upload -> HTTP endpoint simulating FTP file transfer for frontend
router.post('/upload', upload.array('images', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }
    
    // The images are successfully placed into ftp-uploads directory!
    // FtpServer.js (chokidar) will auto-process them and save them to MongoDB
    res.status(200).json({ message: 'Files successfully uploaded for FTP processing', count: req.files.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
