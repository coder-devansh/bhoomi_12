import React, { useState, useEffect, useCallback } from 'react';

interface Document {
  id: string;
  fileName: string;
  documentType: string;
  fileSize: number;
  status: string;
  visibility: string;
  description: string;
  uploadedAt: string;
  blockchain: {
    fileHash: string;
    isVerified: boolean;
    blockHash: string;
    verifiedAt: string;
  };
}

interface BlockchainStats {
  totalBlocks: number;
  totalDocuments: number;
  pendingTransactions: number;
  isValid: boolean;
  latestBlockHash: string;
}

interface VerificationResult {
  verified: boolean;
  message: string;
  document?: {
    id: string;
    fileName: string;
    documentType: string;
    uploadedAt: string;
  };
  blockchain?: {
    fileHash: string;
    blockIndex: number;
    blockHash: string;
    registeredAt: string;
  };
  fileHash?: string;
}

const BlockchainDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [blockchainStats, setBlockchainStats] = useState<BlockchainStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [verifyFile, setVerifyFile] = useState<File | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [uploadForm, setUploadForm] = useState({
    documentType: 'other',
    description: '',
    visibility: 'private'
  });
  const [activeTab, setActiveTab] = useState<'upload' | 'documents' | 'verify'>('documents');
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificate, setCertificate] = useState<any>(null);

  const API_URL = 'http://localhost:3000/api/documents';

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/my-documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBlockchainStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/blockchain/stats`);
      const data = await response.json();
      if (data.success) {
        setBlockchainStats(data.blockchain);
      }
    } catch (error) {
      console.error('Error fetching blockchain stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
    fetchBlockchainStats();
  }, [fetchDocuments, fetchBlockchainStats]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleVerifyFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVerifyFile(e.target.files[0]);
      setVerificationResult(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('documentType', uploadForm.documentType);
      formData.append('description', uploadForm.description);
      formData.append('visibility', uploadForm.visibility);

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Document uploaded and secured on blockchain!');
        setSelectedFile(null);
        setUploadForm({ documentType: 'other', description: '', visibility: 'private' });
        fetchDocuments();
        fetchBlockchainStats();
        setActiveTab('documents');
      } else if (response.status === 409) {
        alert('⚠️ This document already exists in the system!');
      } else {
        alert('❌ Failed to upload document. Please try again.');
      }
    } catch (error: any) {
      alert('❌ Failed to upload document. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleVerifyDocument = async () => {
    if (!verifyFile) return;

    setVerifying(true);
    setVerificationResult(null);
    try {
      const formData = new FormData();
      formData.append('document', verifyFile);

      const response = await fetch(`${API_URL}/verify-hash`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      setVerificationResult(data);
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationResult({
        verified: false,
        message: 'Verification failed. Please try again.'
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleGetCertificate = async (documentId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/certificate/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setCertificate(data.certificate);
        setShowCertificate(true);
      }
    } catch (error) {
      console.error('Certificate error:', error);
      alert('Failed to generate certificate');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const documentTypes = [
    { value: 'land_deed', label: 'Land Deed' },
    { value: 'sale_deed', label: 'Sale Deed' },
    { value: 'mutation_record', label: 'Mutation Record' },
    { value: 'survey_map', label: 'Survey Map' },
    { value: 'tax_receipt', label: 'Tax Receipt' },
    { value: 'identity_proof', label: 'Identity Proof' },
    { value: 'address_proof', label: 'Address Proof' },
    { value: 'court_order', label: 'Court Order' },
    { value: 'agreement', label: 'Agreement' },
    { value: 'affidavit', label: 'Affidavit' },
    { value: 'power_of_attorney', label: 'Power of Attorney' },
    { value: 'partition_deed', label: 'Partition Deed' },
    { value: 'inheritance_certificate', label: 'Inheritance Certificate' },
    { value: 'encumbrance_certificate', label: 'Encumbrance Certificate' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-3xl">🔗</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Blockchain-Secured Documents</h1>
              <p className="text-blue-100">Your documents are protected with SHA-256 hashing & blockchain verification</p>
            </div>
          </div>
          
          {/* Blockchain Stats */}
          {blockchainStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-2xl font-bold">{blockchainStats.totalBlocks}</div>
                <div className="text-blue-100 text-sm">Total Blocks</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-2xl font-bold">{blockchainStats.totalDocuments}</div>
                <div className="text-blue-100 text-sm">Documents Secured</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-2xl font-bold flex items-center gap-2">
                  {blockchainStats.isValid ? '✅' : '❌'}
                  {blockchainStats.isValid ? 'Valid' : 'Invalid'}
                </div>
                <div className="text-blue-100 text-sm">Chain Integrity</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-xs font-mono truncate">{blockchainStats.latestBlockHash?.substring(0, 16)}...</div>
                <div className="text-blue-100 text-sm">Latest Block Hash</div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'documents', label: '📁 My Documents', icon: '📁' },
            { id: 'upload', label: '⬆️ Upload', icon: '⬆️' },
            { id: 'verify', label: '🔍 Verify Document', icon: '🔍' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl font-medium transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Upload & Secure Document</h2>
            
            <form onSubmit={handleUpload} className="space-y-6">
              {/* File Drop Zone */}
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center transition ${
                  selectedFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                {selectedFile ? (
                  <div className="space-y-2">
                    <span className="text-4xl">📄</span>
                    <p className="font-medium text-gray-800">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-red-500 text-sm hover:underline"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="text-4xl">📤</span>
                    <p className="text-gray-600">Drag & drop your document here, or</p>
                    <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
                      Browse Files
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                    </label>
                    <p className="text-xs text-gray-400">PDF, DOC, DOCX, JPG, PNG (Max 10MB)</p>
                  </div>
                )}
              </div>

              {/* Document Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                <select
                  value={uploadForm.documentType}
                  onChange={(e) => setUploadForm({ ...uploadForm, documentType: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {documentTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Add a description for this document..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
                <div className="flex gap-4">
                  {[
                    { value: 'private', label: '🔒 Private', desc: 'Only you can see' },
                    { value: 'dispute_parties', label: '👥 Dispute Parties', desc: 'Visible to parties' },
                    { value: 'lawyers', label: '⚖️ Lawyers', desc: 'Visible to lawyers' }
                  ].map(opt => (
                    <label
                      key={opt.value}
                      className={`flex-1 p-4 border-2 rounded-xl cursor-pointer transition ${
                        uploadForm.visibility === opt.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="visibility"
                        value={opt.value}
                        checked={uploadForm.visibility === opt.value}
                        onChange={(e) => setUploadForm({ ...uploadForm, visibility: e.target.value })}
                        className="sr-only"
                      />
                      <div className="font-medium">{opt.label}</div>
                      <div className="text-xs text-gray-500">{opt.desc}</div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Security Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🔐</span>
                  <div>
                    <p className="font-medium text-blue-800">Blockchain Security</p>
                    <p className="text-sm text-blue-600">
                      Your document will be hashed using SHA-256 and recorded on our blockchain. 
                      Any tampering will be immediately detectable.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!selectedFile || uploading}
                className={`w-full py-4 rounded-xl font-bold text-white transition ${
                  !selectedFile || uploading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg'
                }`}
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Uploading & Securing...
                  </span>
                ) : (
                  '🔗 Upload & Secure on Blockchain'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-6">My Secured Documents</h2>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin text-4xl mb-4">⏳</div>
                <p className="text-gray-500">Loading documents...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">📂</span>
                <p className="text-gray-500 mb-4">No documents uploaded yet</p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Upload Your First Document
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map(doc => (
                  <div
                    key={doc.id}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <span className="text-2xl">
                            {doc.documentType === 'land_deed' ? '📜' :
                             doc.documentType === 'survey_map' ? '🗺️' :
                             doc.documentType === 'identity_proof' ? '🪪' : '📄'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{doc.fileName}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span>{documentTypes.find(t => t.value === doc.documentType)?.label || 'Document'}</span>
                            <span>•</span>
                            <span>{formatFileSize(doc.fileSize)}</span>
                            <span>•</span>
                            <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                          </div>
                          {doc.description && (
                            <p className="text-sm text-gray-600 mt-2">{doc.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Blockchain Status Badge */}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          doc.blockchain.isVerified
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {doc.blockchain.isVerified ? '🔗 Blockchain Secured' : '⏳ Pending'}
                        </span>
                        
                        {/* Visibility Badge */}
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          {doc.visibility === 'private' ? '🔒 Private' :
                           doc.visibility === 'dispute_parties' ? '👥 Parties' : '⚖️ Lawyers'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Blockchain Info */}
                    {doc.blockchain.isVerified && (
                      <div className="mt-4 bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs text-gray-500">SHA-256 Hash:</span>
                            <p className="font-mono text-xs text-gray-700 truncate max-w-md">
                              {doc.blockchain.fileHash}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(doc.blockchain.fileHash);
                                alert('Hash copied to clipboard!');
                              }}
                              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                              📋 Copy Hash
                            </button>
                            <button
                              onClick={() => handleGetCertificate(doc.id)}
                              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                            >
                              📜 Certificate
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Verify Tab */}
        {activeTab === 'verify' && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Verify Document Authenticity</h2>
            <p className="text-gray-500 mb-6">
              Upload any document to check if it's registered on our blockchain and hasn't been tampered with.
            </p>

            {/* Verify File Upload */}
            <div 
              className={`border-2 border-dashed rounded-xl p-8 text-center transition mb-6 ${
                verifyFile ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              {verifyFile ? (
                <div className="space-y-2">
                  <span className="text-4xl">🔍</span>
                  <p className="font-medium text-gray-800">{verifyFile.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(verifyFile.size)}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setVerifyFile(null);
                      setVerificationResult(null);
                    }}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="text-4xl">🔎</span>
                  <p className="text-gray-600">Select a document to verify</p>
                  <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
                    Choose File
                    <input
                      type="file"
                      onChange={handleVerifyFileSelect}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </label>
                </div>
              )}
            </div>

            {verifyFile && (
              <button
                onClick={handleVerifyDocument}
                disabled={verifying}
                className={`w-full py-4 rounded-xl font-bold text-white mb-6 transition ${
                  verifying
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                }`}
              >
                {verifying ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verifying on Blockchain...
                  </span>
                ) : (
                  '🔍 Verify Document'
                )}
              </button>
            )}

            {/* Verification Result */}
            {verificationResult && (
              <div className={`rounded-xl p-6 ${
                verificationResult.verified
                  ? 'bg-green-50 border-2 border-green-200'
                  : 'bg-red-50 border-2 border-red-200'
              }`}>
                <div className="flex items-start gap-4">
                  <span className="text-5xl">
                    {verificationResult.verified ? '✅' : '❌'}
                  </span>
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold ${
                      verificationResult.verified ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {verificationResult.verified ? 'Document Verified!' : 'Document Not Found'}
                    </h3>
                    <p className={`mt-1 ${
                      verificationResult.verified ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {verificationResult.message}
                    </p>

                    {verificationResult.verified && verificationResult.blockchain && (
                      <div className="mt-4 bg-white rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500">File Name:</span>
                          <span className="font-medium">{verificationResult.document?.fileName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Document Type:</span>
                          <span className="font-medium">{verificationResult.document?.documentType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Block Index:</span>
                          <span className="font-mono">{verificationResult.blockchain.blockIndex}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Registered:</span>
                          <span className="font-medium">
                            {new Date(verificationResult.blockchain.registeredAt).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">File Hash:</span>
                          <p className="font-mono text-xs break-all mt-1">{verificationResult.blockchain.fileHash}</p>
                        </div>
                      </div>
                    )}

                    {!verificationResult.verified && verificationResult.fileHash && (
                      <div className="mt-4 bg-white rounded-lg p-4">
                        <span className="text-gray-500">Computed Hash:</span>
                        <p className="font-mono text-xs break-all mt-1">{verificationResult.fileHash}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Certificate Modal */}
        {showCertificate && certificate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800">📜 Blockchain Verification Certificate</h2>
                  <button
                    onClick={() => setShowCertificate(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Certificate Header */}
                <div className="text-center border-b pb-6">
                  <div className="text-5xl mb-4">🔐</div>
                  <h3 className="text-2xl font-bold text-green-700">Document Authenticity Verified</h3>
                  <p className="text-gray-500">Certificate ID: {certificate.certificateId}</p>
                </div>

                {/* Document Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-700 mb-3">Document Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Document ID:</span>
                      <span className="font-mono">{certificate.documentId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">File Name:</span>
                      <span>{certificate.document?.fileName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span>{certificate.document?.documentType}</span>
                    </div>
                  </div>
                </div>

                {/* Blockchain Record */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-700 mb-3">Blockchain Record</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-500">Block Index:</span>
                      <span className="font-mono">{certificate.blockchainRecord?.blockIndex}</span>
                    </div>
                    <div>
                      <span className="text-blue-500">Block Hash:</span>
                      <p className="font-mono text-xs break-all mt-1">{certificate.blockchainRecord?.blockHash}</p>
                    </div>
                    <div>
                      <span className="text-blue-500">File Hash (SHA-256):</span>
                      <p className="font-mono text-xs break-all mt-1">{certificate.fileHash}</p>
                    </div>
                  </div>
                </div>

                {/* Verification Status */}
                <div className="bg-green-50 rounded-xl p-4">
                  <h4 className="font-semibold text-green-700 mb-3">Verification Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-500">Status:</span>
                      <span className="font-bold text-green-700">
                        {certificate.verification?.isValid ? '✅ Valid' : '❌ Invalid'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-500">Chain Integrity:</span>
                      <span className="font-bold text-green-700">{certificate.verification?.chainIntegrity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-500">Verified At:</span>
                      <span>{new Date(certificate.verification?.verifiedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="text-xs text-gray-500 text-center border-t pt-4">
                  <p><strong>Issuer:</strong> {certificate.issuer}</p>
                  <p className="mt-2">{certificate.disclaimer}</p>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={() => window.print()}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
                >
                  🖨️ Print Certificate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockchainDocuments;
