/**
 * BhoomiSetu AI Service
 * Advanced AI features for land dispute resolution
 */

// Simulated AI responses (In production, integrate with OpenAI/Azure AI/Google AI)
// For demo purposes, using intelligent rule-based responses

/**
 * AI-Powered Dispute Analysis
 * Analyzes dispute details and provides insights
 */
export const analyzeDispute = async (disputeData) => {
  const { title, description, landArea, address } = disputeData;
  
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const analysis = {
    riskLevel: calculateRiskLevel(disputeData),
    estimatedResolutionTime: estimateResolutionTime(title),
    legalCategory: categorizeLegalIssue(title, description),
    recommendedActions: generateRecommendations(title, description),
    similarCasePrecedents: findSimilarCases(title),
    successProbability: calculateSuccessProbability(disputeData),
    keyIssues: extractKeyIssues(description),
    requiredDocuments: suggestRequiredDocuments(title),
    analyzedAt: new Date().toISOString()
  };
  
  return analysis;
};

/**
 * AI Legal Document Generator
 * Generates draft legal documents based on dispute type
 */
export const generateLegalDocument = async (disputeData, documentType) => {
  const { name, landNumber, khataNumber, landArea, address, description, title } = disputeData;
  
  const templates = {
    'partition_deed': generatePartitionDeed(disputeData),
    'legal_notice': generateLegalNotice(disputeData),
    'affidavit': generateAffidavit(disputeData),
    'settlement_agreement': generateSettlementAgreement(disputeData),
    'boundary_agreement': generateBoundaryAgreement(disputeData)
  };
  
  return {
    documentType,
    content: templates[documentType] || templates['legal_notice'],
    generatedAt: new Date().toISOString(),
    disclaimer: 'This is an AI-generated draft. Please consult a legal professional before use.'
  };
};

/**
 * AI Chatbot Response Generator
 * Provides intelligent responses to user queries about land disputes
 */
