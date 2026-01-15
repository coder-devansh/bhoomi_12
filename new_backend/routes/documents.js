import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '../controllers/disputeController.js';
import { lawyerAuthMiddleware } from '../controllers/lawyerController.js';
import Document from '../models/Document.js';
import Dispute from '../models/Dispute.js';
import {
  generateDocumentHash,
  generateMetadataHash,
  createDocumentTransaction,
  minePendingTransactions,
  verifyDocumentIntegrity,
  getDocumentBlockchainRecord,
  getBlockchainStats,
  getFullBlockchain,
  generateVerificationCertificate,
  validateBlockchain
} from '../services/blockchainService.js';
import {
  extractDocumentText,
  analyzeDocumentContent,
  validateDocumentForDispute
} from '../services/ocrService.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/documents';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, images, and Word documents are allowed.'));
    }
  }
});

/**
 * @route POST /api/documents/upload
 * @desc Upload a document with blockchain hashing
 * @access Authenticated
 */
router.post('/upload', authMiddleware, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { documentType, disputeId, description, visibility } = req.body;
    
    // Read file and generate hash
    const fileBuffer = fs.readFileSync(req.file.path);
    const fileHash = generateDocumentHash(fileBuffer);
    
    // Check if document with same hash already exists
    const existingDoc = await Document.findOne({ 'blockchain.fileHash': fileHash });
    if (existingDoc) {
      // Remove the uploaded file since it's a duplicate
      fs.unlinkSync(req.file.path);
      return res.status(409).json({
        message: 'This document already exists in the system',
        existingDocument: {
          id: existingDoc._id,
          fileName: existingDoc.originalName,
          uploadedAt: existingDoc.createdAt,
          blockchainVerified: existingDoc.blockchain.isVerified
        }
      });
    }
    
    // Generate metadata hash
    const metadataHash = generateMetadataHash({
      fileName: req.file.originalname,
      uploadedBy: req.userId,
      timestamp: Date.now(),
      fileSize: req.file.size
    });
    
    // Create document record
    const document = new Document({
      fileName: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      filePath: req.file.path,
      documentType: documentType || 'other',
      uploadedBy: req.userId,
      disputeId: disputeId || null,
      description: description || '',
      visibility: visibility || 'private',
      blockchain: {
        fileHash: fileHash,
        metadataHash: metadataHash,
        registeredAt: new Date()
      }
    });
    
    await document.save();
    
    // Create blockchain transaction
    const transaction = createDocumentTransaction({
      documentId: document._id.toString(),
      fileName: req.file.originalname,
      fileHash: fileHash,
      uploadedBy: req.userId,
      disputeId: disputeId,
      documentType: documentType || 'other'
    });
    
    // Mine the transaction immediately (in production, batch mining would be better)
    const miningResult = minePendingTransactions();
    
    if (miningResult) {
      // Update document with blockchain info
      document.blockchain.transactionId = transaction.id;
      document.blockchain.blockIndex = miningResult.block.index;
      document.blockchain.blockHash = miningResult.block.hash;
      document.blockchain.isVerified = true;
      document.blockchain.verifiedAt = new Date();
      document.status = 'verified';
      await document.save();
    }
    
    return res.status(201).json({
      success: true,
      message: 'Document uploaded and secured on blockchain',
      document: {
        id: document._id,
        fileName: document.originalName,
        documentType: document.documentType,
        fileSize: document.fileSize,
        uploadedAt: document.createdAt
      },
      blockchain: {
        fileHash: fileHash,
        transactionId: transaction.id,
        blockIndex: miningResult?.block.index,
        blockHash: miningResult?.block.hash,
        secured: true
      }
    });
    
  } catch (err) {
    console.error('Document upload error:', err);
    return res.status(500).json({ message: 'Failed to upload document', error: err.message });
  }
});

/**
 * @route GET /api/documents/my-documents
 * @desc Get all documents uploaded by the current user
 * @access Authenticated
 */
router.get('/my-documents', authMiddleware, async (req, res) => {
  try {
    const documents = await Document.find({ uploadedBy: req.userId })
      .sort({ createdAt: -1 })
      .select('-filePath');
    
    return res.json({
      success: true,
      count: documents.length,
      documents: documents.map(doc => ({
        id: doc._id,
        fileName: doc.originalName,
        documentType: doc.documentType,
        fileSize: doc.fileSize,
        status: doc.status,
        visibility: doc.visibility,
        description: doc.description,
        uploadedAt: doc.createdAt,
        blockchain: {
          fileHash: doc.blockchain.fileHash,
          isVerified: doc.blockchain.isVerified,
          blockHash: doc.blockchain.blockHash,
          verifiedAt: doc.blockchain.verifiedAt
        }
      }))
    });
  } catch (err) {
    console.error('Error fetching documents:', err);
    return res.status(500).json({ message: 'Failed to fetch documents' });
  }
});

