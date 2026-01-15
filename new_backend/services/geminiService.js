/**
 * BhoomiSetu Gemini AI Service
 * Powered by Google Gemini API for intelligent land dispute resolution
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_ID = 'gemini-2.5-flash';

// Log API key status (for debugging - remove in production)
console.log('Gemini API Key loaded:', process.env.GEMINI_API_KEY ? 'Yes (length: ' + process.env.GEMINI_API_KEY.length + ')' : 'No');

// System context for BhoomiSetu
const SYSTEM_CONTEXT = `You are BhoomiSetu AI Assistant, an expert in Indian land law and property disputes.
You specialize in:
- Land partition (mutual, family, court-ordered)
- Boundary demarcation and survey procedures
- Property documentation requirements
- Legal processes for land disputes in India
- Revenue department procedures

Important guidelines:
1. Always be helpful and provide accurate information about Indian land laws
2. Recommend consulting legal professionals for specific legal advice
3. Be culturally sensitive and use simple language
4. Provide practical, actionable advice
5. Reference relevant Indian laws when appropriate (Transfer of Property Act, Registration Act, etc.)
6. Support queries in English and transliterated Hindi/regional languages

Context: BhoomiSetu is a digital platform for resolving land disputes in India, connecting citizens with legal professionals and government services.`;

/**
 * Get Gemini model instance
 */
const getModel = () => {
  return genAI.getGenerativeModel({ 
    model: MODEL_ID,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.8,
      maxOutputTokens: 2048,
    }
  });
};

/**
 * AI-Powered Dispute Analysis using Gemini
 */
export const analyzeDisputeWithGemini = async (disputeData) => {
  try {
    const model = getModel();
    
    const prompt = `${SYSTEM_CONTEXT}

Analyze the following land dispute case and provide a comprehensive analysis in JSON format:

Case Details:
- Type: ${disputeData.title || 'Not specified'}
- Description: ${disputeData.description || 'Not provided'}
- Land Number: ${disputeData.landNumber || 'Not provided'}
- Khata Number: ${disputeData.khataNumber || 'Not provided'}
- Land Area: ${disputeData.landArea || 'Not provided'}
- Location: ${disputeData.address || 'Not provided'}
- Applicant: ${disputeData.name || 'Not provided'}

Provide analysis in the following JSON structure:
{
  "riskLevel": { "level": "low/medium/high", "factors": ["list of risk factors"] },
  "estimatedResolutionTime": "estimated time",
  "legalCategory": "category of legal issue",
  "recommendedActions": ["list of recommended steps"],
  "similarCasePrecedents": [{"case": "case name", "outcome": "outcome"}],
  "successProbability": "percentage with explanation",
  "keyIssues": ["key issues identified"],
  "requiredDocuments": ["list of required documents"],
  "legalReferences": ["relevant laws and sections"],
  "nextSteps": "immediate next steps for the applicant"
}

Only respond with valid JSON, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return {
        ...analysis,
        analyzedAt: new Date().toISOString(),
        poweredBy: 'Gemini AI'
      };
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Gemini Analysis Error:', error);
    // Fallback to basic analysis
    return getFallbackAnalysis(disputeData);
  }
};

/**
 * AI Chatbot using Gemini
 */
export const generateChatResponseWithGemini = async (userMessage, conversationHistory = []) => {
  try {
    const model = getModel();
    
    // Build conversation context
    let conversationContext = '';
    if (conversationHistory.length > 0) {
      conversationContext = '\n\nPrevious conversation:\n' + 
        conversationHistory.slice(-5).map(msg => 
          `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
        ).join('\n');
    }

    const prompt = `${SYSTEM_CONTEXT}
${conversationContext}

User's current query: ${userMessage}

Provide a helpful, informative response about land disputes in India. 
- Use markdown formatting for better readability
- Include relevant emojis for visual appeal
- Provide practical, actionable information
- If the query is unclear, ask clarifying questions
- Suggest follow-up questions the user might have

Keep the response concise but comprehensive (max 300 words).`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Generate follow-up suggestions
    const suggestionsPrompt = `Based on the user's query "${userMessage}" about land disputes, suggest 3 brief follow-up questions they might want to ask. Return only a JSON array of strings.`;
    
    let suggestions = [];
    try {
      const sugResult = await model.generateContent(suggestionsPrompt);
      const sugText = sugResult.response.text();
      const sugMatch = sugText.match(/\[[\s\S]*\]/);
      if (sugMatch) {
        suggestions = JSON.parse(sugMatch[0]);
      }
    } catch (e) {
      suggestions = ['What documents do I need?', 'How long does this take?', 'What are the costs involved?'];
    }

    return {
      response: text,
      suggestions: suggestions.slice(0, 3),
      confidence: 0.9,
      poweredBy: 'Gemini AI'
    };
  } catch (error) {
    console.error('Gemini Chat Error:', error);
    return getFallbackChatResponse(userMessage);
  }
};

