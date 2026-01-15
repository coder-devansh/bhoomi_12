// Quick test script to verify login functionality
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bhoomisetu';

async function testLogin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✓ MongoDB connected\n');

    // Check if test user exists
    const testEmail = 'test@example.com';
    let user = await User.findOne({ email: testEmail });

    if (!user) {
      console.log('Creating test user...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      user = new User({
        name: 'Test User',
        email: testEmail,
        password: hashedPassword,
        role: 'user'
      });
      await user.save();
      console.log('✓ Test user created\n');
    } else {
      console.log('✓ Test user already exists\n');
    }

    // Test login
    console.log('Testing login...');
    const testPassword = 'password123';
    const isMatch = await bcrypt.compare(testPassword, user.password);
    
    if (isMatch) {
      console.log('✓ Password verification successful');
      console.log('\nLogin Credentials:');
      console.log(`Email: ${testEmail}`);
      console.log(`Password: ${testPassword}`);
      console.log(`Role: ${user.role}`);
    } else {
      console.log('✗ Password verification failed');
    }

    // List all users
    const allUsers = await User.find().select('name email role');
    console.log('\nAll users in database:');
    allUsers.forEach(u => {
      console.log(`- ${u.email} (${u.name}) - Role: ${u.role}`);
    });

    await mongoose.disconnect();
    console.log('\n✓ Test completed');
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
}

testLogin();
