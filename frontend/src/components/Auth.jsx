import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';

const ROLE_OPTIONS = [
  { key: 'user', label: 'User' },
  { key: 'lawyer', label: 'Lawyer' },
];

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Auth({ initialMode = 'login', initialRole = 'user' }) {
  const query = useQuery();
  const navigate = useNavigate();

  const queryMode = query.get('mode');
  const queryRole = query.get('role');

  const [mode, setMode] = useState(queryMode || initialMode); // login | signup
  const [role, setRole] = useState(queryRole || initialRole); // user | lawyer

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Lawyer-only fields
  const [phone, setPhone] = useState('');
  const [barCouncilNumber, setBarCouncilNumber] = useState('');
  const [verificationDocument, setVerificationDocument] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Admin auth is intentionally separated into its own portal.
    if (queryRole === 'admin' || initialRole === 'admin') {
      navigate('/admin/login', { replace: true });
      return;
    }
    // Keep UI in sync with URL changes (if user navigates with different links)
    if (queryMode && (queryMode === 'login' || queryMode === 'signup')) setMode(queryMode);
    if (queryRole && ['user', 'lawyer'].includes(queryRole)) setRole(queryRole);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryMode, queryRole]);

  const setUrlState = (nextMode, nextRole) => {
    const params = new URLSearchParams();
    params.set('mode', nextMode);
    params.set('role', nextRole);
    navigate(`/auth?${params.toString()}`, { replace: true });
  };

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!email) {
      setError('Email is required');
      return;
    }

    // Password rules:
    // - Login: always required
    // - Signup (user): required
    // - Signup (lawyer): NOT required (admin issues credentials after verification)
    if (mode === 'login' && !password) {
      setError('Password is required');
      return;
    }
    if (mode === 'signup' && role !== 'lawyer' && !password) {
      setError('Password is required');
      return;
    }

    if (mode === 'signup' && role === 'user' && !name) {
      setError('Name is required');
      return;
    }

    if (mode === 'signup' && role === 'lawyer' && (!name || !verificationDocument)) {
      setError('Name and verification document are required');
      return;
    }

    setSubmitting(true);
    try {
      let res;
      if (mode === 'login') {
        const endpoint = role === 'lawyer' ? API_ENDPOINTS.lawyer.auth.login : API_ENDPOINTS.auth.login;
        res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
      } else {
        // signup
        if (role === 'lawyer') {
          const form = new FormData();
          form.append('name', name);
          form.append('email', email);
          if (password) form.append('password', password);
          form.append('phone', phone);
          form.append('barCouncilNumber', barCouncilNumber);
          form.append('verificationDocument', verificationDocument);
          res = await fetch(API_ENDPOINTS.lawyer.auth.signup, {
            method: 'POST',
            body: form
          });
        } else {
          // user signups
          res = await fetch(API_ENDPOINTS.auth.signup, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
          });
        }
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || 'Request failed');
        return;
      }

      if (mode === 'signup') {
        if (role === 'lawyer') {
          setSuccess('Application submitted. Awaiting admin verification.');
          setTimeout(() => {
            setMode('login');
            setUrlState('login', 'lawyer');
          }, 900);
        } else {
          setSuccess('Signup successful. Please login.');
          setTimeout(() => {
            setMode('login');
            setUrlState('login', role);
          }, 900);
        }
        return;
      }

      // login success
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.user?.role || role);
      localStorage.setItem('userName', data.user?.name || '');

      if (data.user?.role === 'admin') {
        navigate('/admin');
      } else if (data.user?.role === 'lawyer' || role === 'lawyer') {
        navigate('/lawyer-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Cannot connect to server. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  const isLawyerSignup = mode === 'signup' && role === 'lawyer';
  const showPasswordField = mode === 'login' || (mode === 'signup' && role !== 'lawyer');

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Left brand panel */}
        <div className="bg-[#0F172A] text-white p-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
              <span className="text-lg font-black">BS</span>
            </div>
            <div>
              <div className="text-xl font-extrabold">BhoomiSetu</div>
              <div className="text-white/70 text-sm">Smart Land Resolution Platform</div>
            </div>
          </div>

          <div className="mt-8">
            <div className="text-3xl font-extrabold leading-tight">
              {mode === 'login' ? 'Sign in' : 'Create your account'}
            </div>
            <div className="text-white/70 mt-2">
              Choose your role and continue in one place.
            </div>
          </div>

          <div className="mt-8 space-y-2 text-sm text-white/80">
            <div>• User: file disputes & track status</div>
            <div>• Lawyer: verify documents & resolve cases</div>
          </div>

          <div className="mt-10 text-white/70 text-sm">
            Back to <Link to="/" className="text-white font-semibold underline">Home</Link>
          </div>
        </div>

        {/* Right form panel */}
        <div className="p-8">
          {/* Mode tabs */}
          <div className="flex gap-2 bg-slate-100 rounded-2xl p-1">
            <button
              type="button"
              onClick={() => { resetMessages(); setMode('login'); setUrlState('login', role); }}
              className={
                mode === 'login'
                  ? 'flex-1 py-2 rounded-xl bg-white shadow font-bold text-[#0F172A]'
                  : 'flex-1 py-2 rounded-xl font-semibold text-slate-600 hover:text-slate-800'
              }
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { resetMessages(); setMode('signup'); setUrlState('signup', role); }}
              className={
                mode === 'signup'
                  ? 'flex-1 py-2 rounded-xl bg-white shadow font-bold text-[#0F172A]'
                  : 'flex-1 py-2 rounded-xl font-semibold text-slate-600 hover:text-slate-800'
              }
            >
              Signup
            </button>
          </div>

          {/* Role selector */}
          <div className="mt-5">
            <div className="text-sm font-semibold text-slate-700 mb-2">Continue as</div>
            <div className="grid grid-cols-2 gap-2">
              {ROLE_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    resetMessages();
                    setRole(opt.key);
                    setUrlState(mode, opt.key);
                  }}
                  className={
                    role === opt.key
                      ? 'py-2 rounded-xl bg-[#2563EB] text-white font-bold'
                      : 'py-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-semibold hover:bg-slate-50'
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 text-green-700 px-4 py-3 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Name field for signups */}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2563EB]"
                  placeholder={role === 'lawyer' ? 'Adv. Your Name' : 'Your Name'}
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2563EB]"
                placeholder="you@example.com"
                required
              />
            </div>

            {showPasswordField && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2563EB]"
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            {isLawyerSignup && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-sm">
                You don’t create a password here. After admin verification, the admin will issue your login password.
              </div>
            )}

            {/* Lawyer signup fields */}
            {isLawyerSignup && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Phone (optional)</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2563EB]"
                      placeholder="+91..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Bar Council No. (optional)</label>
                    <input
                      value={barCouncilNumber}
                      onChange={(e) => setBarCouncilNumber(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2563EB]"
                      placeholder="BCI/1234/2020"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Verification Document</label>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) => setVerificationDocument(e.target.files?.[0] || null)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white"
                    required
                  />
                  <div className="text-xs text-slate-500 mt-2">
                    Upload Bar Council ID / License / official proof (required).
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting
                ? (mode === 'login' ? 'Signing in…' : 'Submitting…')
                : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-sm text-slate-600">
            {mode === 'login' ? (
              <>
                New here?{' '}
                <button
                  type="button"
                  onClick={() => { resetMessages(); setMode('signup'); setUrlState('signup', role); }}
                  className="font-semibold text-[#2563EB] hover:underline"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { resetMessages(); setMode('login'); setUrlState('login', role); }}
                  className="font-semibold text-[#2563EB] hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