/**
 * AI Document Generator using Gemini
 */
export const generateDocumentWithGemini = async (disputeData, documentType) => {
  try {
    const model = getModel();
    
    const documentTypes = {
      'partition_deed': 'Partition Deed for dividing land among co-owners',
      'legal_notice': 'Legal Notice to be sent to the opposing party',
      'affidavit': 'Affidavit sworn statement for legal proceedings',
      'settlement_agreement': 'Settlement Agreement between disputing parties',
      'boundary_agreement': 'Boundary Agreement for demarcation disputes'
    };

    const prompt = `${SYSTEM_CONTEXT}

Generate a professional draft ${documentTypes[documentType] || 'legal document'} based on the following details:

Applicant Details:
- Name: ${disputeData.name || '[Applicant Name]'}
- Aadhaar: ${disputeData.aadhaarNumber || '[Aadhaar Number]'}
- Mobile: ${disputeData.mobileNumber || '[Mobile Number]'}
- Address: ${disputeData.address || '[Address]'}

Property Details:
- Land/Survey Number: ${disputeData.landNumber || '[Land Number]'}
- Khata Number: ${disputeData.khataNumber || '[Khata Number]'}
- Area: ${disputeData.landArea || '[Area]'}

Case Type: ${disputeData.title || 'Land Dispute'}
Description: ${disputeData.description || 'Property dispute matter'}

Generate a professional, legally-formatted document that:
1. Follows Indian legal document standards
2. Includes all necessary clauses
3. Has proper formatting with headings
4. Includes placeholders for missing information in [brackets]
5. Is ready for legal review and customization

Add appropriate legal language and clauses typically used in Indian property law documents.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    return {
      documentType,
      content,
      generatedAt: new Date().toISOString(),
      disclaimer: 'This is an AI-generated draft powered by Gemini. Please have it reviewed and customized by a qualified legal professional before use.',
      poweredBy: 'Gemini AI'
    };
  } catch (error) {
    console.error('Gemini Document Generation Error:', error);
    return getFallbackDocument(disputeData, documentType);
  }
};

/**
 * AI Smart Search using Gemini
 */
export const smartSearchWithGemini = async (query, disputes) => {
  try {
    const model = getModel();
    
    // Create searchable summary of disputes
    const disputeSummaries = disputes.slice(0, 50).map((d, i) => ({
      index: i,
      id: d._id?.toString(),
      title: d.title,
      name: d.name,
      landNumber: d.landNumber,
      khataNumber: d.khataNumber,
      address: d.address,
      status: d.status,
      description: d.description?.substring(0, 100)
    }));

    const prompt = `Given the search query: "${query}"

And the following list of land dispute cases:
${JSON.stringify(disputeSummaries, null, 2)}

Return a JSON array of the indices of cases that best match the search query, ordered by relevance.
Consider matching: names, land numbers, khata numbers, addresses, descriptions, and status.
Return format: { "matches": [0, 2, 5], "reasoning": "brief explanation" }

Only return valid JSON.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const searchResult = JSON.parse(jsonMatch[0]);
      const matchedDisputes = searchResult.matches.map((idx, rank) => ({
        ...disputes[idx]?.toObject ? disputes[idx].toObject() : disputes[idx],
        relevanceScore: 100 - (rank * 10),
        matchReasoning: searchResult.reasoning
      })).filter(d => d._id);
      
      return matchedDisputes;
    }
    
    return [];
  } catch (error) {
    console.error('Gemini Search Error:', error);
    return basicSearch(query, disputes);
  }
};

/**
 * AI Fraud Detection using Gemini
 */
