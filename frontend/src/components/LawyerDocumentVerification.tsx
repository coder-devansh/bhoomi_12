import React, { useState, useEffect, useCallback } from 'react';

interface Document {
  id: string;
  fileName: string;
  documentType: string;
  fileSize: number;
  description?: string;
  visibility?: string;
  uploadedBy: {
    name: string;
    email: string;
  };
  dispute?: {
    _id: string;
    title: string;
    disputeType: string;
    status: string;
  };
  blockchain: {
    fileHash: string;
    isVerified: boolean;
    blockHash?: string;
  };
  ocrExtraction?: {
    extractedText: string;
    confidence: number;
    keywordsFound: string[];
    detectedDocType: string;
  };
  status: string;
  uploadedAt: string;
}

interface VerificationSummary {
  pending: number;
  verified: number;
  rejected: number;
  total: number;
}

const LawyerDocumentVerification: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [sharedDocuments, setSharedDocuments] = useState<Document[]>([]);
  const [summary, setSummary] = useState<VerificationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showOCRModal, setShowOCRModal] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [remarks, setRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
  const [activeTab, setActiveTab] = useState<'verification' | 'shared'>('verification');

  const API_URL = 'http://localhost:3000/api/documents';

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/pending-verification`, {
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

  const fetchSharedDocuments = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/shared-with-lawyer`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setSharedDocuments(data.documents);
      }
    } catch (error) {
      console.error('Error fetching shared documents:', error);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/verification-summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
    fetchSharedDocuments();
    fetchSummary();
  }, [fetchDocuments, fetchSharedDocuments, fetchSummary]);

  const handleVerify = async (documentId: string, verified: boolean) => {
    setVerifyingId(documentId);
    try {
      const token = localStorage.getItem('token');
      const doc = documents.find(d => d.id === documentId);
      
      const response = await fetch(`${API_URL}/verify-by-lawyer/${documentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          disputeId: doc?.dispute?._id,
          verified,
          remarks,
          rejectionReason: !verified ? rejectionReason : undefined
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(verified ? '✅ Document verified successfully!' : '❌ Document rejected');
        fetchDocuments();
        fetchSummary();
        setSelectedDoc(null);
        setRemarks('');
        setRejectionReason('');
      }
    } catch (error) {
      console.error('Verification error:', error);
      alert('Verification failed. Please try again.');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleRunOCR = async (documentId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/ocr-extract/${documentId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setOcrText(data.ocr.text);
        setShowOCRModal(true);
      } else {
        alert('OCR extraction failed: ' + data.error);
      }
    } catch (error) {
      console.error('OCR error:', error);
      alert('OCR extraction failed');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      land_deed: 'Land Deed',
      sale_deed: 'Sale Deed',
      mutation_record: 'Mutation Record',
      survey_map: 'Survey Map',
      tax_receipt: 'Tax Receipt',
      identity_proof: 'Identity Proof',
      court_order: 'Court Order',
      partition_deed: 'Partition Deed',
      inheritance_certificate: 'Inheritance Certificate',
      other: 'Other Document'
    };
    return labels[type] || type;
  };

  const filteredDocuments = documents.filter(doc => {
    if (filter === 'all') return true;
    if (filter === 'pending') return doc.status === 'pending' || doc.status === 'verified';
    return doc.status === filter;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Document Verification Center</h1>
            <p className="text-purple-100 mt-1">Review and verify uploaded documents</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => { fetchDocuments(); fetchSharedDocuments(); fetchSummary(); }}
              className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mt-6 border-b border-white/20 pb-2">
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-4 py-2 rounded-t-lg font-medium transition ${
              activeTab === 'verification'
                ? 'bg-white text-purple-700'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            ✅ Document Verification ({summary?.pending || 0} pending)
          </button>
          <button
            onClick={() => setActiveTab('shared')}
            className={`px-4 py-2 rounded-t-lg font-medium transition ${
              activeTab === 'shared'
                ? 'bg-white text-purple-700'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            📁 Shared Documents ({sharedDocuments.length})
          </button>
        </div>

        {/* Summary Stats - Only show for verification tab */}
        {activeTab === 'verification' && summary && (
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">{summary.pending}</div>
              <div className="text-purple-100 text-sm">Pending Review</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-300">{summary.verified}</div>
              <div className="text-purple-100 text-sm">Verified</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-red-300">{summary.rejected}</div>
              <div className="text-purple-100 text-sm">Rejected</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">{summary.total}</div>
              <div className="text-purple-100 text-sm">Total</div>
            </div>
          </div>
        )}
      </div>

      {/* Verification Tab Content */}
      {activeTab === 'verification' && (
        <>
          {/* Filters */}
          <div className="flex gap-2">
            {[
              { id: 'pending', label: '⏳ Pending', count: summary?.pending },
              { id: 'verified', label: '✅ Verified', count: summary?.verified },
              { id: 'rejected', label: '❌ Rejected', count: summary?.rejected },
              { id: 'all', label: '📋 All', count: summary?.total },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === f.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f.label} {f.count !== undefined && `(${f.count})`}
              </button>
            ))}
          </div>

          {/* Documents List */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin text-4xl mb-4">⏳</div>
                <p className="text-gray-500">Loading documents...</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="p-12 text-center">
                <span className="text-6xl mb-4 block">📭</span>
                <p className="text-gray-500">No documents {filter !== 'all' ? `with status "${filter}"` : ''}</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredDocuments.map(doc => (
                  <div 
                    key={doc.id}
                    className={`p-4 hover:bg-gray-50 transition ${
                      selectedDoc?.id === doc.id ? 'bg-purple-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          doc.status === 'verified' ? 'bg-green-100' :
                          doc.status === 'rejected' ? 'bg-red-100' : 'bg-yellow-100'
                    }`}>
                      <span className="text-2xl">
                        {doc.status === 'verified' ? '✅' :
                         doc.status === 'rejected' ? '❌' : '📄'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{doc.fileName}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span>{getDocumentTypeLabel(doc.documentType)}</span>
                        <span>•</span>
                        <span>{formatFileSize(doc.fileSize)}</span>
                        <span>•</span>
                        <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-gray-600">
                          👤 {doc.uploadedBy?.name || 'Unknown User'}
                        </span>
                        {doc.dispute && (
                          <>
                            <span className="text-gray-400">|</span>
                            <span className="text-sm text-purple-600">
                              📋 {doc.dispute.title}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      doc.status === 'verified' ? 'bg-green-100 text-green-700' :
                      doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {doc.status === 'verified' ? '✅ Verified' :
                       doc.status === 'rejected' ? '❌ Rejected' :
                       '⏳ Pending'}
                    </span>
                    
                    {/* Blockchain Badge */}
                    {doc.blockchain?.isVerified && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        🔗 Blockchain
                      </span>
                    )}
                  </div>
                </div>

                {/* OCR Info */}
                {doc.ocrExtraction && (
                  <div className="mt-4 bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>🔍</span>
                        <span className="font-medium text-blue-800">OCR Analysis</span>
                        <span className="text-sm text-blue-600">
                          ({doc.ocrExtraction.confidence?.toFixed(1)}% confidence)
                        </span>
                      </div>
                      <button
                        onClick={() => handleRunOCR(doc.id)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View Full Text →
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {doc.ocrExtraction.keywordsFound?.slice(0, 6).map((keyword, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {keyword}
                        </span>
                      ))}
                    </div>
                    {doc.ocrExtraction.detectedDocType && (
                      <p className="text-sm text-blue-600 mt-2">
                        Detected as: <strong>{getDocumentTypeLabel(doc.ocrExtraction.detectedDocType)}</strong>
                      </p>
                    )}
                  </div>
                )}

                {/* Blockchain Hash */}
                {doc.blockchain?.fileHash && (
                  <div className="mt-3 bg-gray-50 rounded-lg p-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>🔗</span>
                      <span className="font-mono text-xs text-gray-500 truncate max-w-md">
                        SHA-256: {doc.blockchain.fileHash}
                      </span>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(doc.blockchain.fileHash)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      📋 Copy
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                {doc.status !== 'verified' && doc.status !== 'rejected' && (
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={() => setSelectedDoc(selectedDoc?.id === doc.id ? null : doc)}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
                    >
                      {selectedDoc?.id === doc.id ? '✕ Cancel' : '📝 Review & Verify'}
                    </button>
                    <a
                      href={`http://localhost:3000/api/documents/download/${doc.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                      📥 Download
                    </a>
                  </div>
                )}

                {/* Verification Form */}
                {selectedDoc?.id === doc.id && (
                  <div className="mt-4 bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                    <h4 className="font-semibold text-purple-800 mb-3">Verification Decision</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Remarks (Optional)
                        </label>
                        <textarea
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          placeholder="Add any remarks about this document..."
                          rows={2}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rejection Reason (if rejecting)
                        </label>
                        <input
                          type="text"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Reason for rejection..."
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => handleVerify(doc.id, true)}
                          disabled={verifyingId === doc.id}
                          className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50"
                        >
                          {verifyingId === doc.id ? '⏳ Processing...' : '✅ Verify Document'}
                        </button>
                        <button
                          onClick={() => handleVerify(doc.id, false)}
                          disabled={verifyingId === doc.id || !rejectionReason}
                          className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition disabled:opacity-50"
                        >
                          {verifyingId === doc.id ? '⏳ Processing...' : '❌ Reject Document'}
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
        </>
      )}

      {/* Shared Documents Tab Content */}
      {activeTab === 'shared' && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 border-b bg-blue-50">
            <h3 className="font-semibold text-blue-800">📁 Documents Shared by Users</h3>
            <p className="text-sm text-blue-600">These documents have been shared with lawyers for review</p>
          </div>
          
          {sharedDocuments.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-6xl mb-4 block">📭</span>
              <p className="text-gray-500">No documents have been shared yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {sharedDocuments.map(doc => (
                <div key={doc.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                        <span className="text-2xl">📄</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{doc.fileName}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                          <span>{getDocumentTypeLabel(doc.documentType)}</span>
                          <span>•</span>
                          <span>{formatFileSize(doc.fileSize)}</span>
                          <span>•</span>
                          <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-gray-600">
                            👤 {doc.uploadedBy?.name || 'Unknown User'}
                          </span>
                          {doc.description && (
                            <>
                              <span className="text-gray-400">|</span>
                              <span className="text-sm text-gray-500">
                                📝 {doc.description}
                              </span>
                            </>
                          )}
                        </div>
                        {doc.dispute && (
                          <div className="mt-2">
                            <span className="text-sm text-purple-600">
                              📋 Linked to: {doc.dispute.title}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Visibility Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        doc.visibility === 'public' ? 'bg-green-100 text-green-700' :
                        doc.visibility === 'lawyer' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {doc.visibility === 'public' ? '🌐 Public' :
                         doc.visibility === 'lawyer' ? '⚖️ Lawyer' : '🔒 Private'}
                      </span>
                      
                      {/* Blockchain Badge */}
                      {doc.blockchain?.isVerified && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          🔗 Blockchain Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Blockchain Hash */}
                  {doc.blockchain?.fileHash && (
                    <div className="mt-3 bg-gray-50 rounded-lg p-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>🔗</span>
                        <span className="font-mono text-xs text-gray-500 truncate max-w-md">
                          SHA-256: {doc.blockchain.fileHash}
                        </span>
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(doc.blockchain.fileHash)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        📋 Copy
                      </button>
                    </div>
                  )}

                  {/* OCR Info */}
                  {doc.ocrExtraction && (
                    <div className="mt-3 bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>🔍</span>
                          <span className="font-medium text-blue-800">OCR Analysis</span>
                          <span className="text-sm text-blue-600">
                            ({doc.ocrExtraction.confidence?.toFixed(1)}% confidence)
                          </span>
                        </div>
                        <button
                          onClick={() => { setOcrText(doc.ocrExtraction?.extractedText || ''); setShowOCRModal(true); }}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Full Text →
                        </button>
                      </div>
                      {doc.ocrExtraction.keywordsFound && doc.ocrExtraction.keywordsFound.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {doc.ocrExtraction.keywordsFound.slice(0, 6).map((keyword, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 flex items-center gap-3">
                    <a
                      href={`http://localhost:3000/api/documents/download/${doc.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                    >
                      📥 Download
                    </a>
                    <button
                      onClick={() => handleRunOCR(doc.id)}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
                    >
                      🔍 Run OCR
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* OCR Text Modal */}
      {showOCRModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">📝 Extracted Text (OCR)</h2>
              <button
                onClick={() => setShowOCRModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg">
                {ocrText || 'No text extracted'}
              </pre>
            </div>
            <div className="p-4 border-t">
              <button
                onClick={() => navigator.clipboard.writeText(ocrText)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                📋 Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LawyerDocumentVerification;
