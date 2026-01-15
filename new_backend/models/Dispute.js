import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  disputeType: {
    type: String,
    enum: ['mutual-partition', 'family-partition', 'boundary-demarcation', 'other'],
    default: 'other'
  },
  name: String,
  landNumber: String,
  khataNumber: String,
  landArea: String,
  aadhaarNumber: String,
  mobileNumber: String,
  address: String,
  docs: [String],
  
  // Document attachments with verification
  documents: [{
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    fileName: String,
    documentType: String,
    fileHash: String,
    uploadedAt: { type: Date, default: Date.now },
    // OCR extraction data
    ocrExtraction: {
      extractedText: String,
      confidence: Number,
      extractedAt: Date,
      keywordsFound: [String],
      detectedDocType: String
    },
    // Verification workflow
    verification: {
      status: {
        type: String,
        enum: ['pending', 'ocr-processed', 'lawyer-review', 'verified', 'rejected'],
        default: 'pending'
      },
      ocrVerified: { type: Boolean, default: false },
      lawyerVerified: { type: Boolean, default: false },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      verifiedAt: Date,
      rejectionReason: String,
      lawyerRemarks: String
    }
  }],
  
  // Overall document verification status
  documentVerification: {
    totalDocuments: { type: Number, default: 0 },
    ocrProcessed: { type: Number, default: 0 },
    lawyerVerified: { type: Number, default: 0 },
    rejected: { type: Number, default: 0 },
    overallStatus: {
      type: String,
      enum: ['pending', 'partial', 'complete', 'issues-found'],
      default: 'pending'
    }
  },
  
  status: {
    type: String,
    enum: ['open', 'in progress', 'documents-pending', 'under-review', 'resolved'],
    default: 'open'
  },
  assignedLawyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lawyerNotes: [{
    lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lawyerName: String,
    note: String,
    createdAt: { type: Date, default: Date.now }
  }],
  // AI-Enhanced Fields
  aiAnalysis: {
    riskLevel: String,
    estimatedResolutionTime: String,
    legalCategory: String,
    successProbability: String,
    keyIssues: [String],
    recommendedActions: [String],
    analyzedAt: Date
  },
  fraudCheckResult: {
    riskScore: Number,
    riskLevel: String,
    flags: [{
      type: String,
      severity: String,
      message: String
    }],
    checkedAt: Date
  },
  priorityScore: {
    score: Number,
    priority: String,
    calculatedAt: Date
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Dispute', disputeSchema);