export const detectFraudWithGemini = async (disputeData, existingDisputes = []) => {
  try {
    const model = getModel();

    const prompt = `${SYSTEM_CONTEXT}

Analyze the following land dispute submission for potential fraud or suspicious patterns:

New Submission:
- Name: ${disputeData.name}
- Land Number: ${disputeData.landNumber}
- Khata Number: ${disputeData.khataNumber}
- Aadhaar: ${disputeData.aadhaarNumber}
- Mobile: ${disputeData.mobileNumber}
- Description: ${disputeData.description}
- Address: ${disputeData.address}

Existing disputes in system with same/similar land or khata numbers: ${existingDisputes.length}

Check for:
1. Invalid Aadhaar format (should be 12 digits)
2. Invalid mobile number format (should be 10 digits starting with 6-9)
3. Suspicious language patterns in description
4. Duplicate submissions
5. Inconsistent information

Return JSON format:
{
  "riskScore": 0-100,
  "riskLevel": "low/medium/high",
  "flags": [{"type": "flag_type", "severity": "low/medium/high", "message": "explanation"}],
  "recommendation": "recommended action"
}

Only return valid JSON.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Invalid response');
  } catch (error) {
    console.error('Gemini Fraud Detection Error:', error);
    return basicFraudCheck(disputeData, existingDisputes);
  }
};

/**
 * Generate AI Insights using Gemini
 */
export const generateInsightsWithGemini = async (disputes) => {
  try {
    const model = getModel();
    
    const stats = {
      total: disputes.length,
      byStatus: {
        open: disputes.filter(d => d.status === 'open').length,
        inProgress: disputes.filter(d => d.status === 'in progress').length,
        resolved: disputes.filter(d => d.status === 'resolved').length
      },
      byType: {
        mutual: disputes.filter(d => d.title?.includes('Mutual')).length,
        family: disputes.filter(d => d.title?.includes('Family')).length,
        boundary: disputes.filter(d => d.title?.includes('Boundary')).length
      }
    };

    const prompt = `${SYSTEM_CONTEXT}

Analyze the following dispute statistics and provide insights:

Statistics:
${JSON.stringify(stats, null, 2)}

Recent disputes (last 30 days): ${disputes.filter(d => {
      const created = new Date(d.createdAt);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return created > thirtyDaysAgo;
    }).length}

Provide analysis in JSON format:
{
  "summary": "brief overview of the current state",
  "trends": { "direction": "increasing/stable/decreasing", "analysis": "explanation" },
  "bottlenecks": ["identified bottlenecks"],
  "recommendations": [{"type": "category", "message": "recommendation", "priority": "high/medium/low"}],
  "prediction": "prediction for next 30 days",
  "actionItems": ["immediate action items for administrators"]
}

Only return valid JSON.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return {
        ...JSON.parse(jsonMatch[0]),
        ...stats,
        generatedAt: new Date().toISOString(),
        poweredBy: 'Gemini AI'
      };
    }
    
    throw new Error('Invalid response');
  } catch (error) {
    console.error('Gemini Insights Error:', error);
    return getBasicInsights(disputes);
  }
};

// ============== FALLBACK FUNCTIONS ==============

function getFallbackAnalysis(disputeData) {
  return {
    riskLevel: { level: 'medium', factors: ['Unable to perform AI analysis'] },
    estimatedResolutionTime: '4-6 weeks (estimated)',
    legalCategory: disputeData.title || 'Land Dispute',
    recommendedActions: [
      'Gather all property documents',
      'Consult with a legal professional',
      'Contact revenue department for verification'
    ],
    similarCasePrecedents: [],
    successProbability: '70% (estimated)',
    keyIssues: ['Standard dispute processing required'],
    requiredDocuments: ['Sale Deed', 'Khata Certificate', 'EC', 'Tax Receipts', 'Aadhaar'],
    analyzedAt: new Date().toISOString(),
    poweredBy: 'Fallback System'
  };
}

function getFallbackChatResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  
  let response = `Thank you for your query about "${userMessage}".

I'm currently operating in limited mode. Here are some general guidelines:

📋 **For Partition Requests:**
- Gather all property documents
- Get an updated EC (Encumbrance Certificate)
- Consult with a legal professional

📍 **For Boundary Issues:**
- Request a fresh survey from Revenue Department
- Document current boundaries with photos
- Maintain records of all communications

For specific legal advice, please consult with a qualified advocate.`;

  if (lowerMessage.includes('document')) {
    response = `**Required Documents:**
1. Original Sale Deed/Title Deed
2. Khata Certificate & Extract
3. Encumbrance Certificate (EC)
4. Property Tax Receipts
5. Aadhaar Card
6. Recent Photographs of Property

Please ensure all documents are up to date.`;
  }

  return {
    response,
    suggestions: ['What documents do I need?', 'How long does partition take?', 'What is the process?'],
    confidence: 0.5,
    poweredBy: 'Fallback System'
  };
}