/**
 * @route GET /api/documents/dispute/:disputeId
 * @desc Get all documents for a specific dispute
 * @access Authenticated (must be involved in dispute)
 */
router.get('/dispute/:disputeId', authMiddleware, async (req, res) => {
  try {
    const documents = await Document.find({ 
      disputeId: req.params.disputeId,
      $or: [
        { uploadedBy: req.userId },
        { visibility: { $in: ['dispute_parties', 'lawyers', 'public'] } }
      ]
    }).sort({ createdAt: -1 });
    
    return res.json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (err) {
    console.error('Error fetching dispute documents:', err);
    return res.status(500).json({ message: 'Failed to fetch documents' });
  }
});

/**
 * @route POST /api/documents/verify/:documentId
 * @desc Verify a document's blockchain integrity
 * @access Authenticated
 */
router.post('/verify/:documentId', authMiddleware, async (req, res) => {
  try {
    const document = await Document.findById(req.params.documentId);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Re-read file and verify hash
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ 
        message: 'Document file not found on server',
        integrityStatus: 'FILE_MISSING'
      });
    }
    
    const fileBuffer = fs.readFileSync(document.filePath);
    const currentHash = generateDocumentHash(fileBuffer);
    const hashMatch = currentHash === document.blockchain.fileHash;
    
    // Get blockchain record
    const blockchainRecord = getDocumentBlockchainRecord(document._id.toString());
    
    // Add to verification history
    document.verificationHistory.push({
      verifiedBy: req.userId,
      verifiedAt: new Date(),
      status: hashMatch ? 'verified' : 'hash_mismatch',
      hashMatch: hashMatch
    });
    await document.save();
    
    return res.json({
      success: true,
      verification: {
        documentId: document._id,
        fileName: document.originalName,
        originalHash: document.blockchain.fileHash,
        currentHash: currentHash,
        hashMatch: hashMatch,
        integrityStatus: hashMatch ? 'INTACT' : 'TAMPERED',
        blockchainRecord: blockchainRecord.found ? {
          blockIndex: blockchainRecord.blockIndex,
          blockHash: blockchainRecord.blockHash,
          transactionId: blockchainRecord.transaction?.id,
          chainIntegrity: blockchainRecord.isValid ? 'VALID' : 'INVALID'
        } : null,
        verifiedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Document verification error:', err);
    return res.status(500).json({ message: 'Verification failed' });
  }
});

/**
 * @route POST /api/documents/verify-hash
 * @desc Verify a document by uploading and comparing hash
 * @access Public
 */
router.post('/verify-hash', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Generate hash of uploaded file
    const fileBuffer = fs.readFileSync(req.file.path);
    const fileHash = generateDocumentHash(fileBuffer);
    
    // Remove the temporary file
    fs.unlinkSync(req.file.path);
    
    // Check blockchain for this hash
    const blockchainVerification = verifyDocumentIntegrity(fileHash);
    
    // Check database for this hash
    const document = await Document.findOne({ 'blockchain.fileHash': fileHash });
    
    if (blockchainVerification.verified && document) {
      return res.json({
        success: true,
        verified: true,
        message: 'Document verified! This document is authentic and registered on our blockchain.',
        document: {
          id: document._id,
          fileName: document.originalName,
          documentType: document.documentType,
          uploadedAt: document.createdAt,
          status: document.status
        },
        blockchain: {
          fileHash: fileHash,
          blockIndex: blockchainVerification.blockIndex,
          blockHash: blockchainVerification.blockHash,
          registeredAt: new Date(blockchainVerification.timestamp).toISOString()
        }
      });
    } else {
      return res.json({
        success: true,
        verified: false,
        message: 'Document not found in our blockchain. This document may not be registered or has been modified.',
        fileHash: fileHash
      });
    }
  } catch (err) {
    console.error('Hash verification error:', err);
    return res.status(500).json({ message: 'Verification failed' });
  }
});

/**
 * @route GET /api/documents/certificate/:documentId
 * @desc Generate blockchain verification certificate
 * @access Authenticated
 */
