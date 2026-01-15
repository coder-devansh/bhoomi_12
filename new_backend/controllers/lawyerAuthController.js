import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

import Lawyer from '../models/Lawyer.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const toPublicUploadsUrl = (absoluteOrRelativePath) => {
  // Stored filePath is an absolute path from multer; convert to /uploads/... for browser usage.
  // We only expose the part under the backend uploads directory.
  const uploadsRoot = path.join(__dirname, '..', 'uploads');
  const relativeToUploads = path
    .relative(uploadsRoot, absoluteOrRelativePath)
    .split(path.sep)
    .join('/');
  return `/uploads/${relativeToUploads}`;
};

export const lawyerSignup = async (req, res) => {
  try {
    const { name, email, password, phone, barCouncilNumber } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Verification document is required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingLawyer = await Lawyer.findOne({ email: normalizedEmail });
    if (existingLawyer) {
      return res.status(400).json({ message: 'Lawyer application already exists for this email' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered as a user' });
    }

    // Password is issued by admin after verification. If password is sent anyway, accept it;
    // otherwise set a random placeholder hash (will be replaced on verification).
    const rawPassword = password ? String(password) : `pending-${Date.now()}-${Math.random()}`;
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const lawyer = await Lawyer.create({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      phone: phone ? String(phone).trim() : '',
      barCouncilNumber: barCouncilNumber ? String(barCouncilNumber).trim() : '',
      verificationStatus: 'PENDING',
      verificationDocument: {
        filePath: req.file.path,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size
      },
      submittedAt: new Date()
    });

    return res.status(201).json({
      success: true,
      message: 'Lawyer application submitted. Awaiting admin verification.',
      lawyer: {
        id: lawyer._id,
        name: lawyer.name,
        email: lawyer.email,
        verificationStatus: lawyer.verificationStatus,
        submittedAt: lawyer.submittedAt,
        verificationDocumentUrl: toPublicUploadsUrl(lawyer.verificationDocument.filePath)
      }
    });
  } catch (err) {
    console.error('Lawyer signup error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const lawyerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const lawyer = await Lawyer.findOne({ email: normalizedEmail });
    if (!lawyer) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (lawyer.verificationStatus !== 'VERIFIED') {
      return res.status(403).json({
        message:
          lawyer.verificationStatus === 'REJECTED'
            ? 'Your lawyer application was rejected'
            : 'Your lawyer application is pending admin verification'
      });
    }

    const isMatch = await bcrypt.compare(password, lawyer.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Ensure there is a corresponding User record for downstream RBAC/middlewares.
    // This keeps existing lawyer-only endpoints working without refactors.
    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      user = await User.create({
        name: lawyer.name,
        email: lawyer.email,
        password: lawyer.passwordHash,
        role: 'lawyer'
      });
    } else if (user.role !== 'admin' && user.role !== 'lawyer') {
      user.role = 'lawyer';
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '1d' }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      lawyer: {
        lawyerId: lawyer._id,
        verificationStatus: lawyer.verificationStatus,
        verifiedAt: lawyer.verifiedAt
      }
    });
  } catch (err) {
    console.error('Lawyer login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
