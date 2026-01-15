import Dispute from '../models/Dispute.js';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
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
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const createDispute = async (req, res) => {
  try {
    const {
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
    return res.status(201).json(dispute);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getUserDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find({ user: req.userId });
    return res.json(disputes);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

