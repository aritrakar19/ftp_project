import express from 'express';
import { uploadImage, getImages, logDownload } from '../controllers/imageController.js';
import { protect, admin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.route('/')
  .get(getImages)
  .post(protect, admin, upload.single('image'), uploadImage);

router.route('/:id/download')
  .post(protect, logDownload);

export default router;
