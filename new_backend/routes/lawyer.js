import express from 'express';
import {
  lawyerAuthMiddleware,
  getAllDisputes,
  getDisputeById,
  addLawyerNote,
  updateDisputeStatus
} from '../controllers/lawyerController.js';

const router = express.Router();

// All lawyer routes require authentication
router.use(lawyerAuthMiddleware);

// Get all disputes
router.get('/disputes', getAllDisputes);

// Get a specific dispute
router.get('/disputes/:id', getDisputeById);

// Add lawyer note to a dispute
router.post('/disputes/:id/notes', addLawyerNote);

// Update dispute status
router.patch('/disputes/:id/status', updateDisputeStatus);

export default router;
