import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from '../config/api';
import AIDisputeAnalyzer from "./AIDisputeAnalyzer";
import DocumentUploadForDispute from "./DocumentUploadForDispute.jsx";

export default function Dashboard() {
  const [activePage, setActivePage] = useState("dashboard");
  const navigate = useNavigate();
  const [showAIAnalyzer, setShowAIAnalyzer] = useState(false);
  const [analyzeData, setAnalyzeData] = useState(null);

  const [feedbackRating, setFeedbackRating] = useState(4);

  // User disputes fetched from backend
  const [userDisputes, setUserDisputes] = useState([]);
  const [loadingDisputes, setLoadingDisputes] = useState(false);

  // Document uploads state
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    name: "",
    landNumber: "",
    khataNumber: "",
    landArea: "",
    aadhaarNumber: "",
    mobileNumber: "",
    address: "",
    description: "",
  });

  // Fetch user disputes from backend
  const fetchUserDisputes = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoadingDisputes(true);
    try {
      const res = await fetch(API_ENDPOINTS.disputes.base, {
        headers: { Authorization: "Bearer " + token },
      });
      if (res.ok) {
        const data = await res.json();
        setUserDisputes(data);
      }
    } catch (err) {
      console.error("Failed to fetch disputes", err);
    } finally {
      setLoadingDisputes(false);
    }
  };

  useEffect(() => {
    fetchUserDisputes();
  }, []);

  // Compute stats from real data
  const stats = {
    total: userDisputes.length,
    approved: userDisputes.filter((d) => d.status === "resolved").length,
    pending: userDisputes.filter((d) => d.status === "open").length,
    inProcess: userDisputes.filter((d) => d.status === "in progress").length,
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // AI Analysis before submission
  const handleAIAnalyze = (formType) => {
    setAnalyzeData({ ...formData, title: formType });
    setShowAIAnalyzer(true);
  };

  const handleFormSubmit = async (e, formType) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to submit a dispute.");
      navigate("/login");
      return;
    }

    // Map activePage to disputeType for backend
    const disputeTypeMap = {
      "mutual-partition": "mutual-partition",
      "family-partition": "family-partition",
      "boundary-demarcation": "boundary-demarcation"
    };

    setIsSubmitting(true);
    try {
      const res = await fetch(API_ENDPOINTS.disputes.base, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ 
          ...formData, 
          title: formType, 
          disputeType: disputeTypeMap[activePage] || "other",
          docs: [], 
          documents: uploadedDocuments.map(doc => ({
            documentId: doc.documentId,
            fileName: doc.fileName,
            fileHash: doc.blockchain?.fileHash,
            ocrExtraction: doc.ocrExtraction,
            verification: {
              status: doc.ocrExtraction ? 'ocr-processed' : 'pending',
              ocrVerified: !!doc.ocrExtraction,
              lawyerVerified: false
            }
          }))
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Request submitted successfully. Documents will be reviewed by a lawyer.");
        setActivePage("status");
        setFormData({
          title: "",
          name: "",
          landNumber: "",
          khataNumber: "",
          landArea: "",
          aadhaarNumber: "",
          mobileNumber: "",
          address: "",
          description: "",
        });
        setUploadedDocuments([]);
        // Refresh disputes list
        fetchUserDisputes();
      } else {
        alert(data.message || "Submission failed.");
      }
    } catch (err) {
      alert("Server error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const NavIcon = ({ name, className = "w-5 h-5" }) => {
    const common = { className, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" };
    switch (name) {
      case "dashboard":
        return (
          <svg {...common}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m0-8H5a2 2 0 00-2 2v6m8-8h8a2 2 0 012 2v6m-10 0h4" />
          </svg>
        );
      case "mutual":
        return (
          <svg {...common}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-4-4h-1m-4 6H2v-2a4 4 0 014-4h7m4-6a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case "family":
        return (
          <svg {...common}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V10.5z" />
          </svg>
        );
      case "boundary":
        return (
          <svg {...common}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21s-6-4.35-6-10a6 6 0 1112 0c0 5.65-6 10-6 10z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        );
      case "documents":
        return (
          <svg {...common}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 13a5 5 0 007.07 0l1.41-1.41a5 5 0 00-7.07-7.07L10 4.93" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 11a5 5 0 00-7.07 0L5.52 12.41a5 5 0 007.07 7.07L14 19.07" />
          </svg>
        );
      case "profile":
        return (
          <svg {...common}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 14a4 4 0 10-8 0" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 20a8 8 0 0116 0" />
          </svg>
        );
      case "status":
        return (
          <svg {...common}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m-6-8h6M7 3h10a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
          </svg>
        );
      case "settings":
        return (
          <svg {...common}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317a1 1 0 011.35-.936l1.02.38a1 1 0 00.933-.127l.91-.63a1 1 0 011.54.84v1.09a1 1 0 00.294.707l.72.72a1 1 0 00.707.293h1.09a1 1 0 01.84 1.54l-.63.91a1 1 0 00-.127.933l.38 1.02a1 1 0 01-.936 1.35H19a1 1 0 00-.707.293l-.72.72a1 1 0 00-.294.707V19a1 1 0 01-1.54.84l-.91-.63a1 1 0 00-.933-.127l-1.02.38a1 1 0 01-1.35-.936V19a1 1 0 00-.293-.707l-.72-.72A1 1 0 009 17H7.91a1 1 0 01-.84-1.54l.63-.91a1 1 0 00.127-.933l-.38-1.02a1 1 0 01.936-1.35H9a1 1 0 00.707-.293l.72-.72A1 1 0 0010.325 8V6.91a1 1 0 01.936-1.35z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15a3 3 0 110-6 3 3 0 010 6z" />
          </svg>
        );
      case "feedback":
        return (
          <svg {...common}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h8m-8 4h5m-7 7l-2 0a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v9a2 2 0 01-2 2H9l-3 4z" />
          </svg>
        );
      case "logout":
        return (
          <svg {...common}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        );
      case "bell":
        return (
          <svg {...common}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
      case "file":
        return (
          <svg {...common}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 3h7l5 5v13a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3v5h5" />
          </svg>
        );
      case "clock":
        return (
          <svg {...common}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v5l3 2" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "sparkles":
        return (
          <svg {...common}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3zm10 6l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3zm-5 8l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
          </svg>
        );
      case "inbox":
        return (
          <svg {...common}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V5a2 2 0 00-2-2H6a2 2 0 00-2 2v8m16 0l-2 8H6l-2-8m16 0h-5l-1 2h-4l-1-2H4" />
          </svg>
        );
      case "star":
        return (
          <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 17.27l5.18 3.13-1.39-5.97L20.5 10.3l-6.11-.52L12 4.2 9.61 9.78 3.5 10.3l4.71 4.13-1.39 5.97L12 17.27z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getDisputeIconName = (title = "") => {
    if (title.includes("Mutual")) return "mutual";
    if (title.includes("Family")) return "family";
    return "boundary";
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <div className="w-72 bg-slate-900 flex flex-col border-r border-slate-800">
        {/* Profile Section */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-semibold">BS</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">BhoomiSetu</h3>
              <p className="text-xs text-slate-300">User Dashboard</p>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-xl bg-slate-800/60 p-3">
            <div className="h-11 w-11 rounded-full bg-slate-700 flex items-center justify-center text-slate-200">
              <NavIcon name="profile" className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{localStorage.getItem("userName") || "User"}</p>
              <p className="text-xs text-slate-300">Land Owner</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: "dashboard", icon: "dashboard", label: "Dashboard" },
            { id: "mutual-partition", icon: "mutual", label: "Mutual Partition" },
            { id: "family-partition", icon: "family", label: "Family Partition" },
            { id: "boundary-demarcation", icon: "boundary", label: "Boundary Demarcation" },
            { id: "documents", icon: "documents", label: "Blockchain Documents", route: "/documents" },
            { id: "profile", icon: "profile", label: "User Profile" },
            { id: "status", icon: "status", label: "Status" },
            { id: "settings", icon: "settings", label: "Settings" },
            { id: "feedback", icon: "feedback", label: "Feedback" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.route) {
                  navigate(item.route);
                } else {
                  setActivePage(item.id);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left border ${
                activePage === item.id
                  ? "bg-indigo-600 text-white border-indigo-500 shadow"
                  : "text-slate-200 border-transparent hover:bg-slate-800 hover:border-slate-700"
              }`}
            >
              <span className="shrink-0 text-slate-200">
                <NavIcon name={item.icon} />
              </span>
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-200 hover:bg-red-950/40 transition-all"
          >
            <span className="shrink-0">
              <NavIcon name="logout" />
            </span>
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="bg-white/90 backdrop-blur px-8 py-4 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-3">
            <img 
              src="/image.jpeg" 
              alt="BhoomiSetu Logo" 
              className="h-10 w-10 rounded-lg shadow-sm object-cover border border-slate-200"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">BhoomiSetu</h1>
              <p className="text-xs text-slate-500">Land dispute applications and document workflow</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition" aria-label="Notifications">
              <span className="text-slate-700">
                <NavIcon name="bell" className="w-6 h-6" />
              </span>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full text-[11px] text-white flex items-center justify-center font-bold">3</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Dashboard Content */}
          {activePage === "dashboard" && (
            <div className="space-y-8 animate-fadeIn">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Total Applications", value: stats.total, tone: "indigo", icon: "file" },
                  { label: "Approved", value: stats.approved, tone: "green", icon: "status" },
                  { label: "Pending", value: stats.pending, tone: "amber", icon: "clock" },
                  { label: "In Process", value: stats.inProcess, tone: "slate", icon: "settings" },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                        <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                      </div>
                      <div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-sm ${
                          stat.tone === "indigo"
                            ? "bg-indigo-600"
                            : stat.tone === "green"
                            ? "bg-green-600"
                            : stat.tone === "amber"
                            ? "bg-amber-500"
                            : "bg-slate-700"
                        }`}
                      >
                        <NavIcon name={stat.icon} className="w-7 h-7" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Service Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title: "Mutual Partition",
                    desc: "Request partition by mutual agreement between all parties involved. Fast-track process for amicable settlements.",
                    icon: "mutual",
                    tone: "indigo",
                    page: "mutual-partition",
                  },
                  {
                    title: "Family Partition",
                    desc: "Submit a family-based partition request. Specialized process for ancestral property division among family members.",
                    icon: "family",
                    tone: "green",
                    page: "family-partition",
                  },
                  {
                    title: "Boundary Demarcation",
                    desc: "Request official demarcation of land boundaries to resolve disputes over property lines.",
                    icon: "boundary",
                    tone: "amber",
                    page: "boundary-demarcation",
                  },
                  {
                    title: "Blockchain Documents",
                    desc: "Securely upload and verify your land documents on blockchain. Get tamper-proof certificates.",
                    icon: "documents",
                    tone: "indigo",
                    page: null,
                    route: "/documents",
                    disabled: false,
                  },
                ].map((service, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all flex flex-col"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm mb-4 ${
                        service.tone === "green"
                          ? "bg-green-600"
                          : service.tone === "amber"
                          ? "bg-amber-500"
                          : "bg-indigo-600"
                      }`}
                    >
                      <NavIcon name={service.icon} className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-800 mb-2">{service.title}</h3>
                    <p className="text-sm text-gray-500 flex-1 mb-4">{service.desc}</p>
                    {service.disabled ? (
                      <span className="inline-block px-4 py-2 rounded-lg bg-gray-200 text-gray-500 text-sm font-semibold text-center">
                        COMING SOON
                      </span>
                    ) : (
                      <button
                        onClick={() => service.route ? navigate(service.route) : setActivePage(service.page)}
                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-sm shadow-sm hover:bg-indigo-700 transition"
                      >
                        OPEN
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-indigo-600">
                    <NavIcon name="clock" className="w-6 h-6" />
                  </span>
                  <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
                </div>
                {userDisputes.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No recent activity. Submit a request to get started!</p>
                ) : (
                  <div className="space-y-4">
                    {userDisputes.slice(0, 5).map((dispute, i) => (
                      <div
                        key={dispute._id || i}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-200">
                            <NavIcon name="file" className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {dispute.title || "Request"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(dispute.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            dispute.status === "resolved"
                              ? "bg-green-100 text-green-700"
                              : dispute.status === "in progress"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {dispute.status === "in progress" ? "PROCESSING" : dispute.status === "open" ? "PENDING" : dispute.status?.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        {/* Form Pages */}
        {["mutual-partition", "family-partition", "boundary-demarcation"].includes(activePage) && (
          <div className="animate-fadeIn">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 max-w-4xl">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-sm ${
                  activePage === "mutual-partition" ? "bg-indigo-600" :
                  activePage === "family-partition" ? "bg-green-600" :
                  "bg-amber-500"
                }`}>
                  <NavIcon name={activePage === "mutual-partition" ? "mutual" : activePage === "family-partition" ? "family" : "boundary"} className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {activePage === "mutual-partition" && "Mutual Partition Request"}
                    {activePage === "family-partition" && "Family Partition Request"}
                    {activePage === "boundary-demarcation" && "Boundary Demarcation Request"}
                  </h2>
                  <p className="text-gray-500">Fill in the details below to submit your request</p>
                </div>
              </div>
              <form
                onSubmit={(e) =>
                  handleFormSubmit(
                    e,
                    activePage
                      .split("-")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")
                  )
                }
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Land Number</label>
                  <input
                    name="landNumber"
                    value={formData.landNumber}
                    onChange={handleInputChange}
                    placeholder="Enter land number"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Khata Number</label>
                  <input
                    name="khataNumber"
                    value={formData.khataNumber}
                    onChange={handleInputChange}
                    placeholder="Enter khata number"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Land Area (hectares)</label>
                  <input
                    name="landArea"
                    value={formData.landArea}
                    onChange={handleInputChange}
                    placeholder="Enter land area"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number</label>
                  <input
                    name="aadhaarNumber"
                    value={formData.aadhaarNumber}
                    onChange={handleInputChange}
                    placeholder="12-digit Aadhaar number"
                    pattern="\d{12}"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                  <input
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number"
                    pattern="\d{10}"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your full address"
                    rows="2"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition"
                    required
                  ></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description / Reason</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your request in detail..."
                    rows="4"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition"
                  ></textarea>
                </div>

                {/* Document Upload Section */}
                <div className="md:col-span-2">
                  <DocumentUploadForDispute
                    disputeType={activePage}
                    onDocumentsChange={(docs) => setUploadedDocuments(docs)}
                  />
                </div>

                <div className="md:col-span-2 flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleAIAnalyze(
                      activePage
                        .split("-")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")
                    )}
                    className="flex-1 py-4 rounded-xl font-bold text-indigo-700 bg-indigo-50 border-2 border-indigo-200 hover:bg-indigo-100 transition text-lg flex items-center justify-center gap-2"
                  >
                    <NavIcon name="sparkles" className="w-6 h-6" />
                    AI Analysis
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 py-4 rounded-xl font-bold text-white bg-indigo-600 shadow-sm hover:bg-indigo-700 transition text-lg ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* AI Analyzer Modal */}
        {showAIAnalyzer && analyzeData && (
          <AIDisputeAnalyzer
            disputeData={analyzeData}
            onClose={() => setShowAIAnalyzer(false)}
          />
        )}

        {/* Status Page - Real Data from Backend */}
        {activePage === "status" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Your Application Status
              </h2>

              {loadingDisputes ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading your requests...</p>
                </div>
              ) : userDisputes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                    <NavIcon name="inbox" className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Requests Yet</h3>
                  <p className="text-gray-500 mb-6">You haven't submitted any partition or demarcation requests.</p>
                  <button
                    onClick={() => setActivePage("mutual-partition")}
                    className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-sm hover:bg-indigo-700 transition"
                  >
                    Submit Your First Request
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userDisputes.map((dispute, i) => (
                    <div
                      key={dispute._id || i}
                      className={`p-6 rounded-xl border-l-4 bg-gray-50 hover:bg-gray-100 transition ${
                        dispute.status === "resolved"
                          ? "border-green-500"
                          : dispute.status === "in progress"
                          ? "border-blue-500"
                          : "border-yellow-500"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
                              <NavIcon name={getDisputeIconName(dispute.title || "")} className="w-5 h-5" />
                            </span>
                            <h3 className="font-bold text-lg text-gray-800">
                              {dispute.title || "Request"}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Land Number:</strong> {dispute.landNumber || "N/A"} | <strong>Khata:</strong> {dispute.khataNumber || "N/A"}
                          </p>
                          <p className="text-sm text-gray-500">
                            <strong>Submitted:</strong> {new Date(dispute.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                          {dispute.description && (
                            <p className="text-sm text-gray-500 mt-2 italic">"{dispute.description}"</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`px-4 py-2 rounded-full text-sm font-bold uppercase ${
                              dispute.status === "resolved"
                                ? "bg-green-100 text-green-700"
                                : dispute.status === "in progress"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {dispute.status === "open" ? "Pending" : dispute.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Page */}
        {activePage === "settings" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl p-8 shadow-lg max-w-3xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-8">Settings</h2>

              {/* Account Settings */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      defaultValue="John Doe"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      defaultValue="john.doe@example.com"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      defaultValue="+91 9876543210"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                  <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:opacity-90 transition">
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification Preferences</h3>
                <div className="space-y-3">
                  {[
                    { label: "Email Notifications", checked: true },
                    { label: "SMS Notifications", checked: false },
                    { label: "Push Notifications", checked: true },
                    { label: "Application Status Updates", checked: true },
                  ].map((item, i) => (
                    <label key={i} className="flex items-center text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={item.checked}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span className="ml-3">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Privacy Settings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Privacy & Security</h3>
                <div className="pt-4">
                  <button className="px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition">
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Page */}
        {activePage === "feedback" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl p-8 shadow-lg max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Send Us Feedback</h2>
              <p className="text-gray-500 text-center mb-8">
                We'd love to hear your thoughts and suggestions to improve BhoomiSetu
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Thank you for your feedback! We'll review it soon.");
                }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name (Optional)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Type</label>
                  <select className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
                    <option>General Feedback</option>
                    <option>Bug Report</option>
                    <option>Feature Request</option>
                    <option>Complaint</option>
                    <option>Compliment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Feedback</label>
                  <textarea
                    rows="5"
                    placeholder="Please share your thoughts, suggestions, or report any issues..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">Rate Your Experience</label>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className="p-2 rounded-lg hover:bg-slate-100 transition"
                        aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                      >
                        <span className={star <= feedbackRating ? "text-amber-500" : "text-slate-300"}>
                          <NavIcon name="star" className="w-8 h-8" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold text-lg shadow-lg hover:opacity-90 transition"
                >
                  Submit Feedback
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Profile Page */}
        {activePage === "profile" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl p-8 shadow-lg max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-28 h-28 rounded-full mx-auto mb-4 bg-slate-900 flex items-center justify-center text-white shadow-sm">
                  <NavIcon name="profile" className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {localStorage.getItem("userName") || "User"}
                </h2>
                <p className="text-gray-500">Land Owner</p>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    defaultValue={localStorage.getItem("userName") || ""}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    defaultValue="user@example.com"
                    readOnly
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    defaultValue="+91 9876543210"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    rows="3"
                    defaultValue="123 Main Street, City, State, PIN"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <button className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:opacity-90 transition">
                  Update Profile
                </button>
              </form>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
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
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
