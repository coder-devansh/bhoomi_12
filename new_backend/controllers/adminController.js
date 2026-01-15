import jwt from 'jsonwebtoken';
import Dispute from '../models/Dispute.js';
import User from '../models/User.js';

export const adminAuthMiddleware = async (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(
      token.replace('Bearer ', ''),
      process.env.JWT_SECRET || 'dev_secret'
    );
    req.userId = decoded.userId;

    const user = await User.findById(req.userId);
    if (user && user.email === 'admin@bhoomisetu.com') {
      return next();
    }

    return res.status(403).json({ message: 'Admin access required' });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const getAllDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find().populate('user', 'name email');
    return res.json(disputes);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const updateDisputeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const dispute = await Dispute.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email');

    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    return res.json(dispute);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

