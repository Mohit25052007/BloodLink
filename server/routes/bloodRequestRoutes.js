import { Router } from 'express';
import {
  createBloodRequest,
  getBloodRequests,
  getBloodRequestById,
  updateBloodRequest,
  updateBloodRequestStatus,
  deleteBloodRequest,
  getMyBloodRequests,
} from '../controllers/bloodRequestController.js';
import {
  createBloodRequestValidator,
  updateBloodRequestValidator,
  validateObjectId,
} from '../validators/requestValidators.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Public listing with filters & auto-expiry
router.get('/', getBloodRequests);

// My personal blood requests
router.get('/my-requests', requireAuth, getMyBloodRequests);

// Get single request detail (uses optionalAuth so owner can view full details if logged in)
router.get('/:id', validateObjectId('id'), optionalAuth, getBloodRequestById);

// Create new blood request
router.post('/', requireAuth, createBloodRequestValidator, createBloodRequest);

// Update blood request details
router.patch('/:id', requireAuth, updateBloodRequestValidator, updateBloodRequest);

// Update status specifically ('open', 'fulfilled', 'cancelled')
router.patch('/:id/status', requireAuth, validateObjectId('id'), updateBloodRequestStatus);

// Delete blood request
router.delete('/:id', requireAuth, validateObjectId('id'), deleteBloodRequest);

export default router;
