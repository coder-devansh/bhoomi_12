import express from 'express';
import { authMiddleware } from '../controllers/disputeController.js';
import { lawyerAuthMiddleware } from '../controllers/lawyerController.js';
import Dispute from '../models/Dispute.js';
// Import Gemini-powered AI services
import {
  analyzeDisputeWithGemini,
  generateChatResponseWithGemini,
  generateDocumentWithGemini,
  smartSearchWithGemini,
  detectFraudWithGemini,
  generateInsightsWithGemini
} from '../services/geminiService.js';
// Keep legacy services as fallback
import {
  calculateDisputePriority
} from '../services/aiService.js';

const router = express.Router();

/**
 * @route POST /api/ai/analyze/:disputeId
 * @desc AI analysis of a specific dispute (Gemini-powered)
 * @access Lawyer/Admin
 */
router.post('/analyze/:disputeId', lawyerAuthMiddleware, async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.disputeId);
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }
    
    const analysis = await analyzeDisputeWithGemini(dispute);
    return res.json({
      success: true,
      disputeId: dispute._id,
      analysis
    });
  } catch (err) {
    console.error('AI Analysis error:', err);
    return res.status(500).json({ message: 'AI analysis failed' });
  }
});

/**
 * @route POST /api/ai/analyze-form
 * @desc AI analysis of dispute data before submission (Gemini-powered)
 * @access Authenticated users
 */
router.post('/analyze-form', authMiddleware, async (req, res) => {
  try {
    const analysis = await analyzeDisputeWithGemini(req.body);
    return res.json({
      success: true,
      analysis
    });
  } catch (err) {
    console.error('AI Form Analysis error:', err);
    return res.status(500).json({ message: 'AI analysis failed' });
  }
});

/**
 * @route POST /api/ai/generate-document
 * @desc Generate AI legal document draft (Gemini-powered)
 * @access Lawyer/Admin
 */
router.post('/generate-document', lawyerAuthMiddleware, async (req, res) => {
  try {
    const { disputeId, documentType } = req.body;
    
    let disputeData = req.body.disputeData;
    
    if (disputeId) {
      const dispute = await Dispute.findById(disputeId);
      if (!dispute) {
        return res.status(404).json({ message: 'Dispute not found' });
      }
      disputeData = dispute;
    }
    
    const document = await generateDocumentWithGemini(disputeData, documentType);
    return res.json({
      success: true,
      document
    });
  } catch (err) {
    console.error('Document generation error:', err);
    return res.status(500).json({ message: 'Document generation failed' });
  }
});

/**
 * @route POST /api/ai/chat
 * @desc AI Chatbot for legal queries (Gemini-powered)
 * @access Public (basic) / Authenticated (personalized)
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, context, conversationHistory } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required' });
    }
    
    const response = await generateChatResponseWithGemini(message, conversationHistory || []);
    return res.json({
      success: true,
      ...response,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({ message: 'Chat service unavailable' });
  }
});

/**
 * @route GET /api/ai/priority-queue
 * @desc Get disputes sorted by AI priority score
 * @access Lawyer/Admin
 */
router.get('/priority-queue', lawyerAuthMiddleware, async (req, res) => {
  try {
    const disputes = await Dispute.find({ status: { $ne: 'resolved' } })
      .populate('user', 'name email');
    
    const prioritizedDisputes = disputes.map(dispute => ({
      ...dispute.toObject(),
      priority: calculateDisputePriority(dispute)
    })).sort((a, b) => b.priority.score - a.priority.score);
    
    return res.json({
      success: true,
      total: prioritizedDisputes.length,
      disputes: prioritizedDisputes
    });
  } catch (err) {
    console.error('Priority queue error:', err);
    return res.status(500).json({ message: 'Failed to get priority queue' });
  }
});

/**
 * @route POST /api/ai/smart-search
 * @desc AI-powered search across disputes (Gemini-powered)
 * @access Lawyer/Admin
 */
