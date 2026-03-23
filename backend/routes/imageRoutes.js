import express from 'express';
import { uploadImage, getImages, logDownload } from '../controllers/imageController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.route('/')
  .get(protect, getImages)
  .post(protect, upload.single('image'), uploadImage);  // any logged-in user can upload

router.route('/:id/download')
  .post(protect, logDownload);

export default router;