export const generateChatResponse = async (userMessage, context = {}) => {
  const lowerMessage = userMessage.toLowerCase();
  
  // Knowledge base for land dispute related queries
  const knowledgeBase = {
    partition: {
      keywords: ['partition', 'divide', 'split', 'share', 'distribution'],
      response: `**Land Partition Information:**

🏠 **Types of Partition:**
1. **Mutual Partition** - When all parties agree to divide the land amicably
2. **Family Partition** - Division among family members/heirs
3. **Court-ordered Partition** - When parties cannot agree

📋 **Required Documents:**
- Original land documents (Sale deed/Title deed)
- Khata certificate
- Property tax receipts
- Encumbrance certificate
- Family tree (for family partition)

⏱️ **Typical Timeline:** 3-6 months for mutual partition, 1-2 years for contested cases

💡 **Tip:** Mutual partition is faster and more cost-effective. Try to reach an agreement first.`
    },
    boundary: {
      keywords: ['boundary', 'demarcation', 'fence', 'encroachment', 'survey'],
      response: `**Boundary Demarcation Information:**

📍 **What is Boundary Demarcation?**
It's the process of officially marking the boundaries of your land to prevent disputes.

🔧 **Steps Involved:**
1. Apply for land survey from Revenue Department
2. Licensed surveyor visits the site
3. Measurements taken using Total Station/GPS
4. Boundary stones/markers placed
5. Official survey report issued

📋 **Required Documents:**
- Land ownership documents
- Previous survey records (if any)
- Mutation records
- Tax receipts

⚠️ **Common Issues:**
- Encroachment by neighbors
- Disputed measurements
- Missing boundary markers

💡 **Tip:** Always get a fresh survey done before buying land.`
    },
    documents: {
      keywords: ['document', 'paper', 'proof', 'certificate', 'required'],
      response: `**Essential Land Documents:**

📜 **Ownership Documents:**
1. Sale Deed / Title Deed
2. Khata Certificate & Extract
3. Encumbrance Certificate (EC)
4. Property Tax Receipts
5. Mutation Records

🆔 **Identity Documents:**
1. Aadhaar Card
2. PAN Card
3. Passport-size photographs

🏛️ **Government Certificates:**
1. Land Survey Records (Tippan)
2. RTC (Record of Rights, Tenancy & Crops)
3. Pahani / 7/12 Extract
4. Conversion Certificate (if applicable)

💡 **Pro Tip:** Always keep multiple certified copies of all documents.`
    },
    legal: {
      keywords: ['legal', 'law', 'court', 'case', 'lawyer', 'advocate'],
      response: `**Legal Process for Land Disputes:**

⚖️ **Resolution Options:**
1. **Mediation** - Neutral third-party helps reach agreement
2. **Arbitration** - Binding decision by arbitrator
3. **Civil Court** - File suit in appropriate court

🏛️ **Relevant Laws:**
- Transfer of Property Act, 1882
- Indian Registration Act, 1908
- Partition Act, 1893
- Land Revenue Acts (State-specific)

⏱️ **Typical Timeline:**
- Mediation: 1-3 months
- Civil Court: 2-5 years

💰 **Estimated Costs:**
- Court fees: Based on property value
- Lawyer fees: ₹10,000 - ₹1,00,000+
- Survey charges: ₹2,000 - ₹10,000

💡 **Advice:** Always try mediation first. It's faster, cheaper, and maintains relationships.`
    },
    status: {
      keywords: ['status', 'progress', 'update', 'stage', 'where'],
      response: `**Understanding Dispute Status:**

📊 **Status Types:**
- 🔵 **Open** - Newly submitted, awaiting review
- 🟡 **In Progress** - Under active review by legal team
- 🟢 **Resolved** - Successfully concluded

🔔 **What to Expect:**
1. Initial review within 24-48 hours
2. Document verification: 3-5 days
3. Legal opinion preparation: 5-7 days
4. Resolution/Next steps communication

💡 **Tip:** Check your dashboard regularly for updates and lawyer notes.`
    }
  };

  // Find matching knowledge
  let bestMatch = null;
  let maxScore = 0;
  
  for (const [key, data] of Object.entries(knowledgeBase)) {
    const score = data.keywords.filter(kw => lowerMessage.includes(kw)).length;
    if (score > maxScore) {
      maxScore = score;
      bestMatch = data;
    }
  }
  
  if (bestMatch && maxScore > 0) {
    return {
      response: bestMatch.response,
      confidence: Math.min(maxScore * 0.25, 1),
      suggestions: generateFollowUpSuggestions(lowerMessage)
    };
  }
  
  // Default response for unmatched queries
  return {
    response: `I understand you have a question about land disputes. Here's what I can help you with:

🤖 **I can assist with:**
- Land partition procedures (mutual/family)
- Boundary demarcation process
- Required documents checklist
- Legal process information
- Dispute status explanations

Please try asking about one of these topics, or rephrase your question.

💬 **Example questions:**
- "What documents do I need for partition?"
- "How does boundary demarcation work?"
- "What is the legal process for disputes?"`,
    confidence: 0.3,
    suggestions: [
      'Tell me about land partition',
      'What documents are required?',
      'How to resolve boundary disputes?',
      'What is the legal process?'
    ]
  };
};

/**
 * AI-Powered Dispute Priority Scoring
 * Helps lawyers prioritize cases
 */
export const calculateDisputePriority = (dispute) => {
  let score = 50; // Base score
  
  // Urgency factors
  const daysSinceCreation = Math.floor((Date.now() - new Date(dispute.createdAt)) / (1000 * 60 * 60 * 24));
  if (daysSinceCreation > 30) score += 20;
  else if (daysSinceCreation > 14) score += 10;
  
  // Complexity factors
  if (dispute.description && dispute.description.length > 500) score += 10;
  if (dispute.title?.includes('Boundary')) score += 5;
  if (dispute.title?.includes('Family')) score += 15;
  
  // Documentation completeness
  const fields = ['landNumber', 'khataNumber', 'landArea', 'aadhaarNumber', 'address'];
  const completedFields = fields.filter(f => dispute[f] && dispute[f].trim()).length;
  score += completedFields * 3;
  
  return {
    score: Math.min(score, 100),
    priority: score >= 75 ? 'high' : score >= 50 ? 'medium' : 'low',
    factors: {
      age: daysSinceCreation,
      completeness: `${completedFields}/${fields.length} fields`,
      type: dispute.title
    }
  };
};

/**
 * AI Smart Search
 * Intelligent search across disputes
 */
