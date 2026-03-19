import express from 'express';
import { authUser, registerUser, getUserProfile, googleLogin } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/signup', registerUser);
router.post('/login', authUser);
router.post('/google', googleLogin);
router.route('/profile').get(protect, getUserProfile);

export default router;
