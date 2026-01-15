import mongoose from 'mongoose';

const lawyerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      default: ''
    },

    phone: {
      type: String,
      default: ''
    },
    barCouncilNumber: {
      type: String,
      default: ''
    },

    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING'
    },
    verificationDocument: {
      filePath: { type: String, required: true },
      originalName: { type: String, required: true },
      mimeType: { type: String, required: true },
      fileSize: { type: Number, required: true }
    },

    submittedAt: {
      type: Date,
      default: Date.now
    },
    verifiedAt: {
      type: Date,
      default: null
    },
    rejectedAt: {
      type: Date,
      default: null
    },
    rejectionReason: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const Lawyer = mongoose.model('Lawyer', lawyerSchema);
export default Lawyer;
