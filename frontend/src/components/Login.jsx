import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordMethod, setForgotPasswordMethod] = useState(null);
  const [showOTP, setShowOTP] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.user?.role || 'user');
        localStorage.setItem('userName', data.user?.name || '');
        
        // Redirect based on user role
        if (data.user?.role === 'lawyer') {
          navigate('/lawyer-dashboard');
        } else if (data.user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        alert(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Cannot connect to server. Please ensure the backend is running on http://localhost:3000');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full animate-float"></div>
        <div className="absolute top-40 -left-40 w-60 h-60 bg-white opacity-10 rounded-full animate-float" style={{ animationDelay: '-2s' }}></div>
        <div className="absolute -bottom-20 right-20 w-40 h-40 bg-white opacity-10 rounded-full animate-float" style={{ animationDelay: '-4s' }}></div>
      </div>

      {/* Main Container */}
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 sm:p-12 w-full max-w-md relative z-10 animate-slideIn">
        {/* Logo and App Name */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-6">
            <img 
              src="/image.jpeg" 
              alt="Bhoomisetu Logo" 
              className="h-24 w-24 rounded-2xl shadow-lg object-cover border-4 border-white animate-float" 
              onError={(e) => { e.target.src = 'https://placehold.co/100x100/10b981/ffffff?text=🏠'; }}
            />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Bhoomisetu
          </h1>
          <p className="text-gray-600 text-lg font-medium">Smart Land Resolution Platform</p>
        </div>

        {!showForgotPassword ? (
          /* Login Form */
          <div className="w-full animate-fadeIn">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Welcome Back!</h2>
            
            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" 
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-4 focus:ring-green-100 focus:border-green-500 text-base transition-all duration-200"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    id="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-4 focus:ring-green-100 focus:border-green-500 text-base transition-all duration-200 pr-12"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <span>{showPassword ? '🙈' : '👁️'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
                  <span className="ml-2 text-sm text-gray-700 font-medium">Remember me</span>
                </label>
                <button 
                  type="button" 
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm font-semibold text-green-600 hover:text-green-500 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              <button 
                type="submit"
                className="w-full py-3 px-4 rounded-xl text-lg font-bold text-white bg-gradient-to-r from-green-500 to-green-700 shadow-lg hover:from-green-600 hover:to-green-800 transition-all duration-200 transform hover:scale-105"
              >
                Sign In
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                New to Bhoomisetu? 
                <Link to="/signup" className="font-semibold text-green-600 hover:text-green-500 transition-colors ml-1">
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        ) : (
          /* Forgot Password Section */
          <div className="w-full animate-fadeIn">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h2>
              <p className="text-gray-600">Choose your preferred recovery method</p>
            </div>

            {!forgotPasswordMethod && !showOTP && (
              <div className="space-y-4">
                <button 
                  onClick={() => setForgotPasswordMethod('email')}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left"
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📧</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">Email Recovery</h3>
                      <p className="text-sm text-gray-600">Get reset link via email</p>
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={() => setForgotPasswordMethod('mobile')}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left"
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📱</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">Mobile OTP</h3>
                      <p className="text-sm text-gray-600">Get OTP on your mobile</p>
                    </div>
                  </div>
                </button>
              </div>
            )}

            {forgotPasswordMethod === 'email' && !showOTP && (
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Reset link sent!'); setShowForgotPassword(false); }}>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="you@example.com" 
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500"
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold rounded-xl transition-all duration-200 hover:from-green-600 hover:to-green-800">
                  Send Reset Link
                </button>
              </form>
            )}

            {forgotPasswordMethod === 'mobile' && !showOTP && (
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowOTP(true); }}>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
                  <input 
                    type="tel" 
                    placeholder="+91 9876543210" 
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500"
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold rounded-xl transition-all duration-200 hover:from-green-600 hover:to-green-800">
                  Send OTP
                </button>
              </form>
            )}

            {showOTP && (
              <div>
                <div className="text-center mb-4">
                  <p className="text-gray-600">Enter the 6-digit OTP sent to your mobile</p>
                </div>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('OTP verified!'); setShowForgotPassword(false); setShowOTP(false); }}>
                  <div className="flex justify-center space-x-2">
                    {[...Array(6)].map((_, i) => (
                      <input 
                        key={i}
                        type="text" 
                        maxLength="1" 
                        className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100"
                      />
                    ))}
                  </div>
                  <button type="submit" className="w-full py-3 bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold rounded-xl transition-all duration-200 hover:from-green-600 hover:to-green-800">
                    Verify OTP
                  </button>
                  <button type="button" className="w-full py-2 text-green-600 font-semibold hover:text-green-500">
                    Resend OTP
                  </button>
                </form>
              </div>
            )}

            <button 
              onClick={() => { setShowForgotPassword(false); setForgotPasswordMethod(null); setShowOTP(false); }}
              className="w-full mt-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Login
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in;
        }
      `}</style>
    </div>
  );
}
