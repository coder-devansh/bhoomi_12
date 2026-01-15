import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@bhoomisetu.com');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(API_ENDPOINTS.auth.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      // Force admin portal state if official admin email (backend also guarantees role now)
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.user?.role || 'admin');
      localStorage.setItem('userName', data.user?.name || 'Admin');

      navigate('/admin');
    } catch (err) {
      setError('Cannot connect to server. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/10">
        <div className="p-8 bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white">
          <div className="text-sm font-semibold text-white/70">BhoomiSetu</div>
          <h1 className="mt-2 text-3xl font-extrabold">Admin Portal</h1>
          <p className="mt-3 text-white/80">
            Login to verify lawyers and manage disputes.
          </p>
          <div className="mt-8 space-y-2 text-sm text-white/80">
            <div>• Verify lawyers and issue credentials</div>
            <div>• Review disputes and update status</div>
            <div>• Secure access (admin-only)</div>
          </div>
          <div className="mt-10 text-white/70 text-sm">
            Back to <Link to="/" className="text-white font-semibold underline">Home</Link>
          </div>
        </div>

        <div className="p-8 bg-[#F8FAFC]">
          <h2 className="text-xl font-extrabold text-[#0F172A]">Sign in</h2>
          <p className="text-sm text-slate-600 mt-1">Use admin email and password.</p>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2563EB] bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2563EB] bg-white"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Signing in…' : 'Login to Admin Portal'}
            </button>
          </form>

          <div className="mt-6 text-sm text-slate-600">
            Not an admin? <Link to="/auth?mode=login&role=user" className="font-semibold text-[#2563EB] hover:underline">User Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
