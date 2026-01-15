import express from 'express';
import {
  authMiddleware,
  createDispute,
  getUserDisputes
} from '../controllers/disputeController.js';

const router = express.Router();

// Create dispute
router.post('/', authMiddleware, createDispute);

// Get all disputes for logged-in user
router.get('/', authMiddleware, getUserDisputes);

export default router;

