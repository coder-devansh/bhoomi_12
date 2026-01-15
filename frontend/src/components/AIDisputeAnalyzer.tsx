import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

interface AIAnalysis {
  riskLevel: {
    level: string;
    factors: string[];
  };
  estimatedResolutionTime: string;
  legalCategory: string;
  recommendedActions: string[];
  similarCasePrecedents: Array<{ case: string; outcome: string }>;
  successProbability: string;
  keyIssues: string[];
  requiredDocuments: string[];
}

interface DisputeAnalyzerProps {
  disputeData: {
    title: string;
    description: string;
    landNumber?: string;
    khataNumber?: string;
    landArea?: string;
    name?: string;
  };
  onClose: () => void;
}

export default function AIDisputeAnalyzer({ disputeData, onClose }: DisputeAnalyzerProps) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    analyzeDispute();
  }, [disputeData]);

  const analyzeDispute = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.ai.analyzeForm, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(disputeData)
      });

      if (!response.ok) {
        throw new Error('Failed to analyze dispute');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err) {
      setError('Unable to analyze dispute. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                🤖
              </div>
              <div>
                <h2 className="text-xl font-bold">AI Dispute Analysis</h2>
                <p className="text-sm text-white/80">Powered by BhoomiSetu AI</p>
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

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">AI is analyzing your dispute...</p>
              <p className="text-sm text-gray-400 mt-2">This usually takes a few seconds</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">❌</div>
              <p className="text-red-600">{error}</p>
              <button
                onClick={analyzeDispute}
                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Try Again
              </button>
            </div>
          ) : analysis && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-indigo-600">{analysis.successProbability}</div>
                  <div className="text-xs text-gray-600 mt-1">Success Rate</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl text-center">
                  <div className="text-lg font-bold text-purple-600">{analysis.estimatedResolutionTime}</div>
                  <div className="text-xs text-gray-600 mt-1">Est. Timeline</div>
                </div>
                <div className={`p-4 rounded-xl text-center ${getRiskColor(analysis.riskLevel.level)}`}>
                  <div className="text-lg font-bold capitalize">{analysis.riskLevel.level}</div>
                  <div className="text-xs mt-1">Risk Level</div>
                </div>
              </div>

              {/* Legal Category */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  ⚖️ Legal Category
                </h3>
                <p className="text-indigo-600 font-medium mt-2">{analysis.legalCategory}</p>
              </div>

              {/* Key Issues */}
              <div className="bg-amber-50 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  ⚠️ Key Issues Identified
                </h3>
                <ul className="mt-2 space-y-1">
                  {analysis.keyIssues.map((issue, idx) => (
                    <li key={idx} className="text-amber-700 flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Actions */}
              <div className="bg-green-50 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  ✅ Recommended Actions
                </h3>
                <ul className="mt-2 space-y-2">
                  {analysis.recommendedActions.map((action, idx) => (
                    <li key={idx} className="text-green-700 flex items-start gap-2">
                      <span className="bg-green-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0">
                        {idx + 1}
                      </span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Required Documents */}
              <div className="bg-blue-50 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  📄 Required Documents
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {analysis.requiredDocuments.map((doc, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                    >
                      {doc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Similar Cases */}
              {analysis.similarCasePrecedents.length > 0 && (
                <div className="bg-purple-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    📚 Similar Case Precedents
                  </h3>
                  <div className="mt-3 space-y-3">
                    {analysis.similarCasePrecedents.map((caseItem, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="font-medium text-purple-700">{caseItem.case}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Outcome: {caseItem.outcome}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk Factors */}
              {analysis.riskLevel.factors.length > 0 && (
                <div className="bg-red-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    🚨 Risk Factors
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {analysis.riskLevel.factors.map((factor, idx) => (
                      <li key={idx} className="text-red-700 flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Disclaimer */}
              <div className="bg-gray-100 p-4 rounded-xl text-center">
                <p className="text-xs text-gray-500">
                  ⚠️ This AI analysis is for informational purposes only and should not be considered legal advice.
                  Please consult with a qualified legal professional for specific guidance.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
