import express from 'express';
import {
  adminAuthMiddleware,
  getAllDisputes,
  updateDisputeStatus,
  getAllLawyers,
  verifyLawyer
} from '../controllers/adminController.js';

const router = express.Router();

// Get all disputes (admin only)
router.get('/disputes', adminAuthMiddleware, getAllDisputes);

// Update dispute status (admin only)
router.patch('/disputes/:id', adminAuthMiddleware, updateDisputeStatus);

// Lawyer verification management (admin only)
router.get('/lawyers', adminAuthMiddleware, getAllLawyers);
router.patch('/lawyer/:id/verify', adminAuthMiddleware, verifyLawyer);

export default router;