router.get('/certificate/:documentId', authMiddleware, async (req, res) => {
  try {
    const document = await Document.findById(req.params.documentId);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check if user has access
    if (document.uploadedBy.toString() !== req.userId && 
        document.visibility === 'private') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const certificate = generateVerificationCertificate(document._id.toString());
    
    if (!certificate) {
      return res.status(404).json({ message: 'Blockchain record not found for this document' });
    }
    
    return res.json({
      success: true,
      certificate: {
        ...certificate,
        document: {
          id: document._id,
          fileName: document.originalName,
          documentType: document.documentType,
          uploadedAt: document.createdAt
        }
      }
    });
  } catch (err) {
    console.error('Certificate generation error:', err);
    return res.status(500).json({ message: 'Failed to generate certificate' });
  }
});

/**
 * @route GET /api/documents/blockchain/stats
 * @desc Get blockchain statistics
 * @access Public
 */
router.get('/blockchain/stats', async (req, res) => {
  try {
    const stats = getBlockchainStats();
    const documentCount = await Document.countDocuments({ 'blockchain.isVerified': true });
    
    return res.json({
      success: true,
      blockchain: stats,
      documentsSecured: documentCount
    });
  } catch (err) {
    console.error('Blockchain stats error:', err);
    return res.status(500).json({ message: 'Failed to fetch blockchain stats' });
  }
});

/**
 * @route GET /api/documents/blockchain/chain
 * @desc Get full blockchain (admin only)
 * @access Admin/Lawyer
 */
router.get('/blockchain/chain', lawyerAuthMiddleware, async (req, res) => {
  try {
    const chain = getFullBlockchain();
    return res.json({
      success: true,
      ...chain
    });
  } catch (err) {
    console.error('Blockchain fetch error:', err);
    return res.status(500).json({ message: 'Failed to fetch blockchain' });
  }
});

/**
 * @route DELETE /api/documents/:documentId
 * @desc Delete a document (soft delete - blockchain record remains)
 * @access Owner only
 */
router.delete('/:documentId', authMiddleware, async (req, res) => {
  try {
    const document = await Document.findById(req.params.documentId);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    if (document.uploadedBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this document' });
    }
    
    // Soft delete - mark as archived but keep blockchain record
    document.status = 'archived';
    await document.save();
    
    // Optionally delete the actual file
    // if (fs.existsSync(document.filePath)) {
    //   fs.unlinkSync(document.filePath);
    // }
    
    return res.json({
      success: true,
      message: 'Document archived. Blockchain record preserved for audit trail.'
    });
  } catch (err) {
    console.error('Document deletion error:', err);
    return res.status(500).json({ message: 'Failed to delete document' });
  }
});

/**
 * @route GET /api/documents/download/:documentId
 * @desc Download a document
 * @access Authenticated (with access)
 */
router.get('/download/:documentId', authMiddleware, async (req, res) => {
  try {
    const document = await Document.findById(req.params.documentId);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check access
    const hasAccess = 
      document.uploadedBy.toString() === req.userId ||
      document.visibility === 'public' ||
      (document.visibility === 'lawyers' && req.user.role === 'lawyer');
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }
    
    res.download(document.filePath, document.originalName);
  } catch (err) {
    console.error('Document download error:', err);
    return res.status(500).json({ message: 'Failed to download document' });
  }
});

/**
 * @route POST /api/documents/upload-for-dispute
 * @desc Upload document for a dispute with OCR extraction
 * @access Authenticated
 */