router.post('/smart-search', lawyerAuthMiddleware, async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const disputes = await Dispute.find().populate('user', 'name email');
    const results = await smartSearchWithGemini(query, disputes);
    
    return res.json({
      success: true,
      query,
      totalResults: results.length,
      results
    });
  } catch (err) {
    console.error('Smart search error:', err);
    return res.status(500).json({ message: 'Search failed' });
  }
});

/**
 * @route POST /api/ai/fraud-check
 * @desc Check for potential fraud in dispute submission (Gemini-powered)
 * @access Internal/Lawyer
 */
router.post('/fraud-check', lawyerAuthMiddleware, async (req, res) => {
  try {
    const { disputeData } = req.body;
    const existingDisputes = await Dispute.find();
    
    const fraudAnalysis = await detectFraudWithGemini(disputeData, existingDisputes);
    
    return res.json({
      success: true,
      analysis: fraudAnalysis
    });
  } catch (err) {
    console.error('Fraud check error:', err);
    return res.status(500).json({ message: 'Fraud check failed' });
  }
});

/**
 * @route GET /api/ai/insights
 * @desc Get AI-generated insights and statistics (Gemini-powered)
 * @access Lawyer/Admin
 */
router.get('/insights', lawyerAuthMiddleware, async (req, res) => {
  try {
    const disputes = await Dispute.find();
    
    // Generate insights using Gemini
    const insights = await generateInsightsWithGemini(disputes);
    
    return res.json({
      success: true,
      insights
    });
  } catch (err) {
    console.error('Insights error:', err);
    return res.status(500).json({ message: 'Failed to generate insights' });
  }
});

/**
 * @route GET /api/ai/document-types
 * @desc Get available AI document types
 * @access Authenticated
 */
router.get('/document-types', authMiddleware, async (req, res) => {
  return res.json({
    success: true,
    documentTypes: [
      { id: 'partition_deed', name: 'Partition Deed', description: 'Draft deed for property partition' },
      { id: 'legal_notice', name: 'Legal Notice', description: 'Notice to opposing party' },
      { id: 'affidavit', name: 'Affidavit', description: 'Sworn statement document' },
      { id: 'settlement_agreement', name: 'Settlement Agreement', description: 'Mutual settlement document' },
      { id: 'boundary_agreement', name: 'Boundary Agreement', description: 'Agreement for boundary disputes' }
    ]
  });
});

// Helper functions for insights (fallback)
function calculateAverageResolutionTime(disputes) {
  const resolved = disputes.filter(d => d.status === 'resolved');
  if (resolved.length === 0) return 'No resolved cases yet';
  
  // In production, you'd track resolution dates
  return '~3-4 weeks (estimated)';
}

function generateTrendAnalysis(disputes) {
  const last30Days = disputes.filter(d => {
    const created = new Date(d.createdAt);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return created > thirtyDaysAgo;
  });
  
  return {
    newDisputesLast30Days: last30Days.length,
    trend: last30Days.length > 5 ? 'increasing' : 'stable',
    prediction: 'Based on current trends, expect similar volume next month'
  };
}

function generateSystemRecommendations(disputes) {
  const recommendations = [];
  
  const openDisputes = disputes.filter(d => d.status === 'open');
  if (openDisputes.length > 10) {
    recommendations.push({
      type: 'workload',
      message: 'High number of open disputes. Consider prioritizing review.',
      priority: 'high'
    });
  }
  
  const oldDisputes = disputes.filter(d => {
    const created = new Date(d.createdAt);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return created < thirtyDaysAgo && d.status === 'open';
  });
  
  if (oldDisputes.length > 0) {
    recommendations.push({
      type: 'attention',
      message: `${oldDisputes.length} dispute(s) pending for over 30 days`,
      priority: 'medium'
    });
  }
  
  return recommendations;
}

export default router;
