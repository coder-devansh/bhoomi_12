import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AIInsightsDashboard from './AIInsightsDashboard';
import AISmartSearch from './AISmartSearch';
import AIDocumentGenerator from './AIDocumentGenerator';
import LawyerDocumentVerification from './LawyerDocumentVerification';

export default function LawyerDashboard() {
  const [disputes, setDisputes] = useState([]);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState('disputes'); // 'disputes', 'ai-insights', 'ai-search', 'doc-verification'
  const [showDocGenerator, setShowDocGenerator] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token) {
      navigate('/login');
      return;
    }

    if (userRole !== 'lawyer' && userRole !== 'admin') {
      alert('Access denied. Lawyer access required.');
      navigate('/dashboard');
      return;
    }

    fetchDisputes();
  }, [navigate]);

  const fetchDisputes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/lawyer/disputes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setDisputes(data);
      } else {
        alert(data.message || 'Failed to fetch disputes.');
      }
    } catch (err) {
      alert('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDispute = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/lawyer/disputes/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedDispute(data);
        setStatus(data.status || '');
      } else {
        alert(data.message || 'Failed to fetch dispute details.');
      }
    } catch (err) {
      alert('Server error. Please try again later.');
    }
  };

  const handleAddNote = async () => {
    if (!note.trim() || !selectedDispute) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/lawyer/disputes/${selectedDispute._id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ note })
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedDispute(data);
        setNote('');
        alert('Note added successfully!');
      } else {
        alert(data.message || 'Failed to add note.');
      }
    } catch (err) {
      alert('Server error. Please try again later.');
    }
  };

  const handleUpdateStatus = async () => {
    if (!status || !selectedDispute) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/lawyer/disputes/${selectedDispute._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedDispute(data);
        setDisputes(disputes.map(d => d._id === data._id ? data : d));
        alert('Status updated successfully!');
      } else {
        alert(data.message || 'Failed to update status.');
      }
    } catch (err) {
      alert('Server error. Please try again later.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  // Filter disputes based on search
  const filteredDisputes = disputes.filter(dispute => 
    dispute.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dispute.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dispute.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const stats = {
    total: disputes.length,
    pending: disputes.filter(d => d.status === 'open' || d.status === 'pending').length,
    inProgress: disputes.filter(d => d.status === 'in progress').length,
    resolved: disputes.filter(d => d.status === 'resolved').length,
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
      }`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Loading disputes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${
      darkMode
        ? "bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900"
        : "bg-gray-50"
    }`}>
      {/* Sidebar */}
      <div className={`w-64 ${
        darkMode 
          ? "bg-slate-800 border-r border-slate-700" 
          : "bg-white border-r border-gray-200"
      } shadow-lg`}>
        {/* Sidebar Header */}
        <div className={`p-6 border-b ${
          darkMode ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-4 mb-4">
            <img 
              src="/image.jpeg" 
              alt="BhoomiSetu Logo" 
              className="w-16 h-16 rounded-xl shadow-md object-cover border-2 border-white/20"
              onError={(e) => { 
                e.target.style.display = 'none'; 
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
            <div className={`w-16 h-16 rounded-xl ${
              darkMode ? "bg-indigo-600" : "bg-indigo-100"
            } items-center justify-center text-2xl hidden`}>
              ⚖️
            </div>
            <div className="flex-1">
              <div className={`text-lg font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}>
                Lawyer Panel
              </div>
              <div className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}>
                {localStorage.getItem("userName") || "Legal Professional"}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-xs px-3 py-1 rounded-full ${
              darkMode 
                ? "bg-indigo-900/50 text-indigo-300" 
                : "bg-indigo-100 text-indigo-700"
            }`}>
              Legal Professional
            </span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${
                darkMode ? "hover:bg-slate-700" : "hover:bg-gray-100"
              } transition-colors`}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-700 dark:border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search disputes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-4 py-2 pl-10 rounded-lg border ${
                darkMode
                  ? "bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300"
              } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200`}
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {/* AI Features Section */}
          <div className={`text-xs font-semibold mb-2 ${
            darkMode ? "text-gray-400" : "text-gray-600"
          }`}>🤖 AI FEATURES</div>
          
          <button
            onClick={() => setActiveView('disputes')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeView === 'disputes'
                ? darkMode 
                  ? "bg-indigo-600 text-white" 
                  : "bg-indigo-100 text-indigo-700"
                : darkMode
                  ? "text-gray-300 hover:bg-slate-700"
                  : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="text-xl">📋</span>
            <span className="font-medium">All Disputes</span>
          </button>
          
          <button
            onClick={() => setActiveView('ai-insights')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeView === 'ai-insights'
                ? darkMode 
                  ? "bg-indigo-600 text-white" 
                  : "bg-indigo-100 text-indigo-700"
                : darkMode
                  ? "text-gray-300 hover:bg-slate-700"
                  : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="text-xl">📊</span>
            <span className="font-medium">AI Insights</span>
          </button>
          
          <button
            onClick={() => setActiveView('ai-search')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeView === 'ai-search'
                ? darkMode 
                  ? "bg-indigo-600 text-white" 
                  : "bg-indigo-100 text-indigo-700"
                : darkMode
                  ? "text-gray-300 hover:bg-slate-700"
                  : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="text-xl">🔍</span>
            <span className="font-medium">Smart Search</span>
          </button>
          
          <button
            onClick={() => setActiveView('doc-verification')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeView === 'doc-verification'
                ? darkMode 
                  ? "bg-indigo-600 text-white" 
                  : "bg-indigo-100 text-indigo-700"
                : darkMode
                  ? "text-gray-300 hover:bg-slate-700"
                  : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="text-xl">✅</span>
            <span className="font-medium">Doc Verification</span>
          </button>
          
          <button
            onClick={() => setShowDocGenerator(true)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              darkMode
                ? "text-gray-300 hover:bg-slate-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="text-xl">📄</span>
            <span className="font-medium">Doc Generator</span>
          </button>

          <div className={`px-4 py-2 rounded-lg ${
            darkMode ? "bg-slate-700" : "bg-gray-100"
          } mb-4 mt-4`}>
            <div className={`text-xs font-semibold mb-2 ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}>Quick Stats</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center">
                <div className={`text-xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}>{stats.total}</div>
                <div className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}>Total</div>
              </div>
              <div className="text-center">
                <div className={`text-xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}>{stats.pending}</div>
                <div className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}>Pending</div>
              </div>
            </div>
          </div>
          <div className={`pt-4 mt-4 border-t ${
            darkMode ? "border-slate-700" : "border-gray-200"
          }`}>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                darkMode
                  ? "text-red-400 hover:bg-red-900/30"
                  : "text-red-600 hover:bg-red-50"
              }`}
            >
              <span className="text-xl">🚪</span>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Document Generator Modal */}
      {showDocGenerator && (
        <AIDocumentGenerator
          disputeData={selectedDispute || {}}
          onClose={() => setShowDocGenerator(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {activeView === 'ai-insights' ? (
          <div className="p-8">
            <AIInsightsDashboard />
          </div>
        ) : activeView === 'ai-search' ? (
          <div className="p-8">
            <AISmartSearch />
          </div>
        ) : activeView === 'doc-verification' ? (
          <div className="p-8">
            <LawyerDocumentVerification />
          </div>
        ) : (
        <div className={`p-8 ${
          darkMode ? "bg-slate-900" : "bg-gray-50"
        } min-h-screen`}>
          {/* Header */}
          <div className={`mb-8 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}>
            <h1 className="text-3xl font-bold mb-2">
              Dispute Management
            </h1>
            <p className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}>
              Manage and review land disputes efficiently
            </p>
          </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Disputes",
              value: stats.total,
              icon: "📋",
              color: darkMode ? "bg-blue-900/30 border-blue-700" : "bg-blue-50 border-blue-200"
            },
            {
              label: "Pending Review",
              value: stats.pending,
              icon: "⏳",
              color: darkMode ? "bg-yellow-900/30 border-yellow-700" : "bg-yellow-50 border-yellow-200"
            },
            {
              label: "In Progress",
              value: stats.inProgress,
              icon: "⚙️",
              color: darkMode ? "bg-indigo-900/30 border-indigo-700" : "bg-indigo-50 border-indigo-200"
            },
            {
              label: "Resolved",
              value: stats.resolved,
              icon: "✅",
              color: darkMode ? "bg-green-900/30 border-green-700" : "bg-green-50 border-green-200"
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`rounded-xl p-6 border ${stat.color} ${
                darkMode ? "shadow-lg" : "shadow-md"
              }`}
            >
              <div className={`text-3xl mb-4 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}>
                {stat.icon}
              </div>
              <div className={`text-3xl font-bold mb-1 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}>
                {stat.value}
              </div>
              <div className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Disputes List */}
          <div className="lg:col-span-1">
            <div className={`rounded-xl p-6 border ${
              darkMode 
                ? "bg-slate-800 border-slate-700" 
                : "bg-white border-gray-200"
            } shadow-md`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}>
                  All Disputes
                </h2>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  darkMode 
                    ? "bg-indigo-900/50 text-indigo-300" 
                    : "bg-indigo-100 text-indigo-700"
                }`}>
                  {filteredDisputes.length}
                </span>
              </div>
              <div className="space-y-3 max-h-[700px] overflow-y-auto custom-scrollbar">
                {filteredDisputes.length === 0 ? (
                  <div className={`text-center py-12 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}>
                    <div className="text-4xl mb-2">📭</div>
                    <p>No disputes found</p>
                  </div>
                ) : (
                  filteredDisputes.map((dispute) => (
                    <div
                      key={dispute._id}
                      onClick={() => handleViewDispute(dispute._id)}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        selectedDispute?._id === dispute._id
                          ? darkMode
                            ? "bg-indigo-600 text-white"
                            : "bg-indigo-600 text-white"
                          : darkMode
                          ? "bg-slate-700 hover:bg-slate-600 border border-slate-600"
                          : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className={`font-bold text-sm ${
                          selectedDispute?._id === dispute._id
                            ? "text-white"
                            : darkMode ? "text-white" : "text-gray-800"
                        }`}>
                          {dispute.title || 'Untitled Dispute'}
                        </h3>
                        {selectedDispute?._id === dispute._id && (
                          <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Active</span>
                        )}
                      </div>
                      <p className={`text-xs mb-3 ${
                        selectedDispute?._id === dispute._id
                          ? "text-white/80"
                          : darkMode ? "text-gray-400" : "text-gray-600"
                      }`}>
                        {dispute.user?.name || 'Unknown User'}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          dispute.status === 'resolved'
                            ? selectedDispute?._id === dispute._id
                              ? "bg-green-500/30 text-white"
                              : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : dispute.status === 'in progress'
                            ? selectedDispute?._id === dispute._id
                              ? "bg-yellow-500/30 text-white"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : selectedDispute?._id === dispute._id
                            ? "bg-blue-500/30 text-white"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}>
                          {dispute.status || 'open'}
                        </span>
                        {dispute.lawyerNotes && dispute.lawyerNotes.length > 0 && (
                          <span className={`text-xs ${
                            selectedDispute?._id === dispute._id
                              ? "text-white/60"
                              : darkMode ? "text-gray-500" : "text-gray-500"
                          }`}>
                            📝 {dispute.lawyerNotes.length}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Dispute Details */}
          <div className="lg:col-span-2">
            {selectedDispute ? (
              <div className={`rounded-xl p-6 border ${
                darkMode 
                  ? "bg-slate-800 border-slate-700" 
                  : "bg-white border-gray-200"
              } shadow-md space-y-6`}>
                {/* Header */}
                <div className="flex items-start justify-between pb-6 border-b border-gray-700/30 dark:border-gray-700/30">
                  <div>
                    <h2 className={`text-3xl font-bold mb-2 ${
                      darkMode ? "text-white" : "text-gray-800"
                    }`}>
                      {selectedDispute.title || 'Dispute Details'}
                    </h2>
                    <p className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}>
                      Case ID: {selectedDispute._id?.slice(-8) || 'N/A'}
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded-xl font-semibold ${
                    selectedDispute.status === 'resolved'
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : selectedDispute.status === 'in progress'
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                  }`}>
                    {selectedDispute.status || 'open'}
                  </div>
                </div>

                {/* Status Update Section */}
                <div className={`${
                  darkMode ? "bg-gray-800/50" : "bg-gradient-to-r from-indigo-50 to-purple-50"
                } rounded-2xl p-6`}>
                  <h3 className={`text-lg font-bold mb-4 ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}>
                    Update Status
                  </h3>
                  <div className="flex gap-3">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className={`flex-1 px-4 py-3 rounded-xl border-2 ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300"
                      } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 font-semibold`}
                    >
                      <option value="open">Open</option>
                      <option value="in progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                    <button
                      onClick={handleUpdateStatus}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    >
                      Update
                    </button>
                  </div>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`p-4 rounded-xl ${
                    darkMode ? "bg-gray-800/50" : "bg-gray-50"
                  }`}>
                    <label className={`block text-xs font-semibold mb-2 ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}>
                      Client Name
                    </label>
                    <p className={`text-lg font-semibold ${
                      darkMode ? "text-white" : "text-gray-800"
                    }`}>
                      {selectedDispute.user?.name || 'N/A'}
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl ${
                    darkMode ? "bg-gray-800/50" : "bg-gray-50"
                  }`}>
                    <label className={`block text-xs font-semibold mb-2 ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}>
                      Email
                    </label>
                    <p className={`text-lg font-semibold ${
                      darkMode ? "text-white" : "text-gray-800"
                    }`}>
                      {selectedDispute.user?.email || 'N/A'}
                    </p>
                  </div>
                  {selectedDispute.name && (
                    <div className={`p-4 rounded-xl ${
                      darkMode ? "bg-gray-800/50" : "bg-gray-50"
                    }`}>
                      <label className={`block text-xs font-semibold mb-2 ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}>
                        Land Owner Name
                      </label>
                      <p className={`text-lg font-semibold ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}>
                        {selectedDispute.name}
                      </p>
                    </div>
                  )}
                  {selectedDispute.landNumber && (
                    <div className={`p-4 rounded-xl ${
                      darkMode ? "bg-gray-800/50" : "bg-gray-50"
                    }`}>
                      <label className={`block text-xs font-semibold mb-2 ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}>
                        Land Number
                      </label>
                      <p className={`text-lg font-semibold ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}>
                        {selectedDispute.landNumber}
                      </p>
                    </div>
                  )}
                  {selectedDispute.khataNumber && (
                    <div className={`p-4 rounded-xl ${
                      darkMode ? "bg-gray-800/50" : "bg-gray-50"
                    }`}>
                      <label className={`block text-xs font-semibold mb-2 ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}>
                        Khata Number
                      </label>
                      <p className={`text-lg font-semibold ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}>
                        {selectedDispute.khataNumber}
                      </p>
                    </div>
                  )}
                  {selectedDispute.landArea && (
                    <div className={`p-4 rounded-xl ${
                      darkMode ? "bg-gray-800/50" : "bg-gray-50"
                    }`}>
                      <label className={`block text-xs font-semibold mb-2 ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}>
                        Land Area
                      </label>
                      <p className={`text-lg font-semibold ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}>
                        {selectedDispute.landArea} hectares
                      </p>
                    </div>
                  )}
                  {selectedDispute.mobileNumber && (
                    <div className={`p-4 rounded-xl ${
                      darkMode ? "bg-gray-800/50" : "bg-gray-50"
                    }`}>
                      <label className={`block text-xs font-semibold mb-2 ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}>
                        Mobile Number
                      </label>
                      <p className={`text-lg font-semibold ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}>
                        {selectedDispute.mobileNumber}
                      </p>
                    </div>
                  )}
                </div>

                {/* Description */}
                {selectedDispute.description && (
                  <div className={`p-6 rounded-xl ${
                    darkMode ? "bg-gray-800/50" : "bg-gray-50"
                  }`}>
                    <label className={`block text-sm font-semibold mb-3 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}>
                      Description
                    </label>
                    <p className={`leading-relaxed ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}>
                      {selectedDispute.description}
                    </p>
                  </div>
                )}

                {/* Address */}
                {selectedDispute.address && (
                  <div className={`p-6 rounded-xl ${
                    darkMode ? "bg-gray-800/50" : "bg-gray-50"
                  }`}>
                    <label className={`block text-sm font-semibold mb-3 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}>
                      Address
                    </label>
                    <p className={`leading-relaxed ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}>
                      {selectedDispute.address}
                    </p>
                  </div>
                )}

                {/* Lawyer Notes Section */}
                <div className={`border-t pt-6 ${
                  darkMode ? "border-gray-700/50" : "border-gray-200"
                }`}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-xl font-bold ${
                      darkMode ? "text-white" : "text-gray-800"
                    }`}>
                      📝 Lawyer Notes
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      darkMode 
                        ? "bg-indigo-900/50 text-indigo-300" 
                        : "bg-indigo-100 text-indigo-700"
                    }`}>
                      {selectedDispute.lawyerNotes?.length || 0} notes
                    </span>
                  </div>
                  
                  <div className="space-y-4 mb-6 max-h-64 overflow-y-auto custom-scrollbar">
                    {selectedDispute.lawyerNotes && selectedDispute.lawyerNotes.length > 0 ? (
                      selectedDispute.lawyerNotes.map((noteItem, idx) => (
                        <div key={idx} className={`group p-4 rounded-xl ${
                          darkMode ? "bg-gray-800/50 hover:bg-gray-800" : "bg-white hover:bg-gray-50"
                        } border-l-4 border-indigo-500 transition-all`}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                {noteItem.lawyerName?.charAt(0) || 'L'}
                              </div>
                              <span className={`font-semibold ${
                                darkMode ? "text-white" : "text-gray-800"
                              }`}>
                                {noteItem.lawyerName || 'Lawyer'}
                              </span>
                            </div>
                            <span className={`text-xs ${
                              darkMode ? "text-gray-500" : "text-gray-500"
                            }`}>
                              {new Date(noteItem.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className={`mt-2 ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}>
                            {noteItem.note}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className={`text-center py-8 ${
                        darkMode ? "text-gray-500" : "text-gray-500"
                      }`}>
                        <div className="text-3xl mb-2">📝</div>
                        <p>No notes yet. Add your first note below.</p>
                      </div>
                    )}
                  </div>

                  {/* Add Note Form */}
                  <div className={`p-6 rounded-xl ${
                    darkMode ? "bg-gray-800/50" : "bg-gradient-to-r from-indigo-50 to-purple-50"
                  }`}>
                    <label className={`block text-sm font-semibold mb-3 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}>
                      Add New Note
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Enter your professional note or observation here..."
                      className={`w-full px-4 py-3 rounded-xl border-2 ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                          : "bg-white border-gray-300"
                      } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all`}
                      rows="4"
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={!note.trim()}
                      className={`mt-4 w-full py-3 rounded-xl font-bold shadow-lg transition-all transform hover:scale-105 ${
                        note.trim()
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-xl"
                          : darkMode
                          ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      ➕ Add Note
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`${
                darkMode 
                  ? "bg-gray-900/60 backdrop-blur-xl border border-gray-700/50" 
                  : "bg-white/80 backdrop-blur-xl border border-white/50"
              } rounded-3xl p-12 shadow-xl text-center`}>
                <div className="text-6xl mb-4">⚖️</div>
                <h3 className={`text-2xl font-bold mb-2 ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}>
                  Select a Dispute
                </h3>
                <p className={`${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}>
                  Choose a dispute from the list to view details and add notes
                </p>
              </div>
            )}
          </div>
        </div>
        </div>
        )}
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </div>
  );
}
