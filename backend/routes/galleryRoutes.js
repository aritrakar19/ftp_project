import express from 'express';
import { getGalleries, createGallery, deleteGallery } from '../controllers/galleryController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getGalleries)
  .post(protect, admin, createGallery);

router.route('/:id')
  .delete(protect, admin, deleteGallery);

export default router;
