import { useState } from 'react';
import { API_ENDPOINTS } from '../config/api';

interface DocumentGeneratorProps {
  disputeData: {
    title?: string;
    description?: string;
    name?: string;
    landNumber?: string;
    khataNumber?: string;
    landArea?: string;
    address?: string;
    aadhaarNumber?: string;
  };
  onClose: () => void;
}

interface GeneratedDocument {
  documentType: string;
  content: string;
  generatedAt: string;
  disclaimer: string;
}

const documentTypes = [
  { id: 'partition_deed', name: 'Partition Deed', icon: '📜', description: 'Draft deed for dividing property among co-owners' },
  { id: 'legal_notice', name: 'Legal Notice', icon: '📨', description: 'Formal notice to opposing party' },
  { id: 'affidavit', name: 'Affidavit', icon: '✍️', description: 'Sworn statement document' },
  { id: 'settlement_agreement', name: 'Settlement Agreement', icon: '🤝', description: 'Mutual settlement documentation' },
  { id: 'boundary_agreement', name: 'Boundary Agreement', icon: '📍', description: 'Agreement for boundary disputes' }
];

export default function AIDocumentGenerator({ disputeData, onClose }: DocumentGeneratorProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [generatedDoc, setGeneratedDoc] = useState<GeneratedDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateDocument = async (docType: string) => {
    setSelectedType(docType);
    setLoading(true);
    setError('');
    setGeneratedDoc(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.ai.generateDocument, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          disputeData,
          documentType: docType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate document');
      }

      const data = await response.json();
      setGeneratedDoc(data.document);
    } catch (err) {
      setError('Unable to generate document. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadDocument = () => {
    if (!generatedDoc) return;
    
    const blob = new Blob([generatedDoc.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedDoc.documentType}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    if (!generatedDoc) return;
    navigator.clipboard.writeText(generatedDoc.content);
    alert('Document copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                📄
              </div>
              <div>
                <h2 className="text-xl font-bold">AI Document Generator</h2>
                <p className="text-sm text-white/80">Generate legal document drafts instantly</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Document Types Sidebar */}
          <div className="w-72 bg-gray-50 p-4 border-r border-gray-200 overflow-y-auto">
            <h3 className="font-semibold text-gray-700 mb-3">Select Document Type</h3>
            <div className="space-y-2">
              {documentTypes.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => generateDocument(doc.id)}
                  disabled={loading}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    selectedType === doc.id
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                      : 'bg-white hover:bg-gray-100 text-gray-700 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{doc.icon}</span>
                    <div>
                      <div className="font-medium text-sm">{doc.name}</div>
                      <div className={`text-xs ${selectedType === doc.id ? 'text-white/80' : 'text-gray-500'}`}>
                        {doc.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Document Preview */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {!selectedType && !loading && (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-6xl mb-4">👈</div>
                  <p>Select a document type to generate</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
                  <p className="mt-4 text-gray-600">Generating document...</p>
                  <p className="text-sm text-gray-400 mt-2">AI is drafting your document</p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-4">❌</div>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            )}

            {generatedDoc && !loading && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Document Actions */}
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {documentTypes.find(d => d.id === generatedDoc.documentType)?.name || 'Document'}
                    </h4>
                    <p className="text-xs text-gray-500">
                      Generated: {new Date(generatedDoc.generatedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      📋 Copy
                    </button>
                    <button
                      onClick={downloadDocument}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 flex items-center gap-2"
                    >
                      ⬇️ Download
                    </button>
                  </div>
                </div>

                {/* Document Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 bg-white p-6 rounded-xl border border-gray-200 shadow-inner">
                    {generatedDoc.content}
                  </pre>
                </div>

                {/* Disclaimer */}
                <div className="p-4 bg-amber-50 border-t border-amber-200">
                  <p className="text-xs text-amber-700 flex items-start gap-2">
                    <span>⚠️</span>
                    {generatedDoc.disclaimer}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