function getFallbackDocument(disputeData, documentType) {
  return {
    documentType,
    content: `[DRAFT DOCUMENT - ${documentType.toUpperCase()}]

Date: ${new Date().toLocaleDateString('en-IN')}

PARTIES:
Name: ${disputeData.name || '[Name]'}
Address: ${disputeData.address || '[Address]'}

PROPERTY DETAILS:
Land Number: ${disputeData.landNumber || '[Land Number]'}
Khata Number: ${disputeData.khataNumber || '[Khata Number]'}
Area: ${disputeData.landArea || '[Area]'}

DESCRIPTION:
${disputeData.description || '[Description of matter]'}

[Additional clauses to be added by legal professional]

This is a basic draft. Please consult a legal professional for proper documentation.`,
    generatedAt: new Date().toISOString(),
    disclaimer: 'AI service unavailable. This is a basic template. Please consult a legal professional.',
    poweredBy: 'Fallback System'
  };
}

function basicSearch(query, disputes) {
  const lowerQuery = query.toLowerCase();
  const keywords = lowerQuery.split(/\s+/).filter(w => w.length > 2);
  
  return disputes
    .map(dispute => {
      let score = 0;
      const searchFields = ['title', 'name', 'landNumber', 'khataNumber', 'address', 'description'];
      const matchedFields = [];
      
      searchFields.forEach(field => {
        if (dispute[field]) {
          keywords.forEach(kw => {
            if (dispute[field].toLowerCase().includes(kw)) {
              score += 10;
              if (!matchedFields.includes(field)) matchedFields.push(field);
            }
          });
        }
      });
      
      return {
        ...dispute.toObject ? dispute.toObject() : dispute,
        relevanceScore: score,
        matchedFields
      };
    })
    .filter(d => d.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

function basicFraudCheck(disputeData, existingDisputes) {
  const flags = [];
  let riskScore = 0;
  
  // Check for duplicates
  const duplicates = existingDisputes.filter(d => 
    d.landNumber === disputeData.landNumber || 
    d.khataNumber === disputeData.khataNumber
  );
  if (duplicates.length > 0) {
    flags.push({ type: 'duplicate', severity: 'high', message: 'Duplicate land/khata number found' });
    riskScore += 40;
  }
  
  // Validate Aadhaar
  if (disputeData.aadhaarNumber && !/^\d{12}$/.test(disputeData.aadhaarNumber.replace(/\s/g, ''))) {
    flags.push({ type: 'invalid_aadhaar', severity: 'medium', message: 'Invalid Aadhaar format' });
    riskScore += 15;
  }
  
  // Validate mobile
  if (disputeData.mobileNumber && !/^[6-9]\d{9}$/.test(disputeData.mobileNumber.replace(/\s/g, ''))) {
    flags.push({ type: 'invalid_mobile', severity: 'low', message: 'Invalid mobile format' });
    riskScore += 5;
  }
  
  return {
    riskScore: Math.min(riskScore, 100),
    riskLevel: riskScore >= 50 ? 'high' : riskScore >= 25 ? 'medium' : 'low',
    flags,
    recommendation: riskScore >= 50 ? 'Manual verification required' : 'Standard processing'
  };
}

function getBasicInsights(disputes) {
  return {
    totalDisputes: disputes.length,
    byStatus: {
      open: disputes.filter(d => d.status === 'open').length,
      inProgress: disputes.filter(d => d.status === 'in progress').length,
      resolved: disputes.filter(d => d.status === 'resolved').length
    },
    byType: {
      mutualPartition: disputes.filter(d => d.title?.includes('Mutual')).length,
      familyPartition: disputes.filter(d => d.title?.includes('Family')).length,
      boundaryDemarcation: disputes.filter(d => d.title?.includes('Boundary')).length
    },
    trends: { direction: 'stable', analysis: 'Standard case volume' },
    recommendations: [],
    generatedAt: new Date().toISOString(),
    poweredBy: 'Fallback System'
  };
}

export default {
  analyzeDisputeWithGemini,
  generateChatResponseWithGemini,
  generateDocumentWithGemini,
  smartSearchWithGemini,
  detectFraudWithGemini,
  generateInsightsWithGemini
};
