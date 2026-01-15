import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  lawyerAuthMiddleware,
  getAllDisputes,
  getDisputeById,
  addLawyerNote,
  updateDisputeStatus
} from '../controllers/lawyerController.js';

import { lawyerLogin, lawyerSignup } from '../controllers/lawyerAuthController.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const lawyerVerificationDir = path.join(__dirname, '..', 'uploads', 'lawyer_verification');
if (!fs.existsSync(lawyerVerificationDir)) {
  fs.mkdirSync(lawyerVerificationDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, lawyerVerificationDir);
  },
  filename: (req, file, cb) => {
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeOriginal}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Public lawyer auth endpoints
router.post('/signup', upload.single('verificationDocument'), lawyerSignup);
router.post('/login', lawyerLogin);

// All remaining lawyer routes require authentication
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
