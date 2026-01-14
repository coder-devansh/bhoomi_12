import express from 'express';
import Dispute from '../models/Dispute.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Simple admin middleware (for demo, checks for admin email)
function adminAuth(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.userId = decoded.userId;
    // For demo: treat first registered user as admin
    User.findById(req.userId).then(user => {
      if (user && user.email === 'admin@bhoomisetu.com') {
        next();
      } else {
        res.status(403).json({ message: 'Admin access required' });
      }
    });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Get all disputes (admin only)
router.get('/disputes', adminAuth, async (req, res) => {
  try {
    const disputes = await Dispute.find().populate('user', 'name email');
    res.json(disputes);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update dispute status (admin only)
router.patch('/disputes/:id', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const dispute = await Dispute.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email');
    if (!dispute) return res.status(404).json({ message: 'Dispute not found' });
    res.json(dispute);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
