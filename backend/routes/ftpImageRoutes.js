import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import FtpImage from '../models/FtpImage.js';
import Image from '../models/Image.js';
import { protect } from '../middleware/auth.js';

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

// GET /api/ftp-images -> return all images with ftp-upload tag
router.get('/', protect, async (req, res) => {
  try {
    const images = await Image.find({ tags: 'ftp-upload' }).sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/ftp-images/search?query= -> search by title
router.get('/search', protect, async (req, res) => {
  try {
    const query = req.query.query;
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }
    const images = await Image.find({
      tags: 'ftp-upload',
      title: { $regex: query, $options: 'i' }
    }).sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/ftp-images/upload -> HTTP endpoint simulating FTP file transfer for frontend
router.post('/upload', protect, (req, res) => {
  // 3. Ensure multer is configured correctly for multiple file upload
  upload.array('images', 50)(req, res, async (err) => {
    // 1. Add proper error handling using try-catch in the backend
    try {
      // 2. Log errors in the console to identify the issue
      if (err) {
        console.error('Multer upload error:', err);
        // Return 400 Bad Request for Multer parsing errors (like bad form boundary or too many files)
        return res.status(400).json({ message: 'File upload failed', error: err.message });
      }

      // 4. Verify upload folder exists and is accessible
      if (!fs.existsSync(ftpUploadsDir)) {
        console.error('Upload folder missing:', ftpUploadsDir);
        return res.status(500).json({ message: 'Upload directory is not accessible' });
      }

      // 5. Check if files are received in req.files
      if (!req.files || req.files.length === 0) {
        console.error('No files received in req.files');
        return res.status(400).json({ message: 'No images uploaded' });
      }

      console.log(`Received ${req.files.length} files for FTP upload`);

      // 6. Validate MongoDB schema and save operation
      // FtpImage schema expects filename and base64 string
      const savedCount = [];
      for (const file of req.files) {
        try {
          const fileBuffer = fs.readFileSync(file.path);
          const base64Str = fileBuffer.toString('base64');
          const mimeType = file.mimetype || 'image/jpeg';
          
          const newFtpImage = new FtpImage({
            filename: file.originalname,
            base64: `data:${mimeType};base64,${base64Str}`
          });
          
          await newFtpImage.save();
          savedCount.push(newFtpImage);
          console.log(`Saved FtpImage record for ${file.originalname}`);
        } catch (dbError) {
          console.error(`MongoDB save operation failed for ${file.originalname}:`, dbError);
          // We don't return 500 here to allow other files to process, but we log the error
        }
      }

      // 7. Return proper error response with message
      res.status(200).json({ 
        message: 'Files successfully uploaded for FTP processing', 
        count: req.files.length,
        savedToDb: savedCount.length
      });
    } catch (error) {
      console.error('Server error during FTP upload:', error);
      res.status(500).json({ message: error.message || 'Internal server error' });
    }
  });
});

export default router;
