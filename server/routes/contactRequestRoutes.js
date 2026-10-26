import { Router } from 'express';
import {
  createContactRequest,
  getIncomingRequests,
  getOutgoingRequests,
  respondToContactRequest,
  cancelContactRequest,
} from '../controllers/contactRequestController.js';
import {
  createContactRequestValidator,
  respondContactRequestValidator,
  validateObjectId,
} from '../validators/requestValidators.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// All contact request routes require authentication
router.use(requireAuth);

router.post('/', createContactRequestValidator, createContactRequest);
router.get('/incoming', getIncomingRequests);
router.get('/outgoing', getOutgoingRequests);
router.patch('/:id/respond', respondContactRequestValidator, respondToContactRequest);
router.patch('/:id/cancel', validateObjectId('id'), cancelContactRequest);

export default router;