export const smartSearch = async (query, disputes) => {
  const lowerQuery = query.toLowerCase();
  const keywords = lowerQuery.split(/\s+/).filter(w => w.length > 2);
  
  const scoredDisputes = disputes.map(dispute => {
    let relevanceScore = 0;
    const matchedFields = [];
    
    // Search in various fields
    const searchFields = {
      title: 3,
      description: 2,
      name: 2,
      address: 1,
      landNumber: 3,
      khataNumber: 3
    };
    
    for (const [field, weight] of Object.entries(searchFields)) {
      if (dispute[field]) {
        const fieldValue = dispute[field].toLowerCase();
        for (const keyword of keywords) {
          if (fieldValue.includes(keyword)) {
            relevanceScore += weight;
            if (!matchedFields.includes(field)) matchedFields.push(field);
          }
        }
      }
    }
    
    return {
      ...dispute.toObject ? dispute.toObject() : dispute,
      relevanceScore,
      matchedFields
    };
  });
  
  return scoredDisputes
    .filter(d => d.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
};

/**
 * AI Fraud Detection
 * Detects potentially fraudulent or suspicious submissions
 */
export const detectFraud = async (disputeData, existingDisputes = []) => {
  const flags = [];
  let riskScore = 0;
  
  // Check for duplicate submissions
  const duplicates = existingDisputes.filter(d => 
    d.landNumber === disputeData.landNumber || 
    d.khataNumber === disputeData.khataNumber
  );
  if (duplicates.length > 0) {
    flags.push({
      type: 'duplicate',
      severity: 'high',
      message: 'Land/Khata number already exists in another dispute'
    });
    riskScore += 40;
  }
  
  // Check for suspicious patterns in description
  const suspiciousWords = ['urgent', 'immediate', 'fast', 'cash', 'quick sale'];
  const lowerDesc = (disputeData.description || '').toLowerCase();
  for (const word of suspiciousWords) {
    if (lowerDesc.includes(word)) {
      flags.push({
        type: 'suspicious_language',
        severity: 'medium',
        message: `Suspicious keyword detected: "${word}"`
      });
      riskScore += 10;
    }
  }
  
  // Validate Aadhaar format
  if (disputeData.aadhaarNumber && !/^\d{12}$/.test(disputeData.aadhaarNumber.replace(/\s/g, ''))) {
    flags.push({
      type: 'invalid_aadhaar',
      severity: 'medium',
      message: 'Aadhaar number format appears invalid'
    });
    riskScore += 15;
  }
  
  // Check mobile number
  if (disputeData.mobileNumber && !/^[6-9]\d{9}$/.test(disputeData.mobileNumber.replace(/\s/g, ''))) {
    flags.push({
      type: 'invalid_mobile',
      severity: 'low',
      message: 'Mobile number format appears invalid'
    });
    riskScore += 5;
  }
  
  return {
    riskScore: Math.min(riskScore, 100),
    riskLevel: riskScore >= 50 ? 'high' : riskScore >= 25 ? 'medium' : 'low',
    flags,
    recommendation: riskScore >= 50 
      ? 'Manual verification strongly recommended' 
      : riskScore >= 25 
        ? 'Additional document verification advised'
        : 'Appears legitimate, standard processing'
  };
};

// Helper functions
function calculateRiskLevel(data) {
  const factors = [];
  if (!data.landNumber) factors.push('Missing land number');
  if (!data.khataNumber) factors.push('Missing khata number');
  if (data.description?.length < 50) factors.push('Brief description');
  
  const level = factors.length >= 2 ? 'high' : factors.length === 1 ? 'medium' : 'low';
  return { level, factors };
}

function estimateResolutionTime(title) {
  const estimates = {
    'Mutual Partition': '2-4 weeks',
    'Family Partition': '4-8 weeks',
    'Boundary Demarcation': '2-3 weeks'
  };
  return estimates[title] || '4-6 weeks';
}

function categorizeLegalIssue(title, description) {
  if (title?.includes('Boundary')) return 'Property Boundary Dispute';
  if (title?.includes('Family')) return 'Inheritance/Family Property';
  if (title?.includes('Mutual')) return 'Co-owner Property Division';
  return 'General Land Dispute';
}

function generateRecommendations(title, description) {
  const recommendations = [
    'Gather all original property documents',
    'Obtain latest encumbrance certificate',
    'Get certified copy of survey records'
  ];
  
  if (title?.includes('Family')) {
    recommendations.push('Prepare family tree document');
    recommendations.push('Collect death certificates of deceased owners');
  }
  if (title?.includes('Boundary')) {
    recommendations.push('Request fresh land survey');
    recommendations.push('Document current boundary with photographs');
  }
  
  return recommendations;
}

function findSimilarCases(title) {
  const cases = {
    'Mutual Partition': [
      { case: 'Suraj vs Ramesh (2023)', outcome: 'Amicable settlement in 3 weeks' },
      { case: 'Krishna vs Venkat (2022)', outcome: 'Equal division ordered' }
    ],
    'Family Partition': [
      { case: 'Sharma Family Dispute (2023)', outcome: 'Mediated settlement' },
      { case: 'Patel Inheritance Case (2022)', outcome: 'Division per legal heirs' }
    ],
    'Boundary Demarcation': [
      { case: 'Village Survey Case (2023)', outcome: 'Fresh survey ordered' },
      { case: 'Urban Plot Dispute (2022)', outcome: 'Markers restored' }
    ]
  };
  return cases[title] || [];
}

function calculateSuccessProbability(data) {
  let probability = 70; // Base probability
  if (data.landNumber && data.khataNumber) probability += 10;
  if (data.description?.length > 100) probability += 5;
  if (data.docs?.length > 0) probability += 10;
  return Math.min(probability, 95) + '%';
}

function extractKeyIssues(description) {
  if (!description) return ['No description provided'];
  
  const issues = [];
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('dispute') || lowerDesc.includes('conflict')) {
    issues.push('Active dispute with other party');
  }
  if (lowerDesc.includes('encroach')) {
    issues.push('Potential encroachment issue');
  }
  if (lowerDesc.includes('inherit') || lowerDesc.includes('death')) {
    issues.push('Inheritance-related matter');
  }
  if (lowerDesc.includes('sell') || lowerDesc.includes('sale')) {
    issues.push('Sale/Transfer intention');
  }
  
  return issues.length > 0 ? issues : ['Standard partition request'];
}

