import jwt from 'jsonwebtoken';
import Dispute from '../models/Dispute.js';
import User from '../models/User.js';
import Lawyer from '../models/Lawyer.js';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const toPublicUploadsUrl = (absoluteOrRelativePath) => {
  const uploadsRoot = path.join(__dirname, '..', 'uploads');
  const relativeToUploads = path
    .relative(uploadsRoot, absoluteOrRelativePath)
    .split(path.sep)
    .join('/');
  return `/uploads/${relativeToUploads}`;
};

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

export const getAllLawyers = async (req, res) => {
  try {
    const lawyers = await Lawyer.find().sort({ createdAt: -1 });
    return res.json({
      success: true,
      count: lawyers.length,
      lawyers: lawyers.map((l) => ({
        id: l._id,
        name: l.name,
        email: l.email,
        phone: l.phone,
        barCouncilNumber: l.barCouncilNumber,
        verificationStatus: l.verificationStatus,
        submittedAt: l.submittedAt,
        verifiedAt: l.verifiedAt,
        rejectedAt: l.rejectedAt,
        rejectionReason: l.rejectionReason,
        verificationDocumentUrl: l.verificationDocument?.filePath
          ? toPublicUploadsUrl(l.verificationDocument.filePath)
          : null
      }))
    });
  } catch (err) {
    console.error('Error fetching lawyers:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const verifyLawyer = async (req, res) => {
  try {
    const { status, rejectionReason, tempPassword } = req.body;

    if (!status || !['VERIFIED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: "Status must be 'VERIFIED' or 'REJECTED'" });
    }

    const lawyer = await Lawyer.findById(req.params.id);
    if (!lawyer) {
      return res.status(404).json({ message: 'Lawyer not found' });
    }

    let issuedPassword = null;
    if (status === 'VERIFIED') {
      // Admin-issued credentials: if admin didn't provide a password, generate one.
      const generated = `BS-${Math.random().toString(36).slice(2, 8)}-${Math.random().toString(36).slice(2, 8)}`;
      issuedPassword = String(tempPassword || generated);
      lawyer.passwordHash = await bcrypt.hash(issuedPassword, 10);
    }

    lawyer.verificationStatus = status;
    lawyer.rejectionReason = status === 'REJECTED' ? String(rejectionReason || '').trim() : '';
    lawyer.verifiedAt = status === 'VERIFIED' ? new Date() : null;
    lawyer.rejectedAt = status === 'REJECTED' ? new Date() : null;
    await lawyer.save();

    // On verification, create a User account for existing RBAC + lawyer endpoints.
    if (status === 'VERIFIED') {
      const existingUser = await User.findOne({ email: lawyer.email });
      if (!existingUser) {
        await User.create({
          name: lawyer.name,
          email: lawyer.email,
          password: lawyer.passwordHash,
          role: 'lawyer'
        });
      } else if (existingUser.role !== 'admin' && existingUser.role !== 'lawyer') {
        existingUser.role = 'lawyer';
        existingUser.password = lawyer.passwordHash;
        await existingUser.save();
      }
    }

    return res.json({
      success: true,
      message: status === 'VERIFIED' ? 'Lawyer verified successfully' : 'Lawyer rejected',
      issuedPassword,
      lawyer: {
        id: lawyer._id,
        name: lawyer.name,
        email: lawyer.email,
        verificationStatus: lawyer.verificationStatus,
        verifiedAt: lawyer.verifiedAt,
        rejectedAt: lawyer.rejectedAt,
        rejectionReason: lawyer.rejectionReason,
        verificationDocumentUrl: lawyer.verificationDocument?.filePath
          ? toPublicUploadsUrl(lawyer.verificationDocument.filePath)
          : null
      }
    });
  } catch (err) {
    console.error('Error verifying lawyer:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

