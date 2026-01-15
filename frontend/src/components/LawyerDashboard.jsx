import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState('disputes'); // 'disputes', 'ai-insights', 'ai-search', 'doc-verification'
  const [showDocGenerator, setShowDocGenerator] = useState(false);
  const [verificationDisputeId, setVerificationDisputeId] = useState(null);
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
      const res = await fetch(API_ENDPOINTS.lawyer.disputes, {
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
      const res = await fetch(API_ENDPOINTS.lawyer.disputeById(id), {
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
      const res = await fetch(`${API_ENDPOINTS.lawyer.disputeById(selectedDispute._id)}/notes`, {
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
      const res = await fetch(`${API_ENDPOINTS.lawyer.disputeById(selectedDispute._id)}/status`, {
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

  const NavIcon = ({ name, className = "w-5 h-5" }) => {
    switch (name) {
      case 'scale':
        return (
          <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v18" />
            <path d="M6 7h12" />
            <path d="M6 7l-3 6a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3L6 7z" />
            <path d="M18 7l-3 6a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3l-3-6z" />
          </svg>
        );
      case 'search':
        return (
          <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
        );
      case 'list':
        return (
          <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 6h13" />
            <path d="M8 12h13" />
            <path d="M8 18h13" />
            <path d="M3 6h.01" />
            <path d="M3 12h.01" />
            <path d="M3 18h.01" />
          </svg>
        );
      case 'chart':
        return (
          <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" />
            <path d="M7 14v4" />
            <path d="M12 10v8" />
            <path d="M17 6v12" />
          </svg>
        );
      case 'check':
        return (
          <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        );
      case 'file':
        return (
          <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
          </svg>
        );
      case 'clock':
        return (
          <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v6l4 2" />
          </svg>
        );
      case 'gear':
        return (
          <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
            <path d="M19.4 15a7.9 7.9 0 0 0 .1-1l2-1.2-2-3.5-2.3.5a7.9 7.9 0 0 0-1.7-1L15 5h-6l-.5 2.8a7.9 7.9 0 0 0-1.7 1L4.5 8.3l-2 3.5 2 1.2a7.9 7.9 0 0 0 0 2l-2 1.2 2 3.5 2.3-.5a7.9 7.9 0 0 0 1.7 1L9 19h6l.5-2.8a7.9 7.9 0 0 0 1.7-1l2.3.5 2-3.5-2-1.2z" />
          </svg>
        );
      case 'logout':
        return (
          <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
        );
      case 'inbox':
        return (
          <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-6l-2 3h-4l-2-3H2" />
            <path d="M5 4h14l3 8v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8z" />
          </svg>
        );
      case 'note':
        return (
          <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16v16H4z" />
            <path d="M8 8h8" />
            <path d="M8 12h8" />
            <path d="M8 16h5" />
          </svg>
        );
      case 'plus':
        return (
          <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-slate-900">Loading disputes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Sidebar */}
      <div className="w-72 bg-[#0F172A] border-r border-slate-800 shadow-lg">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-800">
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
            <div className="w-16 h-16 rounded-xl bg-[#2563EB]/15 items-center justify-center text-[#2563EB] hidden">
              <NavIcon name="scale" className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <div className="text-lg font-bold text-white">
                Lawyer Panel
              </div>
              <div className="text-sm text-slate-300">
                {localStorage.getItem("userName") || "Legal Professional"}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs px-3 py-1 rounded-full bg-[#2563EB]/15 text-[#93C5FD] border border-[#2563EB]/20">
              Legal Professional
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-800">
          <div className="relative">
            <input
              type="text"
              placeholder="Search disputes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 rounded-lg border border-slate-700 bg-slate-900/30 text-white placeholder-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
            />
            <span className="absolute left-3 top-2.5 text-slate-400">
              <NavIcon name="search" className="w-5 h-5" />
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {/* AI Features Section */}
          <div className="text-xs font-semibold mb-2 text-slate-400 tracking-wide">AI FEATURES</div>
          
          <button
            onClick={() => { setVerificationDisputeId(null); setActiveView('disputes'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeView === 'disputes'
                ? "bg-[#2563EB] text-white"
                : "text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <NavIcon name="list" className="w-5 h-5" />
            <span className="font-medium">All Disputes</span>
          </button>
          
          <button
            onClick={() => { setVerificationDisputeId(null); setActiveView('ai-insights'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeView === 'ai-insights'
                ? "bg-[#2563EB] text-white"
                : "text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <NavIcon name="chart" className="w-5 h-5" />
            <span className="font-medium">AI Insights</span>
          </button>
          
          <button
            onClick={() => { setVerificationDisputeId(null); setActiveView('ai-search'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeView === 'ai-search'
                ? "bg-[#2563EB] text-white"
                : "text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <NavIcon name="search" className="w-5 h-5" />
            <span className="font-medium">Smart Search</span>
          </button>
          
          <button
            onClick={() => { setVerificationDisputeId(null); setActiveView('doc-verification'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeView === 'doc-verification'
                ? "bg-[#2563EB] text-white"
                : "text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <NavIcon name="check" className="w-5 h-5" />
            <span className="font-medium">Doc Verification</span>
          </button>
          
          <button
            onClick={() => setShowDocGenerator(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-slate-200 hover:bg-slate-800/60"
          >
            <NavIcon name="file" className="w-5 h-5" />
            <span className="font-medium">Doc Generator</span>
          </button>

          <div className="px-4 py-3 rounded-xl bg-slate-900/30 border border-slate-700 mb-4 mt-4">
            <div className="text-xs font-semibold mb-2 text-slate-400">Quick Stats</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center">
                <div className="text-xl font-bold text-white">{stats.total}</div>
                <div className="text-xs text-slate-400">Total</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">{stats.pending}</div>
                <div className="text-xs text-slate-400">Pending</div>
              </div>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-[#FCA5A5] hover:bg-[#DC2626]/10"
            >
              <NavIcon name="logout" className="w-5 h-5" />
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
            <LawyerDocumentVerification
              focusDisputeId={verificationDisputeId}
              onClearFocus={() => setVerificationDisputeId(null)}
            />
          </div>
        ) : (
        <div className="p-8 min-h-screen">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Dispute Management</h1>
            <p className="text-sm text-slate-600">Manage and review land disputes efficiently</p>
          </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Disputes",
              value: stats.total,
              iconName: "list",
              tone: "indigo"
            },
            {
              label: "Pending Review",
              value: stats.pending,
              iconName: "clock",
              tone: "amber"
            },
            {
              label: "In Progress",
              value: stats.inProgress,
              iconName: "gear",
              tone: "indigo"
            },
            {
              label: "Resolved",
              value: stats.resolved,
              iconName: "check",
              tone: "green"
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                  stat.tone === 'green'
                    ? 'bg-[#16A34A]/10 border-[#16A34A]/20 text-[#16A34A]'
                    : stat.tone === 'amber'
                    ? 'bg-[#F59E0B]/10 border-[#F59E0B]/20 text-[#F59E0B]'
                    : 'bg-[#2563EB]/10 border-[#2563EB]/20 text-[#2563EB]'
                }`}>
                  <NavIcon name={stat.iconName} className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Disputes List */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl p-6 border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">All Disputes</h2>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20">
                  {filteredDisputes.length}
                </span>
              </div>
              <div className="space-y-3 max-h-[700px] overflow-y-auto custom-scrollbar">
                {filteredDisputes.length === 0 ? (
                  <div className="text-center py-12 text-slate-600">
                    <div className="mx-auto w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 mb-3">
                      <NavIcon name="inbox" className="w-6 h-6" />
                    </div>
                    <p>No disputes found</p>
                  </div>
                ) : (
                  filteredDisputes.map((dispute) => (
                    <div
                      key={dispute._id}
                      onClick={() => handleViewDispute(dispute._id)}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        selectedDispute?._id === dispute._id
                          ? "bg-[#2563EB] text-white"
                          : "bg-slate-50 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className={`font-bold text-sm ${
                          selectedDispute?._id === dispute._id
                            ? "text-white"
                            : "text-slate-900"
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
                          : "text-slate-600"
                      }`}>
                        {dispute.user?.name || 'Unknown User'}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          selectedDispute?._id === dispute._id
                            ? "bg-white/15 text-white"
                            : (dispute.status === 'resolved')
                              ? "bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20"
                              : (dispute.status === 'in progress')
                                ? "bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20"
                                : "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20"
                        }`}>
                          {dispute.status || 'open'}
                        </span>
                        {dispute.lawyerNotes && dispute.lawyerNotes.length > 0 && (
                          <span className={`text-xs flex items-center gap-1 ${
                            selectedDispute?._id === dispute._id ? "text-white/70" : "text-slate-500"
                          }`}>
                            <NavIcon name="note" className="w-4 h-4" />
                            {dispute.lawyerNotes.length}
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
              <div className="rounded-2xl p-6 border border-slate-200 bg-white shadow-sm space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between pb-6 border-b border-slate-200">
                  <div>
                    <h2 className="text-3xl font-bold mb-2 text-slate-900">
                      {selectedDispute.title || 'Dispute Details'}
                    </h2>
                    <p className="text-sm text-slate-600">
                      Case ID: {selectedDispute._id?.slice(-8) || 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setVerificationDisputeId(selectedDispute._id);
                        setActiveView('doc-verification');
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm transition"
                    >
                      <NavIcon name="check" className="w-5 h-5" />
                      Verify Documents
                    </button>
                    <div className={`px-4 py-2 rounded-xl font-semibold border ${
                      selectedDispute.status === 'resolved'
                        ? "bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20"
                        : selectedDispute.status === 'in progress'
                        ? "bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20"
                        : "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
                    }`}>
                      {selectedDispute.status || 'open'}
                    </div>
                  </div>
                </div>

                {/* Status Update Section */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <h3 className="text-lg font-bold mb-4 text-slate-900">Update Status</h3>
                  <div className="flex gap-3">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl border-2 bg-white border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 font-semibold"
                    >
                      <option value="open">Open</option>
                      <option value="in progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                    <button
                      onClick={handleUpdateStatus}
                      className="px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-bold shadow-sm transition-all"
                    >
                      Update
                    </button>
                  </div>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="block text-xs font-semibold mb-2 text-slate-600">
                      Client Name
                    </label>
                    <p className="text-lg font-semibold text-slate-900">
                      {selectedDispute.user?.name || 'N/A'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="block text-xs font-semibold mb-2 text-slate-600">
                      Email
                    </label>
                    <p className="text-lg font-semibold text-slate-900">
                      {selectedDispute.user?.email || 'N/A'}
                    </p>
                  </div>
                  {selectedDispute.name && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <label className="block text-xs font-semibold mb-2 text-slate-600">
                        Land Owner Name
                      </label>
                      <p className="text-lg font-semibold text-slate-900">
                        {selectedDispute.name}
                      </p>
                    </div>
                  )}
                  {selectedDispute.landNumber && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <label className="block text-xs font-semibold mb-2 text-slate-600">
                        Land Number
                      </label>
                      <p className="text-lg font-semibold text-slate-900">
                        {selectedDispute.landNumber}
                      </p>
                    </div>
                  )}
                  {selectedDispute.khataNumber && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <label className="block text-xs font-semibold mb-2 text-slate-600">
                        Khata Number
                      </label>
                      <p className="text-lg font-semibold text-slate-900">
                        {selectedDispute.khataNumber}
                      </p>
                    </div>
                  )}
                  {selectedDispute.landArea && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <label className="block text-xs font-semibold mb-2 text-slate-600">
                        Land Area
                      </label>
                      <p className="text-lg font-semibold text-slate-900">
                        {selectedDispute.landArea} hectares
                      </p>
                    </div>
                  )}
                  {selectedDispute.mobileNumber && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <label className="block text-xs font-semibold mb-2 text-slate-600">
                        Mobile Number
                      </label>
                      <p className="text-lg font-semibold text-slate-900">
                        {selectedDispute.mobileNumber}
                      </p>
                    </div>
                  )}
                </div>

                {/* Description */}
                {selectedDispute.description && (
                  <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="block text-sm font-semibold mb-3 text-slate-700">
                      Description
                    </label>
                    <p className="leading-relaxed text-slate-700">
                      {selectedDispute.description}
                    </p>
                  </div>
                )}

                {/* Address */}
                {selectedDispute.address && (
                  <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="block text-sm font-semibold mb-3 text-slate-700">
                      Address
                    </label>
                    <p className="leading-relaxed text-slate-700">
                      {selectedDispute.address}
                    </p>
                  </div>
                )}

                {/* Lawyer Notes Section */}
                <div className="border-t pt-6 border-slate-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-9 h-9 rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB] flex items-center justify-center">
                        <NavIcon name="note" className="w-5 h-5" />
                      </span>
                      Lawyer Notes
                    </h3>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20">
                      {selectedDispute.lawyerNotes?.length || 0} notes
                    </span>
                  </div>
                  
                  <div className="space-y-4 mb-6 max-h-64 overflow-y-auto custom-scrollbar">
                    {selectedDispute.lawyerNotes && selectedDispute.lawyerNotes.length > 0 ? (
                      selectedDispute.lawyerNotes.map((noteItem, idx) => (
                        <div key={idx} className="group p-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 border-l-4 border-l-[#2563EB] transition-all">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-[#0F172A] flex items-center justify-center text-white text-sm font-bold">
                                {noteItem.lawyerName?.charAt(0) || 'L'}
                              </div>
                              <span className="font-semibold text-slate-900">
                                {noteItem.lawyerName || 'Lawyer'}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500">
                              {new Date(noteItem.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="mt-2 text-slate-700">
                            {noteItem.note}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-600">
                        <div className="mx-auto w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 mb-3">
                          <NavIcon name="note" className="w-6 h-6" />
                        </div>
                        <p>No notes yet. Add your first note below.</p>
                      </div>
                    )}
                  </div>

                  {/* Add Note Form */}
                  <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="block text-sm font-semibold mb-3 text-slate-700">
                      Add New Note
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Enter your professional note or observation here..."
                      className="w-full px-4 py-3 rounded-xl border-2 bg-white border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
                      rows="4"
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={!note.trim()}
                      className={`mt-4 w-full py-3 rounded-xl font-bold shadow-sm transition-all flex items-center justify-center gap-2 ${
                        note.trim()
                          ? "bg-[#16A34A] hover:bg-[#15803D] text-white"
                          : "bg-slate-200 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      <NavIcon name="plus" className="w-5 h-5" />
                      Add Note
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB] flex items-center justify-center mb-4">
                  <NavIcon name="scale" className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-slate-900">
                  Select a Dispute
                </h3>
                <p className="text-slate-600">
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
