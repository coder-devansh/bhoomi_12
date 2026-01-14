import express from 'express';
import Dispute from '../models/Dispute.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify token
function auth(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Create dispute
router.post('/', auth, async (req, res) => {
  try {
    const {
      title, description, name, landNumber, khataNumber, landArea, aadhaarNumber, mobileNumber, address, docs
    } = req.body;
    const dispute = new Dispute({
      user: req.userId,
      title,
      description,
      name,
      landNumber,
      khataNumber,
      landArea,
      aadhaarNumber,
      mobileNumber,
      address,
      docs
    });
    await dispute.save();
    res.status(201).json(dispute);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all disputes for user
router.get('/', auth, async (req, res) => {
  try {
    const disputes = await Dispute.find({ user: req.userId });
    res.json(disputes);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
