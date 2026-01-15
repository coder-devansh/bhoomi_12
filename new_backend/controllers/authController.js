import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Auto-assign admin role if email is admin@bhoomisetu.com
    let userRole = role || 'user';
    if (email === 'admin@bhoomisetu.com') {
      userRole = 'admin';
    }
    // Auto-assign lawyer role if email contains @lawyer or ends with @lawyer.com
    if (email.includes('@lawyer') || email.endsWith('@lawyer.com')) {
      userRole = 'lawyer';
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role: userRole });
    await user.save();

    return res.status(201).json({ message: 'User registered successfully', role: userRole });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
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
        role: user.role || 'user'
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
};

