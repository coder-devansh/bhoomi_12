import express from 'express';
import {
  adminAuthMiddleware,
  getAllDisputes,
  updateDisputeStatus
} from '../controllers/adminController.js';

const router = express.Router();

// Get all disputes (admin only)
router.get('/disputes', adminAuthMiddleware, getAllDisputes);

// Update dispute status (admin only)
router.patch('/disputes/:id', adminAuthMiddleware, updateDisputeStatus);

export default router;