function suggestRequiredDocuments(title) {
  const baseDocs = [
    'Original Sale Deed/Title Deed',
    'Khata Certificate & Extract',
    'Encumbrance Certificate',
    'Property Tax Receipts',
    'Aadhaar Card',
    'Recent Photographs'
  ];
  
  if (title?.includes('Family')) {
    baseDocs.push('Family Tree Document', 'Death Certificates', 'Legal Heir Certificate');
  }
  if (title?.includes('Boundary')) {
    baseDocs.push('Previous Survey Records', 'Site Photographs', 'Neighbor Details');
  }
  
  return baseDocs;
}

function generateFollowUpSuggestions(message) {
  const suggestions = [];
  
  if (message.includes('partition')) {
    suggestions.push('What documents are needed?', 'How long does it take?', 'What are the costs?');
  } else if (message.includes('boundary')) {
    suggestions.push('How to get a survey done?', 'What if neighbor disputes?', 'Cost of demarcation?');
  } else {
    suggestions.push('How to file a dispute?', 'Required documents', 'Track my case status');
  }
  
  return suggestions;
}

// Document generation helpers
function generatePartitionDeed(data) {
  return `
PARTITION DEED (DRAFT)

This Partition Deed is executed on this ___ day of _______, 2026

BETWEEN:
Party A: ${data.name || '[Name of First Party]'}
AND
Party B: [Name of Second Party]

WHEREAS:
The parties are joint owners of the property described below and have mutually agreed to partition the same.

PROPERTY DETAILS:
Land/Survey Number: ${data.landNumber || '[Land Number]'}
Khata Number: ${data.khataNumber || '[Khata Number]'}
Total Area: ${data.landArea || '[Total Area]'}
Location: ${data.address || '[Address]'}

TERMS OF PARTITION:
1. The above property shall be divided equally/as per agreed ratio between the parties.
2. Each party shall have absolute ownership of their allocated portion.
3. All encumbrances, if any, shall be cleared before partition.
4. The cost of this partition shall be borne equally by both parties.

[Additional terms to be added based on specific requirements]

This is an AI-generated draft. Please consult a legal professional for final documentation.
`;
}

