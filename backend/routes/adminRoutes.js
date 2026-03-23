import express from 'express';
import { getUsers, updateUserRole, grantAccess, revokeAccess } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// All routes here are protected and require admin role
router.use(protect, admin);

router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.post('/access/grant', grantAccess);
router.post('/access/revoke', revokeAccess);

export default router;
