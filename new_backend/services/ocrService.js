/**
 * BhoomiSetu OCR Service
 * Extract text from documents using Tesseract.js
 */

import Tesseract from 'tesseract.js';
import fs from 'fs';
import path from 'path';

/**
 * Extract text from an image file using OCR
 * @param {string} filePath - Path to the image file
 * @param {string} language - Language code (eng, hin, etc.)
 * @returns {Promise<object>} - Extracted text and confidence
 */
export const extractTextFromImage = async (filePath, language = 'eng+hin') => {
  try {
    console.log(`Starting OCR for file: ${filePath}`);
    
    const result = await Tesseract.recognize(filePath, language, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });

    return {
      success: true,
      text: result.data.text,
      confidence: result.data.confidence,
      words: result.data.words?.length || 0,
      language: language
    };
  } catch (error) {
    console.error('OCR Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Extract text from PDF (converts to images first)
 * For PDFs, we'll extract text directly or use pdf-parse
 */
export const extractTextFromPDF = async (filePath) => {
  try {
    // For PDFs, we'll use a simple text extraction approach
    // In production, you'd want to use pdf-parse or similar
    const pdfParse = await import('pdf-parse/lib/pdf-parse.js');
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse.default(dataBuffer);
    
    return {
      success: true,
      text: data.text,
      pages: data.numpages,
      info: data.info
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
    return {
      success: false,
      error: 'PDF text extraction failed. Please upload an image format.'
    };
  }
};

/**
 * Smart document text extraction based on file type
 */
export const extractDocumentText = async (filePath, mimeType) => {
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/tiff', 'image/bmp'];
  const pdfTypes = ['application/pdf'];

  if (imageTypes.includes(mimeType)) {
    return await extractTextFromImage(filePath);
  } else if (pdfTypes.includes(mimeType)) {
    return await extractTextFromPDF(filePath);
  } else {
    return {
      success: false,
      error: 'Unsupported file type for OCR'
    };
  }
};

/**
 * Analyze extracted text for land document keywords
 */
export const analyzeDocumentContent = (extractedText) => {
  const text = extractedText.toLowerCase();
  
  // Keywords for different document types
  const documentPatterns = {
    land_deed: ['deed', 'conveyance', 'property', 'land', 'plot', 'khasra', 'khatauni', 'registry', 'registered'],
    sale_deed: ['sale deed', 'sold', 'purchaser', 'vendor', 'consideration', 'transfer'],
    mutation_record: ['mutation', 'fard', 'jamabandi', 'khewat', 'khatoni'],
    survey_map: ['survey', 'map', 'boundary', 'area', 'hectare', 'acre', 'measurement'],
    tax_receipt: ['tax', 'receipt', 'payment', 'revenue', 'property tax'],
    identity_proof: ['aadhaar', 'aadhar', 'pan', 'voter', 'passport', 'driving license'],
    court_order: ['court', 'order', 'judgment', 'decree', 'petition', 'civil'],
    partition_deed: ['partition', 'division', 'share', 'portion', 'co-sharer']
  };

  const detectedTypes = [];
  const keywordsFound = [];

  for (const [docType, keywords] of Object.entries(documentPatterns)) {
    const foundKeywords = keywords.filter(keyword => text.includes(keyword));
    if (foundKeywords.length > 0) {
      detectedTypes.push(docType);
      keywordsFound.push(...foundKeywords);
    }
  }

  // Extract potential information
  const extractedInfo = {
    // Try to find plot/khasra numbers
    plotNumbers: text.match(/(?:plot|khasra|khata)[\s.:]*(?:no\.?|number)?[\s.:]*(\d+[\/\-]?\d*)/gi) || [],
    // Try to find areas
    areas: text.match(/(\d+\.?\d*)\s*(?:hectare|acre|sq\.?\s*(?:ft|feet|meter|m)|bigha|biswa)/gi) || [],
    // Try to find dates
    dates: text.match(/\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}/g) || [],
    // Try to find names (basic pattern)
    possibleNames: text.match(/(?:name|shri|smt|mr|mrs|ms)[\s.:]+([a-zA-Z\s]+)/gi) || []
  };

  return {
    detectedDocumentTypes: detectedTypes,
    keywordsFound: [...new Set(keywordsFound)],
    extractedInfo,
    confidence: detectedTypes.length > 0 ? 'high' : 'low',
    suggestedType: detectedTypes[0] || 'other'
  };
};

/**
 * Validate document for dispute type
 */
export const validateDocumentForDispute = (analysis, disputeType) => {
  const requiredDocsMap = {
    'mutual-partition': ['land_deed', 'identity_proof', 'partition_deed'],
    'family-partition': ['land_deed', 'identity_proof', 'mutation_record'],
    'boundary-demarcation': ['land_deed', 'survey_map', 'identity_proof']
  };

  const requiredDocs = requiredDocsMap[disputeType] || [];
  const matchedDocs = analysis.detectedDocumentTypes.filter(doc => requiredDocs.includes(doc));

  return {
    isRelevant: matchedDocs.length > 0,
    matchedDocTypes: matchedDocs,
    requiredDocTypes: requiredDocs,
    completeness: requiredDocs.length > 0 ? (matchedDocs.length / requiredDocs.length) * 100 : 0
  };
};

export default {
  extractTextFromImage,
  extractTextFromPDF,
  extractDocumentText,
  analyzeDocumentContent,
  validateDocumentForDispute
};
