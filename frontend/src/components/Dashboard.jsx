import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AIDisputeAnalyzer from "./AIDisputeAnalyzer";
import DocumentUploadForDispute from "./DocumentUploadForDispute.jsx";

export default function Dashboard() {
  const [activePage, setActivePage] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const [showAIAnalyzer, setShowAIAnalyzer] = useState(false);
  const [analyzeData, setAnalyzeData] = useState(null);

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
      const res = await fetch("http://localhost:3000/api/disputes", {
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
      const res = await fetch("http://localhost:3000/api/disputes", {
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
        alert("✅ Request submitted successfully! Documents will be reviewed by a lawyer.");
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

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Sidebar */}
      <div className="w-56 bg-white shadow-xl flex flex-col">
        {/* Profile Section */}
        <div className="p-6 flex flex-col items-center border-b border-gray-100">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-3xl shadow-lg mb-3">
            👤
          </div>
          <h3 className="font-bold text-gray-800">Welcome, User</h3>
          <p className="text-sm text-gray-500">Land Owner</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: "dashboard", icon: "📊", label: "Dashboard" },
            { id: "mutual-partition", icon: "🤝", label: "Mutual Partition" },
            { id: "family-partition", icon: "🏠", label: "Family Partition" },
            { id: "boundary-demarcation", icon: "📍", label: "Boundary Demarcation" },
            { id: "documents", icon: "🔗", label: "Blockchain Documents" },
            { id: "profile", icon: "👤", label: "User Profile" },
            { id: "status", icon: "📋", label: "Status" },
            { id: "settings", icon: "⚙️", label: "Settings" },
            { id: "feedback", icon: "💬", label: "Feedback" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "documents") {
                  window.location.href = "/documents";
                } else {
                  setActivePage(item.id);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                activePage === item.id
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
          >
            <span className="text-lg">🚪</span>
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 px-8 py-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <img 
              src="/image.jpeg" 
              alt="BhoomiSetu Logo" 
              className="h-10 w-10 rounded-lg shadow-md object-cover border-2 border-white/30"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <h1 className="text-2xl font-bold text-white tracking-wide">BhoomiSetu</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative p-2 bg-white/20 rounded-full hover:bg-white/30 transition">
              <span className="text-white text-xl">🔔</span>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">3</span>
            </button>
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition"
            >
              <span className="text-white text-xl">{darkMode ? "☀️" : "🌙"}</span>
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
                  { label: "Total Applications", value: stats.total, icon: "📄", bgColor: "from-blue-400 to-blue-600" },
                  { label: "Approved", value: stats.approved, icon: "✅", bgColor: "from-green-400 to-green-600" },
                  { label: "Pending", value: stats.pending, icon: "⏳", bgColor: "from-yellow-400 to-orange-500" },
                  { label: "In Process", value: stats.inProcess, icon: "⚙️", bgColor: "from-purple-400 to-purple-600" },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                        <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                      </div>
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.bgColor} flex items-center justify-center text-2xl text-white shadow-lg`}>
                        {stat.icon}
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
                    icon: "🤝",
                    color: "from-blue-500 to-indigo-600",
                    page: "mutual-partition",
                  },
                  {
                    title: "Family Partition",
                    desc: "Submit a family-based partition request. Specialized process for ancestral property division among family members.",
                    icon: "🏠",
                    color: "from-green-500 to-teal-600",
                    page: "family-partition",
                  },
                  {
                    title: "Boundary Demarcation",
                    desc: "Request official demarcation of land boundaries to resolve disputes over property lines.",
                    icon: "📍",
                    color: "from-orange-500 to-red-500",
                    page: "boundary-demarcation",
                  },
                  {
                    title: "Other Services",
                    desc: "More services coming soon to help you with various land management needs.",
                    icon: "📦",
                    color: "from-gray-400 to-gray-500",
                    page: null,
                    disabled: true,
                  },
                ].map((service, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all flex flex-col"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center text-xl text-white shadow mb-4`}>
                      {service.icon}
                    </div>
                    <h3 className="font-bold text-lg text-gray-800 mb-2">{service.title}</h3>
                    <p className="text-sm text-gray-500 flex-1 mb-4">{service.desc}</p>
                    {service.disabled ? (
                      <span className="inline-block px-4 py-2 rounded-lg bg-gray-200 text-gray-500 text-sm font-semibold text-center">
                        COMING SOON
                      </span>
                    ) : (
                      <button
                        onClick={() => setActivePage(service.page)}
                        className={`px-4 py-2 rounded-lg bg-gradient-to-r ${service.color} text-white font-semibold text-sm shadow hover:opacity-90 transition`}
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
                  <span className="text-2xl">🕐</span>
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
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                            📄
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
            <div className="bg-white rounded-2xl p-8 shadow-lg max-w-4xl">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl text-white shadow-lg ${
                  activePage === "mutual-partition" ? "bg-gradient-to-br from-blue-500 to-indigo-600" :
                  activePage === "family-partition" ? "bg-gradient-to-br from-green-500 to-teal-600" :
                  "bg-gradient-to-br from-orange-500 to-red-500"
                }`}>
                  {activePage === "mutual-partition" ? "🤝" : activePage === "family-partition" ? "🏠" : "📍"}
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
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
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
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
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
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
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
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
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
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
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
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
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
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
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
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
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
                    className="flex-1 py-4 rounded-xl font-bold text-indigo-600 bg-indigo-50 border-2 border-indigo-200 hover:bg-indigo-100 transition text-lg flex items-center justify-center gap-2"
                  >
                    🤖 AI Analysis
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg hover:opacity-90 transition text-lg ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? '⏳ Submitting...' : 'Submit Request'}
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
                  <div className="text-6xl mb-4">📭</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Requests Yet</h3>
                  <p className="text-gray-500 mb-6">You haven't submitted any partition or demarcation requests.</p>
                  <button
                    onClick={() => setActivePage("mutual-partition")}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl shadow hover:opacity-90 transition"
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
                            <span className="text-2xl">
                              {dispute.title?.includes("Mutual") ? "🤝" : dispute.title?.includes("Family") ? "🏠" : "📍"}
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
                        className="text-4xl hover:scale-110 transition-transform"
                        onClick={(e) => {
                          e.preventDefault();
                          const stars = e.target.closest("div").querySelectorAll("button");
                          stars.forEach((s, i) => {
                            s.textContent = i < star ? "⭐" : "☆";
                          });
                        }}
                      >
                        {star <= 4 ? "⭐" : "☆"}
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
                <div className="w-28 h-28 rounded-full mx-auto mb-4 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-5xl text-white shadow-lg">
                  👤
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
