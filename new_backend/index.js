import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import fs from 'fs';

import authRoutes from './routes/auth.js';
import disputeRoutes from './routes/dispute.js';
import adminRoutes from './routes/admin.js';
import lawyerRoutes from './routes/lawyer.js';
import aiRoutes from './routes/ai.js';
import documentRoutes from './routes/documents.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust proxy for production (needed for services like Render, Railway, etc.)
app.set('trust proxy', 1);

// CORS configuration for production
const corsOptions = {
  origin: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Frontend dist path
const frontendDistPath = path.join(__dirname, '../frontend/dist');
const frontendIndexPath = path.join(frontendDistPath, 'index.html');

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/lawyer', lawyerRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/documents', documentRoutes);

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));
  } else {
    console.warn('Frontend dist folder not found at:', frontendDistPath);
  }
}

// Simple health route
app.get('/', (req, res) => {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(frontendIndexPath)) {
    res.sendFile(frontendIndexPath);
  } else {
    res.send('BhoomiSetu Backend API is running');
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'BhoomiSetu API ready',
    environment: process.env.NODE_ENV || 'development',
    frontendAvailable: fs.existsSync(frontendIndexPath),
    timestamp: new Date().toISOString()
  });
});

// Handle client-side routing in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      if (fs.existsSync(frontendIndexPath)) {
        res.sendFile(frontendIndexPath);
      } else {
        res.status(404).json({ error: 'Frontend not built. Please run npm run build.' });
      }
    }
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bhoomisetu';

// Connect to MongoDB first, then start server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    // Start server after successful DB connection
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err?.message || err);
    // Start server anyway for health checks
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`⚠️ Server running on port ${PORT} (without database)`);
    });
  });


