import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';

export default function AuthOverlay({ initialMode = 'login', onClose }) {
  const navigate = useNavigate();

  const [mode, setMode] = useState(initialMode); // login | signup
  const [role, setRole] = useState('user'); // user | lawyer
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

  const [visible, setVisible] = useState(false);

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const close = () => {
    setVisible(false);
    window.setTimeout(() => onClose?.(), 180);
  };

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => setVisible(true));

    const onKeyDown = (e) => {
      if (e.key === 'Escape') close();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const title = useMemo(() => (mode === 'login' ? 'Welcome back' : 'Create your account'), [mode]);

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
    if (mode === 'signup' && role === 'user' && !password) {
      setError('Password is required');
      return;
    }

    if (mode === 'signup' && !name) {
      setError('Full name is required');
      return;
    }
    if (mode === 'signup' && role === 'lawyer' && !verificationDocument) {
      setError('Verification document is required');
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
          body: JSON.stringify({ email, password }),
        });
      } else {
        // signup
        if (role === 'lawyer') {
          const form = new FormData();
          form.append('name', name);
          form.append('email', email);
          if (phone) form.append('phone', phone);
          if (barCouncilNumber) form.append('barCouncilNumber', barCouncilNumber);
          form.append('verificationDocument', verificationDocument);

          res = await fetch(API_ENDPOINTS.lawyer.auth.signup, {
            method: 'POST',
            body: form,
          });
        } else {
          res = await fetch(API_ENDPOINTS.auth.signup, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
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
          window.setTimeout(() => {
            setMode('login');
            setRole('lawyer');
            setPassword('');
            setVerificationDocument(null);
          }, 800);
        } else {
          setSuccess('Signup successful. Please login.');
          window.setTimeout(() => {
            setMode('login');
            setPassword('');
          }, 700);
        }
        return;
      }

      // login success
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.user?.role || 'user');
      localStorage.setItem('userName', data.user?.name || '');

      close();

      // Admin is separated, but if backend returns admin anyway, route safely.
      if (data.user?.role === 'admin') {
        navigate('/admin');
      } else if (data.user?.role === 'lawyer' || role === 'lawyer') {
        navigate('/lawyer-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch {
      setError('Cannot connect to server. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close auth dialog"
        onClick={close}
        className={
          `absolute inset-0 bg-slate-900/60 transition-opacity duration-200 ` +
          (visible ? 'opacity-100' : 'opacity-0')
        }
      />

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className={
            `w-full max-w-5xl overflow-hidden rounded-3xl shadow-2xl border border-white/20 bg-white transition-all duration-200 ` +
            (visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95')
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left brand panel (green+blue theme) */}
            <div className="p-8 text-white bg-gradient-to-br from-emerald-600 via-green-600 to-blue-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
                    <span className="text-lg font-black">BS</span>
                  </div>
                  <div>
                    <div className="text-xl font-extrabold">Bhoomisetu</div>
                    <div className="text-white/85 text-sm">Land Dispute Resolution</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={close}
                  className="rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-bold"
                >
                  Close
                </button>
              </div>

              <h2 className="mt-8 text-3xl font-extrabold leading-tight">{title}</h2>
              <p className="mt-2 text-white/90">
                {mode === 'login'
                  ? 'Login to continue to your dashboard.'
                  : role === 'lawyer'
                    ? 'Apply as a lawyer. Admin will verify and issue your login password.'
                    : 'Create a user account in seconds to get started.'}
              </p>

              <div className="mt-8 text-sm text-white/90 space-y-2">
                <div>• Secure, transparent dispute tracking</div>
                <div>• Quick document uploads</div>
                <div>
                  Admin login?{' '}
                  <Link to="/admin/login" className="font-bold underline">
                    Admin Portal
                  </Link>
                </div>
              </div>
            </div>

            {/* Right form panel */}
            <div className="p-8 bg-[#F8FAFC]">
              <div className="flex gap-2 bg-white rounded-2xl p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    resetMessages();
                    setMode('login');
                    setPassword('');
                  }}
                  className={
                    mode === 'login'
                      ? 'flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-extrabold shadow'
                      : 'flex-1 py-2 rounded-xl font-semibold text-slate-700 hover:text-slate-900'
                  }
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetMessages();
                    setMode('signup');
                    setPassword('');
                  }}
                  className={
                    mode === 'signup'
                      ? 'flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-extrabold shadow'
                      : 'flex-1 py-2 rounded-xl font-semibold text-slate-700 hover:text-slate-900'
                  }
                >
                  Signup
                </button>
              </div>

              {/* Role selector */}
              <div className="mt-4">
                <div className="text-sm font-semibold text-slate-700 mb-2">Continue as</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetMessages();
                      setRole('user');
                      setVerificationDocument(null);
                    }}
                    className={
                      role === 'user'
                        ? 'py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-extrabold shadow'
                        : 'py-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-semibold hover:bg-slate-50'
                    }
                  >
                    User
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetMessages();
                      setRole('lawyer');
                      setVerificationDocument(null);
                    }}
                    className={
                      role === 'lawyer'
                        ? 'py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-extrabold shadow'
                        : 'py-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-semibold hover:bg-slate-50'
                    }
                  >
                    Lawyer
                  </button>
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
                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 bg-white"
                      placeholder={role === 'lawyer' ? 'Adv. Your Name' : 'Your name'}
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
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 bg-white"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                {(mode === 'login' || (mode === 'signup' && role === 'user')) && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 bg-white"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                )}

                {mode === 'signup' && role === 'lawyer' && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-sm">
                    You don’t create a password here. After verification, the admin will issue your login password.
                  </div>
                )}

                {mode === 'signup' && role === 'lawyer' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Phone (optional)</label>
                        <input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 bg-white"
                          placeholder="+91..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Bar Council No. (optional)</label>
                        <input
                          value={barCouncilNumber}
                          onChange={(e) => setBarCouncilNumber(e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 bg-white"
                          placeholder="BCI-..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Verification Document</label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setVerificationDocument(e.target.files?.[0] || null)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white"
                        required
                      />
                      <div className="text-xs text-slate-500 mt-1">Upload ID card / bar council proof (PDF or image).</div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl font-extrabold text-white bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 disabled:opacity-60 disabled:cursor-not-allowed shadow"
                >
                  {submitting
                    ? 'Please wait…'
                    : mode === 'login'
                      ? role === 'lawyer'
                        ? 'Login as Lawyer'
                        : 'Login'
                      : role === 'lawyer'
                        ? 'Submit Lawyer Application'
                        : 'Create Account'}
                </button>
              </form>

              <div className="mt-6 text-sm text-slate-600">
                Admin login? <Link to="/admin/login" className="font-semibold text-emerald-700 hover:underline">Admin Portal</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
