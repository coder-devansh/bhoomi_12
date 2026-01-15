import { useEffect, useMemo, useState } from "react";
import { Link } from 'react-router-dom';
import API_BASE_URL, { API_ENDPOINTS } from '../config/api';

export default function Admin() {
  const [adminToken, setAdminToken] = useState("");
  const [disputes, setDisputes] = useState([]);
  const [showDisputes, setShowDisputes] = useState(false);
  const [activeTab, setActiveTab] = useState('lawyers');

  const [lawyers, setLawyers] = useState([]);
  const [lawyerSearch, setLawyerSearch] = useState('');
  const [loadingLawyers, setLoadingLawyers] = useState(false);
  const [issuedCreds, setIssuedCreds] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const resolveUploadsUrl = (maybeRelativeUrl) => {
    if (!maybeRelativeUrl) return null;
    if (maybeRelativeUrl.startsWith('http://') || maybeRelativeUrl.startsWith('https://')) return maybeRelativeUrl;
    if (maybeRelativeUrl.startsWith('/')) return `${API_BASE_URL}${maybeRelativeUrl}`;
    return `${API_BASE_URL}/${maybeRelativeUrl}`;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    if (token && role === 'admin') {
      setAdminToken(token);
      setShowDisputes(true);
      // Admin portal: prioritize lawyer verification first.
      fetchLawyers(token);
    }
  }, []);

  const role = useMemo(() => localStorage.getItem('userRole'), []);

  const fetchDisputes = async (token) => {
    try {
      const res = await fetch(API_ENDPOINTS.admin.disputes, {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setDisputes(data);
        setShowDisputes(true);
      } else {
        setMessage(data.message || "Failed to fetch disputes.");
        setMessageType("error");
      }
    } catch (err) {
      setMessage("Server error. Please try again later.");
      setMessageType("error");
    }
  };

  const fetchLawyers = async (token) => {
    setLoadingLawyers(true);
    try {
      const res = await fetch(API_ENDPOINTS.admin.lawyers, {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      if (res.ok && data && Array.isArray(data.lawyers)) {
        setLawyers(data.lawyers);
      } else {
        setMessage(data.message || 'Failed to fetch lawyers.');
        setMessageType('error');
      }
    } catch (err) {
      setMessage('Server error. Please try again later.');
      setMessageType('error');
    } finally {
      setLoadingLawyers(false);
    }
  };

  const updateLawyerStatus = async (lawyerId, status, rejectionReason = '', tempPassword = '') => {
    try {
      const res = await fetch(API_ENDPOINTS.admin.verifyLawyer(lawyerId), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + adminToken,
        },
        body: JSON.stringify({
          status,
          rejectionReason,
          ...(status === 'VERIFIED' && tempPassword ? { tempPassword } : {}),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (status === 'VERIFIED' && data.issuedPassword && data.lawyer?.email) {
          setIssuedCreds({ email: data.lawyer.email, password: data.issuedPassword });
        }
        fetchLawyers(adminToken);
      } else {
        alert(data.message || 'Failed to update lawyer status.');
      }
    } catch (err) {
      alert('Server error. Please try again later.');
    }
  };

  const filteredLawyers = useMemo(() => {
    const q = lawyerSearch.trim().toLowerCase();
    if (!q) return lawyers;
    return lawyers.filter((l) =>
      (l.name || '').toLowerCase().includes(q) ||
      (l.email || '').toLowerCase().includes(q) ||
      (l.verificationStatus || '').toLowerCase().includes(q) ||
      (l.barCouncilNumber || '').toLowerCase().includes(q)
    );
  }, [lawyers, lawyerSearch]);

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(
        API_ENDPOINTS.admin.disputeById(id),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + adminToken,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        fetchDisputes(adminToken);
      } else {
        alert(data.message || "Failed to update status.");
      }
    } catch (err) {
      alert("Server error. Please try again later.");
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen w-full flex flex-col items-center py-10">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-[#0F172A] tracking-tight">
          Admin Portal
        </h2>

        {!showDisputes && (
          <div className="mb-8 bg-slate-50 p-6 rounded-xl shadow border border-slate-200 text-center">
            <div className="text-lg font-extrabold text-[#0F172A]">Admin Login Required</div>
            <div className="text-sm text-slate-700 mt-1">
              Please login from the Admin Portal.
            </div>
            <div className="mt-4 flex items-center justify-center gap-3">
              <Link
                to="/admin/login"
                className="bg-[#2563EB] text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-[#1D4ED8] transition"
              >
                Go to Admin Login
              </Link>
              <Link
                to="/"
                className="px-6 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 font-semibold hover:bg-slate-100"
              >
                Home
              </Link>
            </div>
            {role && role !== 'admin' && (
              <div className="mt-3 text-sm text-red-700">
                You are currently logged in as <span className="font-bold">{role}</span>. Admin access required.
              </div>
            )}
          </div>
        )}

        {message && (
          <div
            className={`mb-4 text-center text-base font-semibold ${
              messageType === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        {showDisputes && (
          <div className="mt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setActiveTab('disputes'); fetchDisputes(adminToken); }}
                  className={
                    activeTab === 'disputes'
                      ? 'px-4 py-2 rounded-lg bg-[#0F172A] text-white font-semibold'
                      : 'px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 font-semibold hover:bg-slate-50'
                  }
                >
                  Disputes
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('lawyers'); fetchLawyers(adminToken); }}
                  className={
                    activeTab === 'lawyers'
                      ? 'px-4 py-2 rounded-lg bg-[#0F172A] text-white font-semibold'
                      : 'px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 font-semibold hover:bg-slate-50'
                  }
                >
                  Lawyer Verification
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('userRole');
                  localStorage.removeItem('userName');
                  setAdminToken('');
                  setShowDisputes(false);
                }}
                className="px-4 py-2 rounded-lg bg-white border border-red-200 text-red-700 font-semibold hover:bg-red-50"
              >
                Logout
              </button>
            </div>

            {issuedCreds && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="font-extrabold text-amber-900">Lawyer credentials issued</div>
                <div className="text-sm text-amber-900/80 mt-1">Share these securely with the lawyer.</div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-lg bg-white border border-amber-200 px-3 py-2">
                    <div className="text-xs text-slate-500">Email</div>
                    <div className="font-mono text-sm text-slate-900 break-all">{issuedCreds.email}</div>
                  </div>
                  <div className="rounded-lg bg-white border border-amber-200 px-3 py-2">
                    <div className="text-xs text-slate-500">Temporary Password</div>
                    <div className="font-mono text-sm text-slate-900 break-all">{issuedCreds.password}</div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="px-3 py-2 rounded-lg bg-amber-700 text-white font-bold hover:bg-amber-800"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(`Email: ${issuedCreds.email}\nPassword: ${issuedCreds.password}`);
                        alert('Copied');
                      } catch {
                        alert('Copy failed. Please copy manually.');
                      }
                    }}
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    className="px-3 py-2 rounded-lg bg-white border border-amber-200 text-amber-900 font-bold hover:bg-amber-100"
                    onClick={() => setIssuedCreds(null)}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'lawyers' && (
              <div className="mt-2">
                <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between mb-4">
                  <div className="font-bold text-[#0F172A]">Pending/Verified/Rejected Lawyers</div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <input
                      value={lawyerSearch}
                      onChange={(e) => setLawyerSearch(e.target.value)}
                      placeholder="Search by name, email, status..."
                      className="w-full md:w-80 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2563EB] bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => fetchLawyers(adminToken)}
                      className="px-4 py-2 rounded-lg bg-[#2563EB] text-white font-bold shadow hover:bg-[#1D4ED8] transition"
                    >
                      Refresh
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-lg">
                  <table className="min-w-full text-sm text-gray-800">
                    <thead className="bg-[#0F172A] text-white sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Bar Council</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Document</th>
                        <th className="px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loadingLawyers ? (
                        <tr>
                          <td colSpan="6" className="text-center py-6">Loading lawyers...</td>
                        </tr>
                      ) : filteredLawyers.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-6">No lawyers found.</td>
                        </tr>
                      ) : (
                        filteredLawyers.map((l, i) => (
                          <tr
                            key={l.id}
                            className={
                              i % 2 === 0
                                ? "bg-slate-50 hover:bg-slate-100"
                                : "bg-white hover:bg-slate-50"
                            }
                          >
                            <td className="px-4 py-2 font-semibold">{l.name || ''}</td>
                            <td className="px-4 py-2">{l.email || ''}</td>
                            <td className="px-4 py-2">{l.barCouncilNumber || ''}</td>
                            <td className="px-4 py-2">
                              <span className={
                                l.verificationStatus === 'VERIFIED'
                                  ? 'px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold'
                                  : l.verificationStatus === 'REJECTED'
                                    ? 'px-2 py-1 rounded-full bg-red-100 text-red-700 font-semibold'
                                    : 'px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-semibold'
                              }>
                                {l.verificationStatus}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              {l.verificationDocumentUrl ? (
                                <a
                                  href={resolveUploadsUrl(l.verificationDocumentUrl)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#2563EB] underline hover:text-[#1D4ED8]"
                                >
                                  View
                                </a>
                              ) : (
                                <span className="text-gray-400">None</span>
                              )}
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const suggested = '';
                                    const pw = window.prompt('Optional: set a password to issue (leave empty to auto-generate):', suggested);
                                    updateLawyerStatus(l.id, 'VERIFIED', '', (pw || '').trim());
                                  }}
                                  className="px-3 py-1 rounded-lg bg-[#16A34A] text-white font-bold hover:bg-[#15803D]"
                                  disabled={l.verificationStatus === 'VERIFIED'}
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const reason = window.prompt('Rejection reason (optional):', l.rejectionReason || '') || '';
                                    updateLawyerStatus(l.id, 'REJECTED', reason);
                                  }}
                                  className="px-3 py-1 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700"
                                  disabled={l.verificationStatus === 'REJECTED'}
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'disputes' && (
            <div className="overflow-x-auto rounded-xl border border-green-200 shadow-lg">
              <table className="min-w-full text-sm text-gray-800">
                <thead className="bg-green-600 text-white sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Land No.</th>
                    <th className="px-4 py-3">Khata No.</th>
                    <th className="px-4 py-3">Land Area</th>
                    <th className="px-4 py-3">Aadhaar</th>
                    <th className="px-4 py-3">Mobile</th>
                    <th className="px-4 py-3">Address</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Files</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-green-100">
                  {disputes.length === 0 ? (
                    <tr>
                      <td colSpan="14" className="text-center py-4">
                        No disputes found.
                      </td>
                    </tr>
                  ) : (
                    disputes.map((d, i) => (
                      <tr
                        key={d._id}
                        className={
                          i % 2 === 0
                            ? "bg-green-50 hover:bg-green-100"
                            : "bg-white hover:bg-green-50"
                        }
                      >
                        <td className="px-2 py-2 font-semibold">
                          {d.user?.name || ""}
                        </td>
                        <td className="px-2 py-2">{d.user?.email || ""}</td>
                        <td className="px-2 py-2">{d.title || ""}</td>
                        <td className="px-2 py-2">{d.name || ""}</td>
                        <td className="px-2 py-2">{d.landNumber || ""}</td>
                        <td className="px-2 py-2">{d.khataNumber || ""}</td>
                        <td className="px-2 py-2">{d.landArea || ""}</td>
                        <td className="px-2 py-2">{d.aadhaarNumber || ""}</td>
                        <td className="px-2 py-2">{d.mobileNumber || ""}</td>
                        <td className="px-2 py-2">{d.address || ""}</td>
                        <td className="px-2 py-2">{d.description || ""}</td>
                        <td className="px-2 py-2">
                          {Array.isArray(d.docs) && d.docs.length > 0 ? (
                            d.docs.map((file, idx) => (
                              <a
                                key={idx}
                                href={file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-700 underline hover:text-green-900 block"
                              >
                                File {idx + 1}
                              </a>
                            ))
                          ) : (
                            <span className="text-gray-400">No files</span>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          <select
                            value={d.status}
                            onChange={(e) =>
                              updateStatus(d._id, e.target.value)
                            }
                            className="border-2 border-green-400 rounded px-2 py-1 bg-white font-semibold"
                          >
                            <option value="open">Open</option>
                            <option value="in progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </td>
                        <td className="px-2 py-2">
                          <button
                            onClick={() => updateStatus(d._id, d.status)}
                            className="bg-gradient-to-r from-green-500 to-green-700 text-white px-3 py-1 rounded shadow hover:from-green-600 hover:to-green-800 transition"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
