import express from 'express';
import { getGalleries, createGallery, deleteGallery } from '../controllers/galleryController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getGalleries)
  .post(protect, createGallery);  // any logged-in user can create a gallery

router.route('/:id')
  .delete(protect, admin, deleteGallery);

export default router;
