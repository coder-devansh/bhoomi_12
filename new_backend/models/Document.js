import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  // Basic document info
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  
  // Document classification
  documentType: {
    type: String,
    enum: [
      'land_deed',
      'sale_deed', 
      'mutation_record',
      'survey_map',
      'tax_receipt',
      'identity_proof',
      'address_proof',
      'court_order',
      'agreement',
      'affidavit',
      'power_of_attorney',
      'partition_deed',
      'inheritance_certificate',
      'encumbrance_certificate',
      'other'
    ],
    default: 'other'
  },
  
  // Ownership
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Associated dispute (optional)
  disputeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dispute',
    default: null
  },
  
  // Blockchain verification
  blockchain: {
    fileHash: {
      type: String,
      required: true,
      unique: true
    },
    metadataHash: {
      type: String,
      required: true
    },
    transactionId: {
      type: String,
      default: null
    },
    blockIndex: {
      type: Number,
      default: null
    },
    blockHash: {
      type: String,
      default: null
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: {
      type: Date,
      default: null
    },
    registeredAt: {
      type: Date,
      default: Date.now
    }
  },
  
  // Document status
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'archived'],
    default: 'pending'
  },
  
  // Access control
  visibility: {
    type: String,
    enum: ['private', 'dispute_parties', 'lawyers', 'lawyer', 'public'],
    default: 'private'
  },
  
  // Verification history
  verificationHistory: [{
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    status: String,
    remarks: String,
    hashMatch: Boolean
  }],
  
  // Additional metadata
  description: {
    type: String,
    default: ''
  },
  tags: [{
    type: String
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
documentSchema.index({ 'blockchain.fileHash': 1 });
documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ disputeId: 1 });
documentSchema.index({ documentType: 1 });
documentSchema.index({ status: 1 });

// Virtual for blockchain verification status
documentSchema.virtual('isBlockchainSecured').get(function() {
  return this.blockchain.blockHash !== null && this.blockchain.isVerified;
});

// Pre-save middleware to update timestamps
documentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Document = mongoose.model('Document', documentSchema);

export default Document;
