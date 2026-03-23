import express from 'express';
import { authUser, registerUser, getUserProfile, googleLogin, syncFirebaseUser } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/signup', registerUser);
router.post('/login', authUser);
router.post('/google', googleLogin);
router.post('/sync', syncFirebaseUser);
router.route('/profile').get(protect, getUserProfile);

export default router;
