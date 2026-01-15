import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from '../config/api';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(API_ENDPOINTS.auth.signup, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        alert(data.message || "Registration failed.");
      }
    } catch (err) {
      alert("Server error. Please try again later.");
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-600 via-green-700 to-green-800 flex items-center justify-center min-h-screen p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full"></div>
        <div className="absolute top-40 -left-40 w-60 h-60 bg-white opacity-10 rounded-full"></div>
        <div className="absolute -bottom-20 right-20 w-40 h-40 bg-white opacity-10 rounded-full"></div>
      </div>
      
      <div className="bg-white/95 backdrop-blur-lg p-8 rounded-3xl shadow-2xl w-full max-w-md relative z-10">
        {/* Logo and App Name */}
        <div className="flex flex-col items-center mb-8">
          <img 
            src="/image.jpeg" 
            alt="Bhoomisetu Logo" 
            className="h-20 w-20 rounded-2xl shadow-lg object-cover border-4 border-white mb-4" 
            onError={(e) => { e.target.src = 'https://placehold.co/80x80/10b981/ffffff?text=🏠'; }}
          />
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Bhoomisetu
          </h1>
          <p className="text-gray-600 font-medium">Create Your Account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder="Full Name"
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder="Email"
            required
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder="Password"
            required
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Already have an account?
          <Link
            to="/login"
            className="text-green-700 font-semibold hover:underline ml-1"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
