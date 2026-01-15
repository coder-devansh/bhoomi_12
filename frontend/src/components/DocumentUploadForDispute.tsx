import React, { useState } from 'react';

interface DocumentUploadProps {
  disputeType: string;
  disputeId?: string;
  onDocumentsChange: (documents: UploadedDocument[]) => void;
}

interface UploadedDocument {
  id: string;
  fileName: string;
  documentType: string;
  fileSize: number;
  ocrStatus: 'pending' | 'processing' | 'completed' | 'failed';
  ocrConfidence?: number;
  extractedInfo?: {
    detectedType: string;
    keywords: string[];
    isRelevant: boolean;
  };
  blockchainHash?: string;
  verificationStatus: 'pending' | 'ocr-processed' | 'lawyer-review' | 'verified' | 'rejected';
  visibility?: 'private' | 'lawyer' | 'public';
}

const DocumentUploadForDispute: React.FC<DocumentUploadProps> = ({
  disputeType,
  disputeId,
  onDocumentsChange
}) => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [visibility, setVisibility] = useState<'private' | 'lawyer' | 'public'>('lawyer'); // Default to lawyer visibility

  const requiredDocuments: Record<string, { type: string; label: string; required: boolean }[]> = {
    'mutual-partition': [
      { type: 'land_deed', label: 'Land Deed / Registry', required: true },
      { type: 'identity_proof', label: 'Aadhaar Card / ID Proof', required: true },
      { type: 'partition_deed', label: 'Partition Agreement (if any)', required: false },
      { type: 'mutation_record', label: 'Mutation Record', required: false },
    ],
    'family-partition': [
      { type: 'land_deed', label: 'Land Deed / Registry', required: true },
      { type: 'identity_proof', label: 'Aadhaar Card / ID Proof', required: true },
      { type: 'inheritance_certificate', label: 'Inheritance Certificate', required: true },
      { type: 'mutation_record', label: 'Mutation Record', required: false },
      { type: 'affidavit', label: 'Family Tree Affidavit', required: false },
    ],
    'boundary-demarcation': [
      { type: 'land_deed', label: 'Land Deed / Registry', required: true },
      { type: 'survey_map', label: 'Survey Map', required: true },
      { type: 'identity_proof', label: 'Aadhaar Card / ID Proof', required: true },
      { type: 'tax_receipt', label: 'Property Tax Receipt', required: false },
    ],
  };

  const currentRequiredDocs = requiredDocuments[disputeType] || [];

  const handleFileUpload = async (file: File, documentType: string) => {
    setUploading(true);
    
    const tempDoc: UploadedDocument = {
      id: `temp-${Date.now()}`,
      fileName: file.name,
      documentType,
      fileSize: file.size,
      ocrStatus: 'processing',
      verificationStatus: 'pending'
    };
    
    setDocuments(prev => [...prev, tempDoc]);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', documentType);
      formData.append('disputeType', disputeType);
      formData.append('visibility', visibility);
      if (disputeId) {
        formData.append('disputeId', disputeId);
      }

      const response = await fetch('http://localhost:3000/api/documents/upload-for-dispute', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        const uploadedDoc: UploadedDocument = {
          id: data.document.id,
          fileName: data.document.fileName,
          documentType: data.document.documentType,
          fileSize: data.document.fileSize,
          ocrStatus: data.ocr.extracted ? 'completed' : 'failed',
          ocrConfidence: data.ocr.confidence,
          extractedInfo: data.ocr.extracted ? {
            detectedType: data.ocr.analysis?.suggestedType || 'unknown',
            keywords: data.ocr.analysis?.keywordsFound || [],
            isRelevant: data.ocr.disputeValidation?.isRelevant || false
          } : undefined,
          blockchainHash: data.blockchain.fileHash,
          verificationStatus: 'ocr-processed',
          visibility: visibility
        };

        setDocuments(prev => 
          prev.map(d => d.id === tempDoc.id ? uploadedDoc : d)
        );
        
        // Notify parent
        const updatedDocs = documents.filter(d => d.id !== tempDoc.id);
        onDocumentsChange([...updatedDocs, uploadedDoc]);
      } else {
        // Update temp doc with failed status
        setDocuments(prev => 
          prev.map(d => d.id === tempDoc.id ? { ...d, ocrStatus: 'failed' } : d)
        );
      }
    } catch (error) {
      console.error('Upload error:', error);
      setDocuments(prev => 
        prev.map(d => d.id === tempDoc.id ? { ...d, ocrStatus: 'failed' } : d)
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent, documentType: string) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file, documentType);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, documentType);
    }
  };

  const removeDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
    onDocumentsChange(documents.filter(d => d.id !== docId));
  };

  const getDocumentForType = (type: string) => {
    return documents.find(d => d.documentType === type);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'verified':
        return 'bg-green-100 text-green-700';
      case 'processing':
      case 'ocr-processed':
      case 'lawyer-review':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'verified':
        return '✅';
      case 'processing':
        return '⏳';
      case 'ocr-processed':
        return '🔍';
      case 'lawyer-review':
        return '⚖️';
      case 'failed':
      case 'rejected':
        return '❌';
      default:
        return '📄';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📎</span>
          <div>
            <h3 className="font-semibold text-gray-800">Document Upload & Verification</h3>
            <p className="text-sm text-gray-600">
              Upload required documents. They will be verified through OCR and sent to a lawyer for final approval.
            </p>
          </div>
        </div>
      </div>

      {/* Verification Workflow Info */}
      <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm">1</div>
            <span className="text-sm text-gray-600">Upload</span>
          </div>
          <div className="h-px w-8 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-sm">2</div>
            <span className="text-sm text-gray-600">OCR Scan</span>
          </div>
          <div className="h-px w-8 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm">3</div>
            <span className="text-sm text-gray-600">Blockchain</span>
          </div>
          <div className="h-px w-8 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm">4</div>
            <span className="text-sm text-gray-600">Lawyer Verify</span>
          </div>
        </div>
      </div>

      {/* Visibility Selector */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📤 Document Visibility
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Choose who can see your uploaded documents
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setVisibility('private')}
            className={`flex-1 px-4 py-3 rounded-lg border-2 transition ${
              visibility === 'private'
                ? 'border-gray-500 bg-gray-50 text-gray-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-xl mb-1 block">🔒</span>
            <span className="font-medium text-sm">Private</span>
            <p className="text-xs text-gray-500 mt-1">Only you can see</p>
          </button>
          <button
            type="button"
            onClick={() => setVisibility('lawyer')}
            className={`flex-1 px-4 py-3 rounded-lg border-2 transition ${
              visibility === 'lawyer'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <span className="text-xl mb-1 block">⚖️</span>
            <span className="font-medium text-sm">Share with Lawyer</span>
            <p className="text-xs text-gray-500 mt-1">Recommended for verification</p>
          </button>
          <button
            type="button"
            onClick={() => setVisibility('public')}
            className={`flex-1 px-4 py-3 rounded-lg border-2 transition ${
              visibility === 'public'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-green-300'
            }`}
          >
            <span className="text-xl mb-1 block">🌐</span>
            <span className="font-medium text-sm">Public</span>
            <p className="text-xs text-gray-500 mt-1">Anyone can view</p>
          </button>
        </div>
      </div>

      {/* Required Documents */}
      <div className="space-y-4">
        {currentRequiredDocs.map((docReq) => {
          const uploadedDoc = getDocumentForType(docReq.type);
          
          return (
            <div 
              key={docReq.type}
              className={`border-2 rounded-xl p-4 transition ${
                uploadedDoc 
                  ? 'border-green-200 bg-green-50' 
                  : docReq.required 
                    ? 'border-red-200 bg-red-50' 
                    : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    uploadedDoc ? 'bg-green-200' : docReq.required ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    <span className="text-xl">
                      {uploadedDoc ? '✅' : docReq.required ? '⚠️' : '📄'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {docReq.label}
                      {docReq.required && <span className="text-red-500 ml-1">*</span>}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {docReq.required ? 'Required document' : 'Optional - but recommended'}
                    </p>
                  </div>
                </div>

                {!uploadedDoc ? (
                  <label className="cursor-pointer">
                    <div className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                      <span>📤</span>
                      <span>Upload</span>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileSelect(e, docReq.type)}
                      disabled={uploading}
                    />
                  </label>
                ) : (
                  <button
                    onClick={() => removeDocument(uploadedDoc.id)}
                    className="px-3 py-1 text-red-600 hover:bg-red-100 rounded-lg transition"
                  >
                    🗑️ Remove
                  </button>
                )}
              </div>

              {/* Uploaded Document Info */}
              {uploadedDoc && (
                <div className="mt-4 bg-white rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📄</span>
                      <div>
                        <p className="font-medium text-gray-800">{uploadedDoc.fileName}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(uploadedDoc.fileSize)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(uploadedDoc.ocrStatus)}`}>
                        {getStatusIcon(uploadedDoc.ocrStatus)} OCR: {uploadedDoc.ocrStatus}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(uploadedDoc.verificationStatus)}`}>
                        {getStatusIcon(uploadedDoc.verificationStatus)} {uploadedDoc.verificationStatus}
                      </span>
                    </div>
                  </div>

                  {/* OCR Results */}
                  {uploadedDoc.ocrStatus === 'completed' && uploadedDoc.extractedInfo && (
                    <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🔍</span>
                        <span className="font-medium text-blue-800">OCR Analysis</span>
                        {uploadedDoc.ocrConfidence && (
                          <span className="text-sm text-blue-600">
                            ({uploadedDoc.ocrConfidence.toFixed(1)}% confidence)
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {uploadedDoc.extractedInfo.keywords.slice(0, 5).map((keyword, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {keyword}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span>Detected as:</span>
                        <span className="font-medium text-blue-700">
                          {uploadedDoc.extractedInfo.detectedType.replace(/_/g, ' ')}
                        </span>
                        {uploadedDoc.extractedInfo.isRelevant ? (
                          <span className="text-green-600">✓ Relevant to this dispute</span>
                        ) : (
                          <span className="text-yellow-600">⚠️ May not be relevant</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Blockchain Hash */}
                  {uploadedDoc.blockchainHash && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span>🔗</span>
                        <span className="text-sm font-medium text-gray-700">Blockchain Secured</span>
                      </div>
                      <p className="font-mono text-xs text-gray-500 truncate">
                        SHA-256: {uploadedDoc.blockchainHash}
                      </p>
                    </div>
                  )}

                  {/* Verification Status */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📋</span>
                    <span>
                      {uploadedDoc.verificationStatus === 'ocr-processed' 
                        ? 'OCR completed. Pending lawyer verification.' 
                        : uploadedDoc.verificationStatus === 'verified'
                          ? 'Document verified by lawyer.'
                          : uploadedDoc.verificationStatus === 'rejected'
                            ? 'Document rejected. Please upload a valid document.'
                            : 'Processing...'}
                    </span>
                  </div>
                </div>
              )}

              {/* Drop Zone for Upload */}
              {!uploadedDoc && (
                <div 
                  className={`mt-4 border-2 border-dashed rounded-lg p-6 text-center transition ${
                    dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => handleDrop(e, docReq.type)}
                >
                  <span className="text-3xl mb-2 block">📁</span>
                  <p className="text-gray-600">Drag & drop your {docReq.label} here</p>
                  <p className="text-xs text-gray-400 mt-1">Supports: PDF, JPG, PNG (Max 10MB)</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-xl p-4 border">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-800">Document Summary</h4>
            <p className="text-sm text-gray-500">
              {documents.length} of {currentRequiredDocs.filter(d => d.required).length} required documents uploaded
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {documents.filter(d => d.ocrStatus === 'completed').length}
              </div>
              <div className="text-xs text-gray-500">OCR Done</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {documents.filter(d => d.verificationStatus === 'ocr-processed').length}
              </div>
              <div className="text-xs text-gray-500">Pending Review</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {documents.filter(d => d.blockchainHash).length}
              </div>
              <div className="text-xs text-gray-500">Secured</div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Verification Process:</p>
            <ul className="list-disc list-inside space-y-1 text-yellow-700">
              <li>Documents are scanned using OCR to extract text and verify content</li>
              <li>Each document is secured with a unique blockchain hash</li>
              <li>A lawyer will review and verify all documents before processing your request</li>
              <li>You'll be notified once all documents are verified</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadForDispute;
