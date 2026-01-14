import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  name: String,
  landNumber: String,
  khataNumber: String,
  landArea: String,
  aadhaarNumber: String,
  mobileNumber: String,
  address: String,
  docs: [String], // store file names or URLs if you implement file upload
  status: { type: String, enum: ['open', 'in progress', 'resolved'], default: 'open' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Dispute', disputeSchema);
