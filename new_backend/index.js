import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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

app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/lawyer', lawyerRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/documents', documentRoutes);

// Simple health route
app.get('/', (req, res) => {
  res.send('New Bhoomisetu backend is running');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'new_backend ready' });
});

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bhoomisetu';

// Start server first, then connect to MongoDB
app.listen(PORT, () => {
  console.log(`New backend server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
});

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err?.message || err);
    console.log('Server will continue running, but database operations will fail.');
    console.log('Please ensure MongoDB is running or set MONGO_URI in .env file');
  });