router.post('/upload-for-dispute', authMiddleware, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { documentType, disputeId, disputeType, visibility } = req.body;
    
    // Validate visibility value
    const validVisibilities = ['private', 'dispute_parties', 'lawyers', 'lawyer', 'public'];
    const documentVisibility = validVisibilities.includes(visibility) ? visibility : 'lawyers';
    
    // Read file and generate hash
    const fileBuffer = fs.readFileSync(req.file.path);
    const fileHash = generateDocumentHash(fileBuffer);
    
    // Generate metadata hash
    const metadataHash = generateMetadataHash({
      fileName: req.file.originalname,
      uploadedBy: req.userId,
      timestamp: Date.now(),
      fileSize: req.file.size
    });
    
    // Create document record
    const document = new Document({
      fileName: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      filePath: req.file.path,
      documentType: documentType || 'other',
      uploadedBy: req.userId,
      disputeId: disputeId || null,
      visibility: documentVisibility,
      blockchain: {
        fileHash: fileHash,
        metadataHash: metadataHash,
        registeredAt: new Date()
      }
    });
    
    await document.save();
    
    // Create blockchain transaction
    const transaction = createDocumentTransaction({
      documentId: document._id.toString(),
      fileName: req.file.originalname,
      fileHash: fileHash,
      uploadedBy: req.userId,
      disputeId: disputeId,
      documentType: documentType || 'other'
    });
    
    // Mine the transaction
    const miningResult = minePendingTransactions();
    
    if (miningResult) {
      document.blockchain.transactionId = transaction.id;
      document.blockchain.blockIndex = miningResult.block.index;
      document.blockchain.blockHash = miningResult.block.hash;
      document.blockchain.isVerified = true;
      document.blockchain.verifiedAt = new Date();
      document.status = 'verified';
      await document.save();
    }
    
    // Perform OCR extraction
    let ocrResult = null;
    let documentAnalysis = null;
    let disputeValidation = null;
    
    try {
      console.log('Starting OCR extraction...');
      ocrResult = await extractDocumentText(req.file.path, req.file.mimetype);
      
      if (ocrResult.success && ocrResult.text) {
        documentAnalysis = analyzeDocumentContent(ocrResult.text);
        
        if (disputeType) {
          disputeValidation = validateDocumentForDispute(documentAnalysis, disputeType);
        }
        
        // Update document with OCR data
        document.ocrExtraction = {
          extractedText: ocrResult.text.substring(0, 5000), // Store first 5000 chars
          confidence: ocrResult.confidence,
          extractedAt: new Date(),
          keywordsFound: documentAnalysis.keywordsFound,
          detectedDocType: documentAnalysis.suggestedType
        };
        document.status = 'pending'; // Ready for lawyer review
        await document.save();
      }
    } catch (ocrError) {
      console.error('OCR extraction failed:', ocrError);
    }
    
    // If disputeId is provided, update the dispute with document info
    if (disputeId) {
      try {
        const dispute = await Dispute.findById(disputeId);
        if (dispute) {
          dispute.documents.push({
            documentId: document._id,
            fileName: document.originalName,
            documentType: documentType || 'other',
            fileHash: fileHash,
            uploadedAt: new Date(),
            ocrExtraction: ocrResult?.success ? {
              extractedText: ocrResult.text?.substring(0, 2000),
              confidence: ocrResult.confidence,
              extractedAt: new Date(),
              keywordsFound: documentAnalysis?.keywordsFound || [],
              detectedDocType: documentAnalysis?.suggestedType
            } : null,
            verification: {
              status: ocrResult?.success ? 'ocr-processed' : 'pending',
              ocrVerified: ocrResult?.success && ocrResult.confidence > 70
            }
          });
          
          // Update document verification stats
          dispute.documentVerification.totalDocuments = dispute.documents.length;
          dispute.documentVerification.ocrProcessed = dispute.documents.filter(
            d => d.verification?.status === 'ocr-processed' || d.verification?.ocrVerified
          ).length;
          
          await dispute.save();
        }
      } catch (disputeError) {
        console.error('Failed to update dispute:', disputeError);
      }
    }
    
    return res.status(201).json({
      success: true,
      message: 'Document uploaded and processed',
      document: {
        id: document._id,
        fileName: document.originalName,
        documentType: document.documentType,
        fileSize: document.fileSize
      },
      blockchain: {
        fileHash: fileHash,
        blockHash: miningResult?.block.hash,
        secured: true
      },
      ocr: ocrResult?.success ? {
        extracted: true,
        confidence: ocrResult.confidence,
        textLength: ocrResult.text?.length || 0,
        analysis: documentAnalysis,
        disputeValidation: disputeValidation
      } : {
        extracted: false,
        error: ocrResult?.error || 'OCR processing failed'
      },
      verificationStatus: 'pending-lawyer-review'
    });
    
  } catch (err) {
    console.error('Document upload error:', err);
    return res.status(500).json({ message: 'Failed to upload document', error: err.message });
  }
});

/**
 * @route GET /api/documents/shared-with-lawyer
 * @desc Get all documents shared with lawyers (visibility = 'lawyer' or 'public')
 * @access Lawyer/Admin
 */
