import { useState, useEffect } from 'react';

interface Insights {
  totalDisputes: number;
  byStatus: {
    open: number;
    inProgress: number;
    resolved: number;
  };
  byType: {
    mutualPartition: number;
    familyPartition: number;
    boundaryDemarcation: number;
  };
  averageResolutionTime: string;
  trendAnalysis: {
    newDisputesLast30Days: number;
    trend: string;
    prediction: string;
  };
  recommendations: Array<{
    type: string;
    message: string;
    priority: string;
  }>;
}

interface PrioritizedDispute {
  _id: string;
  title: string;
  name: string;
  status: string;
  createdAt: string;
  priority: {
    score: number;
    priority: string;
    factors: {
      age: number;
      completeness: string;
      type: string;
    };
  };
}

export default function AIInsightsDashboard() {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [priorityQueue, setPriorityQueue] = useState<PrioritizedDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'insights' | 'priority'>('insights');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const [insightsRes, priorityRes] = await Promise.all([
        fetch('http://localhost:3000/api/ai/insights', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3000/api/ai/priority-queue', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (insightsRes.ok) {
        const data = await insightsRes.json();
        setInsights(data.insights);
      }

      if (priorityRes.ok) {
        const data = await priorityRes.json();
        setPriorityQueue(data.disputes || []);
      }
    } catch (err) {
      console.error('Failed to fetch AI data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      default: return '➡️';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading AI insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">
            🤖
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">AI Analytics Dashboard</h2>
            <p className="text-sm text-gray-500">Powered by BhoomiSetu AI</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 flex items-center gap-2"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'insights'
              ? 'bg-white text-indigo-600 shadow-md'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📊 Insights
        </button>
        <button
          onClick={() => setActiveTab('priority')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'priority'
              ? 'bg-white text-indigo-600 shadow-md'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📋 Priority Queue
        </button>
      </div>

      {activeTab === 'insights' && insights && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="text-3xl font-bold">{insights.totalDisputes}</div>
              <div className="text-blue-100 mt-1">Total Disputes</div>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-6 rounded-2xl text-white shadow-lg">
              <div className="text-3xl font-bold">{insights.byStatus.open}</div>
              <div className="text-orange-100 mt-1">Open Cases</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-indigo-500 p-6 rounded-2xl text-white shadow-lg">
              <div className="text-3xl font-bold">{insights.byStatus.inProgress}</div>
              <div className="text-purple-100 mt-1">In Progress</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-6 rounded-2xl text-white shadow-lg">
              <div className="text-3xl font-bold">{insights.byStatus.resolved}</div>
              <div className="text-green-100 mt-1">Resolved</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Distribution by Type */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Distribution by Type</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Mutual Partition</span>
                    <span className="font-medium">{insights.byType.mutualPartition}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                      style={{ width: `${(insights.byType.mutualPartition / insights.totalDisputes) * 100 || 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Family Partition</span>
                    <span className="font-medium">{insights.byType.familyPartition}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: `${(insights.byType.familyPartition / insights.totalDisputes) * 100 || 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Boundary Demarcation</span>
                    <span className="font-medium">{insights.byType.boundaryDemarcation}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-teal-500 rounded-full"
                      style={{ width: `${(insights.byType.boundaryDemarcation / insights.totalDisputes) * 100 || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trend Analysis */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Trend Analysis</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl">
                  <div>
                    <div className="text-2xl font-bold text-indigo-600">
                      {insights.trendAnalysis.newDisputesLast30Days}
                    </div>
                    <div className="text-sm text-gray-600">New disputes (30 days)</div>
                  </div>
                  <div className="text-4xl">{getTrendIcon(insights.trendAnalysis.trend)}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-sm text-gray-600">Trend Status</div>
                  <div className="font-medium text-gray-800 capitalize mt-1">
                    {insights.trendAnalysis.trend}
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl">
                  <div className="text-sm text-gray-600">AI Prediction</div>
                  <div className="text-sm text-purple-700 mt-1">
                    {insights.trendAnalysis.prediction}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {insights.recommendations.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">💡 AI Recommendations</h3>
              <div className="space-y-3">
                {insights.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border ${
                      rec.priority === 'high'
                        ? 'bg-red-50 border-red-200'
                        : rec.priority === 'medium'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {rec.priority === 'high' ? '🚨' : rec.priority === 'medium' ? '⚠️' : '💡'}
                      </span>
                      <div>
                        <div className={`text-sm font-medium ${
                          rec.priority === 'high' ? 'text-red-700' :
                          rec.priority === 'medium' ? 'text-yellow-700' : 'text-green-700'
                        }`}>
                          {rec.message}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 capitalize">
                          Type: {rec.type} • Priority: {rec.priority}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Average Resolution Time */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 rounded-2xl text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white/80 text-sm">Average Resolution Time</div>
                <div className="text-2xl font-bold mt-1">{insights.averageResolutionTime}</div>
              </div>
              <div className="text-5xl">⏱️</div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'priority' && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="font-bold text-gray-800">🎯 AI Priority Queue</h3>
            <p className="text-sm text-gray-500">Disputes sorted by AI-calculated priority score</p>
          </div>
          
          {priorityQueue.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <div className="text-4xl mb-4">📭</div>
              <p>No pending disputes in the queue</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {priorityQueue.map((dispute, idx) => (
                <div key={dispute._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                      #{idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-800">{dispute.title}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(dispute.priority.priority)}`}>
                          {dispute.priority.priority.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {dispute.name || 'N/A'} • Pending {dispute.priority.factors.age} days
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-indigo-600">{dispute.priority.score}</div>
                      <div className="text-xs text-gray-500">Priority Score</div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-4 text-xs text-gray-500">
                    <span>📋 {dispute.priority.factors.completeness} complete</span>
                    <span>📁 {dispute.priority.factors.type}</span>
                    <span>📅 Created: {new Date(dispute.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
