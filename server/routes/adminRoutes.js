import { Router } from 'express';
import {
  getAdminDashboardStats,
  getAdminUsers,
  updateUserVerification,
  updateUserStatus,
  getAdminBloodRequests,
  updateAdminBloodRequestStatus,
} from '../controllers/adminController.js';
import { validateObjectId } from '../validators/requestValidators.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Strictly require both authentication and admin privileges
router.use(requireAuth, requireAdmin);

router.get('/dashboard', getAdminDashboardStats);
router.get('/users', getAdminUsers);
router.patch('/users/:id/verification', validateObjectId('id'), updateUserVerification);
router.patch('/users/:id/status', validateObjectId('id'), updateUserStatus);
router.get('/blood-requests', getAdminBloodRequests);
router.patch('/blood-requests/:id/status', validateObjectId('id'), updateAdminBloodRequestStatus);

export default router;