router.get('/shared-with-lawyer', lawyerAuthMiddleware, async (req, res) => {
  try {
    const documents = await Document.find({
      visibility: { $in: ['lawyers', 'lawyer', 'public'] }
    })
    .populate('uploadedBy', 'name email')
    .populate('disputeId', 'title disputeType status')
    .sort({ createdAt: -1 });
    
    return res.json({
      success: true,
      count: documents.length,
      documents: documents.map(doc => ({
        id: doc._id,
        fileName: doc.originalName,
        documentType: doc.documentType,
        fileSize: doc.fileSize,
        description: doc.description,
        visibility: doc.visibility,
        uploadedBy: doc.uploadedBy,
        dispute: doc.disputeId,
        blockchain: {
          fileHash: doc.blockchain?.fileHash,
          isVerified: doc.blockchain?.isVerified,
          blockHash: doc.blockchain?.blockHash
        },
        ocrExtraction: doc.ocrExtraction,
        status: doc.status,
        uploadedAt: doc.createdAt
      }))
    });
  } catch (err) {
    console.error('Error fetching shared documents:', err);
    return res.status(500).json({ message: 'Failed to fetch shared documents' });
  }
});

/**
 * @route GET /api/documents/pending-verification
 * @desc Get all documents pending lawyer verification
 * @access Lawyer/Admin
 */
router.get('/pending-verification', lawyerAuthMiddleware, async (req, res) => {
  try {
    const documents = await Document.find({
      $or: [
        { status: { $in: ['pending', 'verified'] }, disputeId: { $ne: null } },
        { visibility: { $in: ['lawyers', 'lawyer', 'public'] } }
      ]
    })
    .populate('uploadedBy', 'name email')
    .populate('disputeId', 'title disputeType status')
    .sort({ createdAt: -1 });
    
    return res.json({
      success: true,
      count: documents.length,
      documents: documents.map(doc => ({
        id: doc._id,
        fileName: doc.originalName,
        documentType: doc.documentType,
        fileSize: doc.fileSize,
        uploadedBy: doc.uploadedBy,
        dispute: doc.disputeId,
        blockchain: {
          fileHash: doc.blockchain?.fileHash,
          isVerified: doc.blockchain?.isVerified
        },
        ocrExtraction: doc.ocrExtraction,
        status: doc.status,
        uploadedAt: doc.createdAt
      }))
    });
  } catch (err) {
    console.error('Error fetching pending documents:', err);
    return res.status(500).json({ message: 'Failed to fetch documents' });
  }
});

/**
 * @route GET /api/documents/dispute/:disputeId/documents
 * @desc Get all documents for a specific dispute
 * @access Lawyer/Admin
 */
router.get('/dispute/:disputeId/documents', lawyerAuthMiddleware, async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.disputeId)
      .populate('documents.documentId')
      .populate('user', 'name email');
    
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }
    
    // Get full document details
    const documentIds = dispute.documents.map(d => d.documentId);
    const fullDocuments = await Document.find({ _id: { $in: documentIds } });
    
    return res.json({
      success: true,
      dispute: {
        id: dispute._id,
        title: dispute.title,
        disputeType: dispute.disputeType,
        status: dispute.status,
        user: dispute.user,
        documentVerification: dispute.documentVerification
      },
      documents: dispute.documents.map(doc => {
        const fullDoc = fullDocuments.find(d => d._id.toString() === doc.documentId?.toString());
        return {
          ...doc.toObject(),
          filePath: fullDoc?.filePath,
          blockchain: fullDoc?.blockchain
        };
      })
    });
  } catch (err) {
    console.error('Error fetching dispute documents:', err);
    return res.status(500).json({ message: 'Failed to fetch documents' });
  }
});

/**
 * @route POST /api/documents/verify-by-lawyer/:documentId
 * @desc Lawyer verifies a document
 * @access Lawyer/Admin
 */
