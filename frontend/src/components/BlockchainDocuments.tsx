import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

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
  const navigate = useNavigate();
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
  const [activeTab, setActiveTab] = useState<'upload' | 'documents' | 'verify' | 'blockchain'>('documents');
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificate, setCertificate] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);

  const API_URL = `${API_BASE_URL}/api/documents`;

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
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
        alert('Document uploaded and secured on blockchain successfully!');
        setSelectedFile(null);
        setUploadForm({ documentType: 'other', description: '', visibility: 'private' });
        fetchDocuments();
        fetchBlockchainStats();
        setActiveTab('documents');
      } else if (response.status === 409) {
        alert('This document already exists in the system!');
      } else {
        alert('Failed to upload document. Please try again.');
      }
    } catch (error: any) {
      alert('Failed to upload document. Please try again.');
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

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", route: "/dashboard" },
    { id: "documents", label: "My Documents", tab: "documents" },
    { id: "upload", label: "Upload Document", tab: "upload" },
    { id: "verify", label: "Verify Document", tab: "verify" },
    { id: "blockchain", label: "Blockchain Explorer", tab: "blockchain" },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-green-50 to-orange-50">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-800 flex flex-col shadow-2xl">
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">BhoomiSetu</h1>
              <p className="text-xs text-green-400">Document Vault</p>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold shadow">
              U
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Welcome, User</p>
              <p className="text-xs text-blue-300">Land Owner</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.route) {
                  navigate(item.route);
                } else if (item.tab) {
                  setActiveTab(item.tab as any);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                (item.tab && activeTab === item.tab)
                  ? "bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg"
                  : "text-slate-200 hover:bg-slate-700/50"
              }`}
            >
              <span className="font-medium text-sm">{item.label}</span>
              {item.tab && activeTab === item.tab && (
                <div className="ml-auto w-2 h-2 rounded-full bg-white"></div>
              )}
            </button>
          ))}
        </nav>

        {/* Blockchain Status */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="p-4 rounded-lg bg-gradient-to-r from-blue-900/50 to-green-900/50 border border-blue-500/30">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${blockchainStats?.isValid ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
              <span className="text-xs font-medium text-blue-200">Chain Status</span>
            </div>
            <p className="text-base font-semibold text-white">
              {blockchainStats?.isValid ? 'Secure' : 'Syncing...'}
            </p>
            <p className="text-xs text-green-300 mt-1">
              {blockchainStats?.totalBlocks || 0} blocks verified
            </p>
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-slate-700/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-300 hover:bg-red-900/30 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-blue-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {activeTab === 'documents' && 'My Documents'}
              {activeTab === 'upload' && 'Upload Document'}
              {activeTab === 'verify' && 'Verify Document'}
              {activeTab === 'blockchain' && 'Blockchain Explorer'}
            </h1>
            <p className="text-sm text-blue-600 mt-1">
              {activeTab === 'documents' && 'All your blockchain-secured documents'}
              {activeTab === 'upload' && 'Secure your documents with SHA-256 hashing'}
              {activeTab === 'verify' && 'Check document authenticity on the blockchain'}
              {activeTab === 'blockchain' && 'Explore the blockchain ledger'}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{documents.length}</p>
                <p className="text-xs text-slate-500">Documents</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{blockchainStats?.totalBlocks || 0}</p>
                <p className="text-xs text-slate-500">Blocks</p>
              </div>
            </div>
            <button className="relative p-2 bg-orange-100 rounded-lg hover:bg-orange-200 transition-all">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">3</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Documents', value: documents.length, color: 'bg-blue-500' },
                  { label: 'Verified', value: documents.filter(d => d.blockchain?.isVerified).length, color: 'bg-green-500' },
                  { label: 'Pending', value: documents.filter(d => !d.blockchain?.isVerified).length, color: 'bg-orange-500' },
                  { label: 'Private', value: documents.filter(d => d.visibility === 'private').length, color: 'bg-slate-600' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-blue-100 hover:shadow-lg hover:border-blue-200 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                        <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Documents List */}
              <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
                <div className="p-6 border-b border-blue-100 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">Your Secured Documents</h2>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg font-medium hover:opacity-90 transition-all flex items-center gap-2 shadow"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Upload New
                  </button>
                </div>

                {loading ? (
                  <div className="p-12 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500">Loading your documents...</p>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="p-12 text-center">
                    <svg className="w-16 h-16 text-blue-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Documents Yet</h3>
                    <p className="text-gray-500 mb-6">Upload your first document to secure it on the blockchain</p>
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow"
                    >
                      Upload Your First Document
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-blue-50">
                    {documents.map((doc) => (
                      <div key={doc.id} className="p-5 hover:bg-blue-50/50 transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800">{doc.fileName}</h3>
                              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                <span>{documentTypes.find(t => t.value === doc.documentType)?.label || 'Document'}</span>
                                <span>•</span>
                                <span>{formatFileSize(doc.fileSize)}</span>
                                <span>•</span>
                                <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                              </div>
                              {doc.description && (
                                <p className="text-sm text-gray-500 mt-2">{doc.description}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              doc.blockchain?.isVerified
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {doc.blockchain?.isVerified ? 'Secured' : 'Pending'}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              {doc.visibility === 'private' ? 'Private' :
                               doc.visibility === 'dispute_parties' ? 'Parties' : 'Lawyers'}
                            </span>
                          </div>
                        </div>

                        {doc.blockchain?.isVerified && (
                          <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <span className="text-xs text-blue-600 font-medium">SHA-256 Hash</span>
                                <p className="font-mono text-xs text-gray-600 mt-1 truncate max-w-lg">
                                  {doc.blockchain.fileHash}
                                </p>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(doc.blockchain.fileHash);
                                    alert('Hash copied to clipboard!');
                                  }}
                                  className="px-3 py-2 text-sm bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all border border-gray-200"
                                >
                                  Copy
                                </button>
                                <button
                                  onClick={() => handleGetCertificate(doc.id)}
                                  className="px-3 py-2 text-sm bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all"
                                >
                                  Certificate
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
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
                <div className="p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-green-50">
                  <h2 className="text-lg font-semibold text-gray-800">Upload & Secure Document</h2>
                  <p className="text-gray-500 text-sm mt-1">Your document will be hashed and recorded on the blockchain</p>
                </div>

                <form onSubmit={handleUpload} className="p-6 space-y-6">
                  {/* Drop Zone */}
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all ${
                      dragActive
                        ? 'border-blue-400 bg-blue-50'
                        : selectedFile
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
                    }`}
                  >
                    {selectedFile ? (
                      <div className="space-y-3">
                        <svg className="w-12 h-12 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="font-semibold text-gray-800">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all text-sm"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <svg className="w-16 h-16 text-blue-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <div>
                          <p className="text-gray-700 font-medium">Drag & drop your document here</p>
                          <p className="text-gray-400 text-sm mt-1">or</p>
                        </div>
                        <label className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg cursor-pointer hover:opacity-90 transition-all font-medium shadow">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                    />
                  </div>

                  {/* Visibility */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Visibility</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'private', label: 'Private', desc: 'Only you' },
                        { value: 'dispute_parties', label: 'Parties', desc: 'Dispute parties' },
                        { value: 'lawyers', label: 'Lawyers', desc: 'Verified lawyers' }
                      ].map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setUploadForm({ ...uploadForm, visibility: opt.value })}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            uploadForm.visibility === opt.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <p className="font-medium text-gray-800">{opt.label}</p>
                          <p className="text-xs text-gray-500 mt-1">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Security Note */}
                  <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <div>
                        <p className="font-medium text-green-800">Blockchain Security</p>
                        <p className="text-sm text-green-700 mt-1">
                          Your document will be hashed using SHA-256 and permanently recorded on our blockchain ledger. Any modifications will be immediately detectable.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!selectedFile || uploading}
                    className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
                      !selectedFile || uploading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 via-green-500 to-blue-600 text-white hover:opacity-90 shadow-lg'
                    }`}
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Uploading & Securing...
                      </span>
                    ) : (
                      'Upload & Secure on Blockchain'
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Verify Tab */}
          {activeTab === 'verify' && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden">
                <div className="p-6 border-b border-green-100 bg-gradient-to-r from-green-50 to-emerald-50">
                  <h2 className="text-lg font-semibold text-gray-800">Verify Document Authenticity</h2>
                  <p className="text-gray-500 text-sm mt-1">Check if a document is registered and hasn't been tampered with</p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Verify Drop Zone */}
                  <div
                    className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${
                      verifyFile
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-300 hover:border-green-400 hover:bg-green-50/50'
                    }`}
                  >
                    {verifyFile ? (
                      <div className="space-y-3">
                        <svg className="w-12 h-12 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="font-semibold text-gray-800">{verifyFile.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(verifyFile.size)}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setVerifyFile(null);
                            setVerificationResult(null);
                          }}
                          className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all text-sm"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <svg className="w-16 h-16 text-green-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <p className="text-gray-700 font-medium">Select a document to verify</p>
                        <label className="inline-block px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg cursor-pointer hover:opacity-90 transition-all font-medium shadow">
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
                      className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
                        verifying
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90 shadow-lg'
                      }`}
                    >
                      {verifying ? (
                        <span className="flex items-center justify-center gap-3">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Verifying on Blockchain...
                        </span>
                      ) : (
                        'Verify Document'
                      )}
                    </button>
                  )}

                  {/* Verification Result */}
                  {verificationResult && (
                    <div className={`rounded-xl p-6 border-2 ${
                      verificationResult.verified
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start gap-4">
                        {verificationResult.verified ? (
                          <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        <div className="flex-1">
                          <h3 className={`text-xl font-semibold ${
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
                            <div className="mt-4 p-4 bg-white rounded-lg space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-500">File Name:</span>
                                <span className="font-medium text-gray-800">{verificationResult.document?.fileName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Document Type:</span>
                                <span className="font-medium text-gray-800">{verificationResult.document?.documentType}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Block Index:</span>
                                <span className="font-mono text-orange-600">{verificationResult.blockchain.blockIndex}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Registered:</span>
                                <span className="font-medium text-gray-800">
                                  {new Date(verificationResult.blockchain.registeredAt).toLocaleString()}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">File Hash:</span>
                                <p className="font-mono text-xs text-gray-600 break-all mt-1 p-2 bg-gray-100 rounded">{verificationResult.blockchain.fileHash}</p>
                              </div>
                            </div>
                          )}

                          {!verificationResult.verified && verificationResult.fileHash && (
                            <div className="mt-4 p-4 bg-white rounded-lg">
                              <span className="text-gray-500">Computed Hash:</span>
                              <p className="font-mono text-xs text-gray-600 break-all mt-1 p-2 bg-gray-100 rounded">{verificationResult.fileHash}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Blockchain Explorer Tab */}
          {activeTab === 'blockchain' && (
            <div className="space-y-6">
              {/* Blockchain Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Blocks', value: blockchainStats?.totalBlocks || 0, color: 'bg-blue-600' },
                  { label: 'Documents Secured', value: blockchainStats?.totalDocuments || 0, color: 'bg-green-600' },
                  { label: 'Chain Status', value: blockchainStats?.isValid ? 'Valid' : 'Invalid', color: 'bg-emerald-500' },
                  { label: 'Pending Txns', value: blockchainStats?.pendingTransactions || 0, color: 'bg-orange-500' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-blue-100 hover:shadow-lg hover:border-blue-200 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                        <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Latest Block Info */}
              <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Latest Block Information</h2>
                <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 via-green-50 to-orange-50 border border-blue-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-500 via-green-500 to-blue-600 flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Latest Block Hash</p>
                      <p className="font-mono text-sm text-gray-700 break-all">
                        {blockchainStats?.latestBlockHash || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="p-3 rounded-lg bg-white">
                      <p className="text-xs text-gray-500">Chain Integrity</p>
                      <p className="text-lg font-semibold text-green-600">
                        {blockchainStats?.isValid ? 'Verified' : 'Broken'}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-white">
                      <p className="text-xs text-gray-500">Security Level</p>
                      <p className="text-lg font-semibold text-blue-600">SHA-256</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* How it Works */}
              <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">How Blockchain Verification Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { step: '1', title: 'Upload', desc: 'Your document is uploaded securely to our servers', color: 'bg-blue-500' },
                    { step: '2', title: 'Hash', desc: 'SHA-256 creates a unique fingerprint of your document', color: 'bg-green-500' },
                    { step: '3', title: 'Record', desc: 'The hash is permanently stored on the blockchain', color: 'bg-orange-500' },
                  ].map((item, i) => (
                    <div key={i} className="text-center p-6 rounded-xl bg-gradient-to-b from-blue-50/50 to-green-50/50 border border-blue-100 hover:shadow-md transition-all">
                      <div className={`w-14 h-14 rounded-full ${item.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                        <span className="text-white font-bold text-lg">{item.step}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertificate && certificate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Blockchain Verification Certificate</h2>
                <button
                  onClick={() => setShowCertificate(false)}
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-all"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Certificate Header */}
              <div className="text-center pb-6 border-b border-gray-200">
                <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h3 className="text-2xl font-bold text-green-700">Document Authenticity Verified</h3>
                <p className="text-gray-500 mt-2">Certificate ID: {certificate.certificateId}</p>
              </div>

              {/* Document Info */}
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-3">Document Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Document ID:</span>
                    <span className="font-mono text-gray-800">{certificate.documentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">File Name:</span>
                    <span className="text-gray-800">{certificate.document?.fileName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type:</span>
                    <span className="text-gray-800">{certificate.document?.documentType}</span>
                  </div>
                </div>
              </div>

              {/* Blockchain Record */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200">
                <h4 className="font-semibold text-blue-700 mb-3">Blockchain Record</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-600">Block Index:</span>
                    <span className="font-mono text-gray-800">{certificate.blockchainRecord?.blockIndex}</span>
                  </div>
                  <div>
                    <span className="text-blue-600">Block Hash:</span>
                    <p className="font-mono text-xs text-gray-600 break-all mt-1 p-2 bg-white rounded">{certificate.blockchainRecord?.blockHash}</p>
                  </div>
                  <div>
                    <span className="text-blue-600">File Hash (SHA-256):</span>
                    <p className="font-mono text-xs text-gray-600 break-all mt-1 p-2 bg-white rounded">{certificate.fileHash}</p>
                  </div>
                </div>
              </div>

              {/* Verification Status */}
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <h4 className="font-semibold text-green-700 mb-3">Verification Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-600">Status:</span>
                    <span className="font-semibold text-green-700">
                      {certificate.verification?.isValid ? 'Valid' : 'Invalid'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Chain Integrity:</span>
                    <span className="font-semibold text-green-700">{certificate.verification?.chainIntegrity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Verified At:</span>
                    <span className="text-gray-800">{new Date(certificate.verification?.verifiedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-200">
                <p><strong className="text-gray-600">Issuer:</strong> {certificate.issuer}</p>
                <p className="mt-2">{certificate.disclaimer}</p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => window.print()}
                className="w-full py-3 bg-gradient-to-r from-blue-500 via-green-500 to-blue-600 text-white rounded-lg font-medium hover:opacity-90 transition-all shadow flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockchainDocuments;
