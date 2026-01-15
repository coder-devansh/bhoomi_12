import jwt from 'jsonwebtoken';
import Dispute from '../models/Dispute.js';
import User from '../models/User.js';

export const lawyerAuthMiddleware = async (req, res, next) => {
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
    if (user && (user.role === 'lawyer' || user.role === 'admin')) {
      return next();
    }

    return res.status(403).json({ message: 'Lawyer access required' });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all disputes (lawyers can view all disputes)
export const getAllDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find().populate('user', 'name email');
    return res.json(disputes);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific dispute by ID
export const getDisputeById = async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.id).populate('user', 'name email');
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }
    return res.json(dispute);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Add lawyer notes/comments to a dispute
export const addLawyerNote = async (req, res) => {
  try {
    const { note } = req.body;
    const lawyer = await User.findById(req.userId);
    
    if (!lawyer) {
      return res.status(404).json({ message: 'Lawyer not found' });
    }

    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    // Initialize notes array if it doesn't exist
    if (!dispute.lawyerNotes) {
      dispute.lawyerNotes = [];
    }

    dispute.lawyerNotes.push({
      lawyerId: lawyer._id,
      lawyerName: lawyer.name,
      note: note,
      createdAt: new Date()
    });

    await dispute.save();
    return res.json(dispute);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update dispute status (lawyers can update status)
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