function generateLegalNotice(data) {
  return `
LEGAL NOTICE (DRAFT)

Date: ${new Date().toLocaleDateString('en-IN')}

To,
[Recipient Name and Address]

Subject: Notice regarding property at ${data.address || '[Property Address]'}

Dear Sir/Madam,

Under instructions from my client, ${data.name || '[Client Name]'}, I hereby serve upon you the following legal notice:

PROPERTY DETAILS:
- Land/Survey Number: ${data.landNumber || '[Land Number]'}
- Khata Number: ${data.khataNumber || '[Khata Number]'}
- Area: ${data.landArea || '[Area]'}

MATTER:
${data.description || '[Description of the dispute]'}

DEMAND:
You are hereby called upon to [specific demand] within 15 days from receipt of this notice, failing which my client shall be constrained to initiate appropriate legal proceedings against you, at your risk as to costs and consequences.

This is an AI-generated draft. Please consult a legal professional before issuing.
`;
}

function generateAffidavit(data) {
  return `
AFFIDAVIT (DRAFT)

I, ${data.name || '[Full Name]'}, aged ___ years,
S/o or D/o or W/o: _______________
Residing at: ${data.address || '[Full Address]'}
Aadhaar No.: ${data.aadhaarNumber || '[Aadhaar Number]'}

Do hereby solemnly affirm and state as follows:

1. That I am the owner/claimant of the property bearing:
   - Land Number: ${data.landNumber || '[Land Number]'}
   - Khata Number: ${data.khataNumber || '[Khata Number]'}
   - Area: ${data.landArea || '[Area]'}

2. That the facts stated in my application/dispute registration are true and correct to the best of my knowledge and belief.

3. That I have not suppressed any material facts regarding this property.

4. ${data.description || '[Additional statements]'}

VERIFICATION:
I hereby verify that the contents of this affidavit are true and correct. Nothing material has been concealed.

Deponent

This is an AI-generated draft. Must be executed on stamp paper before a Notary.
`;
}

function generateSettlementAgreement(data) {
  return `
SETTLEMENT AGREEMENT (DRAFT)

This Settlement Agreement is entered into on ___ day of _______, 2026

PARTIES:
1. ${data.name || '[Party 1 Name]'} (hereinafter "First Party")
2. [Party 2 Name] (hereinafter "Second Party")

RECITALS:
WHEREAS, a dispute exists between the parties regarding property:
- Land Number: ${data.landNumber || '[Land Number]'}
- Khata Number: ${data.khataNumber || '[Khata Number]'}
- Located at: ${data.address || '[Address]'}

WHEREAS, the parties wish to amicably settle their dispute;

NOW THEREFORE, the parties agree as follows:

1. SETTLEMENT TERMS:
   [Terms to be specified]

2. CONSIDERATION:
   [Financial terms, if any]

3. RELEASE OF CLAIMS:
   Both parties release each other from all claims related to this dispute.

4. CONFIDENTIALITY:
   The terms of this settlement shall remain confidential.

5. GOVERNING LAW:
   This agreement shall be governed by the laws of India.

This is an AI-generated draft. Legal review is strongly recommended.
`;
}

function generateBoundaryAgreement(data) {
  return `
BOUNDARY AGREEMENT (DRAFT)

Date: ${new Date().toLocaleDateString('en-IN')}

This Boundary Agreement is made between adjacent property owners:

PROPERTY A:
Owner: ${data.name || '[Owner Name]'}
Land Number: ${data.landNumber || '[Land Number]'}
Khata Number: ${data.khataNumber || '[Khata Number]'}
Area: ${data.landArea || '[Area]'}

PROPERTY B:
Owner: [Adjacent Owner Name]
Land Number: [Adjacent Land Number]

AGREED BOUNDARY:
1. The boundary line between the properties shall be as demarcated by [survey details].
2. Boundary markers shall be placed at [specified intervals].
3. Neither party shall construct/plant within [X] feet of the boundary.
4. Any future disputes shall be resolved through mediation.

MAINTENANCE:
Both parties agree to maintain the boundary markers jointly.

This is an AI-generated draft. Professional survey and legal validation required.
`;
}

export default {
  analyzeDispute,
  generateLegalDocument,
  generateChatResponse,
  calculateDisputePriority,
  smartSearch,
  detectFraud
};
