import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
  updateDonorProfile,
  searchDonors,
  getDonorById,
} from '../controllers/userController.js';
import {
  updateProfileValidator,
  donorProfileValidator,
} from '../validators/authValidators.js';
import { validateObjectId } from '../validators/requestValidators.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Current user profile endpoints
router.get('/me', requireAuth, getMyProfile);
router.patch('/me', requireAuth, updateProfileValidator, updateMyProfile);
router.patch('/me/donor-profile', requireAuth, donorProfileValidator, updateDonorProfile);

// Public donor discovery (with privacy protection)
router.get('/donors', searchDonors);
router.get('/donors/:id', validateObjectId('id'), getDonorById);

export default router;
