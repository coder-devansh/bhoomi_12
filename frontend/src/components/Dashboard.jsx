import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [activePage, setActivePage] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleFormSubmit = async (e, formType) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to submit a dispute.");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/disputes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ ...formData, title: formType, docs: [] }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Dispute submitted successfully!");
        setActivePage("dashboard");
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
      } else {
        alert(data.message || "Submission failed.");
      }
    } catch (err) {
      alert("Server error. Please try again later.");
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div
      className={`min-h-screen flex ${
        darkMode
          ? "bg-gradient-to-br from-gray-800 to-gray-900"
          : "bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800"
      }`}
    >
      {/* Sidebar */}
      <div
        className={`w-72 ${
          darkMode ? "bg-gray-800" : "bg-white/95"
        } backdrop-blur-lg rounded-r-3xl p-6 shadow-2xl`}
      >
        <div className="text-center mb-8 pb-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}">
          <div className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-purple-600 overflow-hidden">
            <img
              src="/logo.jpg"
              alt="User Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "https://i.pravatar.cc/150?img=3";
              }}
            />
          </div>
          <div
            className={`text-lg font-semibold ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Welcome, User
          </div>
          <div
            className={`text-sm ${
              darkMode
                ? "bg-gray-700 text-gray-300"
                : "bg-gray-100 text-gray-600"
            } px-3 py-1 rounded-full inline-block mt-2`}
          >
            Land Owner
          </div>
        </div>

        <nav className="space-y-2">
          {[
            { id: "dashboard", icon: "📊", label: "Dashboard" },
            { id: "mutual-partition", icon: "🤝", label: "Mutual Partition" },
            { id: "family-partition", icon: "🏠", label: "Family Partition" },
            {
              id: "boundary-demarcation",
              icon: "🗺️",
              label: "Boundary Demarcation",
            },
            { id: "profile", icon: "👤", label: "User Profile" },
            { id: "status", icon: "📈", label: "Status" },
            { id: "settings", icon: "⚙️", label: "Settings" },
            { id: "feedback", icon: "💬", label: "Feedback" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                activePage === item.id
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg"
                  : `${
                      darkMode
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
              }`}
            >
              <span className="text-xl mr-3">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
              darkMode
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="text-xl mr-3">🚪</span>
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div
          className={`${
            darkMode ? "bg-gray-800" : "bg-white/90"
          } backdrop-blur-lg rounded-2xl p-6 mb-8 shadow-lg flex justify-between items-center`}
        >
          <h1
            className={`text-3xl font-bold ${
              darkMode
                ? "text-white"
                : "bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent"
            }`}
          >
            BhoomiSetu
          </h1>
          <div className="flex gap-4">
            <button
              className={`w-12 h-12 rounded-full ${
                darkMode ? "bg-gray-700" : "bg-purple-100"
              } flex items-center justify-center text-purple-600 hover:bg-purple-200 transition`}
            >
              🔔
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-12 rounded-full ${
                darkMode ? "bg-gray-700" : "bg-purple-100"
              } flex items-center justify-center hover:bg-purple-200 transition`}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        {activePage === "dashboard" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  label: "Total Applications",
                  value: "12",
                  icon: "📄",
                  color: "from-blue-500 to-blue-600",
                },
                {
                  label: "Approved",
                  value: "8",
                  icon: "✅",
                  color: "from-green-500 to-green-600",
                },
                {
                  label: "Pending",
                  value: "3",
                  icon: "⏰",
                  color: "from-yellow-500 to-yellow-600",
                },
                {
                  label: "In Process",
                  value: "1",
                  icon: "⚙️",
                  color: "from-purple-500 to-purple-600",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className={`${
                    darkMode ? "bg-gray-800" : "bg-white"
                  } rounded-2xl p-6 shadow-lg hover:transform hover:scale-105 transition-transform`}
                >
                  <div
                    className={`w-16 h-16 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center text-3xl mb-4 mx-auto`}
                  >
                    {stat.icon}
                  </div>
                  <div
                    className={`text-3xl font-bold text-center ${
                      darkMode ? "text-white" : "text-gray-800"
                    } mb-2`}
                  >
                    {stat.value}
                  </div>
                  <div
                    className={`text-sm text-center ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Mutual Partition",
                  desc: "Request partition by mutual agreement",
                  color: "from-purple-500 to-purple-700",
                  icon: "🤝",
                  page: "mutual-partition",
                },
                {
                  title: "Family Partition",
                  desc: "Submit a family-based partition request",
                  color: "from-green-500 to-green-700",
                  icon: "🏠",
                  page: "family-partition",
                },
                {
                  title: "Boundary Demarcation",
                  desc: "Request official demarcation",
                  color: "from-orange-500 to-orange-700",
                  icon: "🗺️",
                  page: "boundary-demarcation",
                },
              ].map((service, i) => (
                <div
                  key={i}
                  className={`${
                    darkMode ? "bg-gray-800" : "bg-white"
                  } rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:transform hover:scale-105 transition-all`}
                >
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-r ${service.color} flex items-center justify-center text-2xl mb-4`}
                  >
                    {service.icon}
                  </div>
                  <h3
                    className={`text-xl font-bold mb-3 ${
                      darkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {service.title}
                  </h3>
                  <p
                    className={`mb-6 ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {service.desc}
                  </p>
                  <button
                    onClick={() => setActivePage(service.page)}
                    className={`w-full bg-gradient-to-r ${service.color} text-white py-3 rounded-xl font-semibold hover:shadow-lg transition`}
                  >
                    Open
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form Pages */}
        {[
          "mutual-partition",
          "family-partition",
          "boundary-demarcation",
        ].includes(activePage) && (
          <div
            className={`${
              darkMode ? "bg-gray-800" : "bg-white"
            } rounded-2xl p-8 shadow-lg max-w-4xl mx-auto`}
          >
            <h2
              className={`text-3xl font-bold mb-8 text-center ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              {activePage === "mutual-partition" && "Mutual Partition Request"}
              {activePage === "family-partition" && "Family Partition Request"}
              {activePage === "boundary-demarcation" &&
                "Boundary Demarcation Request"}
            </h2>
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
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Full Name"
                className={`px-4 py-3 rounded-xl border-2 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "border-gray-300"
                } focus:border-purple-500 focus:ring-2 focus:ring-purple-200`}
                required
              />
              <input
                name="landNumber"
                value={formData.landNumber}
                onChange={handleInputChange}
                placeholder="Land Number"
                className={`px-4 py-3 rounded-xl border-2 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "border-gray-300"
                } focus:border-purple-500 focus:ring-2 focus:ring-purple-200`}
                required
              />
              <input
                name="khataNumber"
                value={formData.khataNumber}
                onChange={handleInputChange}
                placeholder="Khata Sankhya"
                className={`px-4 py-3 rounded-xl border-2 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "border-gray-300"
                } focus:border-purple-500 focus:ring-2 focus:ring-purple-200`}
                required
              />
              <input
                name="landArea"
                value={formData.landArea}
                onChange={handleInputChange}
                placeholder="Land Area (hectares)"
                className={`px-4 py-3 rounded-xl border-2 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "border-gray-300"
                } focus:border-purple-500 focus:ring-2 focus:ring-purple-200`}
                required
              />
              <input
                name="aadhaarNumber"
                value={formData.aadhaarNumber}
                onChange={handleInputChange}
                placeholder="Aadhaar Number"
                pattern="\d{12}"
                className={`px-4 py-3 rounded-xl border-2 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "border-gray-300"
                } focus:border-purple-500 focus:ring-2 focus:ring-purple-200`}
                required
              />
              <input
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                placeholder="Mobile Number"
                pattern="\d{10}"
                className={`px-4 py-3 rounded-xl border-2 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "border-gray-300"
                } focus:border-purple-500 focus:ring-2 focus:ring-purple-200`}
                required
              />
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Address"
                rows="3"
                className={`md:col-span-2 px-4 py-3 rounded-xl border-2 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "border-gray-300"
                } focus:border-purple-500 focus:ring-2 focus:ring-purple-200`}
                required
              ></textarea>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Description/Reason"
                rows="4"
                className={`md:col-span-2 px-4 py-3 rounded-xl border-2 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "border-gray-300"
                } focus:border-purple-500 focus:ring-2 focus:ring-purple-200`}
              ></textarea>
              <button
                type="submit"
                className="md:col-span-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:from-purple-700 hover:to-purple-800 transition"
              >
                Submit Request
              </button>
            </form>
          </div>
        )}

        {/* Other Pages Placeholder */}
        {["profile", "status", "settings", "feedback"].includes(activePage) && (
          <div
            className={`${
              darkMode ? "bg-gray-800 text-white" : "bg-white"
            } rounded-2xl p-8 shadow-lg max-w-4xl mx-auto text-center`}
          >
            <h2 className="text-3xl font-bold mb-4 capitalize">
              {activePage.replace("-", " ")}
            </h2>
            <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
              This section is under development.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