router.post('/verify-by-lawyer/:documentId', lawyerAuthMiddleware, async (req, res) => {
  try {
    const { disputeId, verified, remarks, rejectionReason } = req.body;
    
    const document = await Document.findById(req.params.documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Update document verification status
    document.verificationHistory.push({
      verifiedBy: req.userId,
      verifiedAt: new Date(),
      status: verified ? 'verified' : 'rejected',
      remarks: remarks || '',
      hashMatch: true
    });
    
    document.status = verified ? 'verified' : 'rejected';
    await document.save();
    
    // If disputeId is provided, update the dispute's document verification
    if (disputeId) {
      const dispute = await Dispute.findById(disputeId);
      if (dispute) {
        const docIndex = dispute.documents.findIndex(
          d => d.documentId?.toString() === req.params.documentId
        );
        
        if (docIndex !== -1) {
          dispute.documents[docIndex].verification = {
            status: verified ? 'verified' : 'rejected',
            ocrVerified: dispute.documents[docIndex].verification?.ocrVerified || false,
            lawyerVerified: verified,
            verifiedBy: req.userId,
            verifiedAt: new Date(),
            rejectionReason: rejectionReason || '',
            lawyerRemarks: remarks || ''
          };
          
          // Update verification stats
          dispute.documentVerification.lawyerVerified = dispute.documents.filter(
            d => d.verification?.lawyerVerified
          ).length;
          dispute.documentVerification.rejected = dispute.documents.filter(
            d => d.verification?.status === 'rejected'
          ).length;
          
          // Update overall status
          const allVerified = dispute.documents.every(d => d.verification?.lawyerVerified);
          const anyRejected = dispute.documents.some(d => d.verification?.status === 'rejected');
          
          if (anyRejected) {
            dispute.documentVerification.overallStatus = 'issues-found';
          } else if (allVerified) {
            dispute.documentVerification.overallStatus = 'complete';
            dispute.status = 'under-review';
          } else {
            dispute.documentVerification.overallStatus = 'partial';
          }
          
          await dispute.save();
        }
      }
    }
    
    return res.json({
      success: true,
      message: verified ? 'Document verified successfully' : 'Document rejected',
      document: {
        id: document._id,
        status: document.status,
        verifiedAt: new Date()
      }
    });
  } catch (err) {
    console.error('Lawyer verification error:', err);
    return res.status(500).json({ message: 'Verification failed' });
  }
});

/**
 * @route POST /api/documents/ocr-extract/:documentId
 * @desc Re-run OCR extraction on a document
 * @access Lawyer/Admin
 */
router.post('/ocr-extract/:documentId', lawyerAuthMiddleware, async (req, res) => {
  try {
    const document = await Document.findById(req.params.documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ message: 'Document file not found on server' });
    }
    
    // Perform OCR extraction
    const ocrResult = await extractDocumentText(document.filePath, document.mimeType);
    
    if (!ocrResult.success) {
      return res.status(400).json({
        success: false,
        message: 'OCR extraction failed',
        error: ocrResult.error
      });
    }
    
    // Analyze the extracted text
    const analysis = analyzeDocumentContent(ocrResult.text);
    
    // Update document with OCR data
    document.ocrExtraction = {
      extractedText: ocrResult.text.substring(0, 5000),
      confidence: ocrResult.confidence,
      extractedAt: new Date(),
      keywordsFound: analysis.keywordsFound,
      detectedDocType: analysis.suggestedType
    };
    await document.save();
    
    return res.json({
      success: true,
      ocr: {
        text: ocrResult.text,
        confidence: ocrResult.confidence,
        words: ocrResult.words
      },
      analysis: analysis
    });
  } catch (err) {
    console.error('OCR extraction error:', err);
    return res.status(500).json({ message: 'OCR extraction failed' });
  }
});

/**
 * @route GET /api/documents/verification-summary
 * @desc Get summary of all documents pending and verified
 * @access Lawyer/Admin
 */
router.get('/verification-summary', lawyerAuthMiddleware, async (req, res) => {
  try {
    const pending = await Document.countDocuments({ status: 'pending', disputeId: { $ne: null } });
    const verified = await Document.countDocuments({ status: 'verified', disputeId: { $ne: null } });
    const rejected = await Document.countDocuments({ status: 'rejected', disputeId: { $ne: null } });
    
    const recentDocuments = await Document.find({ disputeId: { $ne: null } })
      .populate('uploadedBy', 'name')
      .populate('disputeId', 'title')
      .sort({ createdAt: -1 })
      .limit(10);
    
    return res.json({
      success: true,
      summary: {
        pending,
        verified,
        rejected,
        total: pending + verified + rejected
      },
      recentDocuments: recentDocuments.map(doc => ({
        id: doc._id,
        fileName: doc.originalName,
        documentType: doc.documentType,
        status: doc.status,
        uploadedBy: doc.uploadedBy?.name,
        dispute: doc.disputeId?.title,
        uploadedAt: doc.createdAt
      }))
    });
  } catch (err) {
    console.error('Summary error:', err);
    return res.status(500).json({ message: 'Failed to get summary' });
  }
});

export default router;
