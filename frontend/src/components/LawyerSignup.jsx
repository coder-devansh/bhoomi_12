import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';

export default function LawyerSignup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [barCouncilNumber, setBarCouncilNumber] = useState('');
  const [verificationDocument, setVerificationDocument] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const fileLabel = useMemo(() => {
    if (!verificationDocument) return 'Choose a document (PDF/JPG/PNG)';
    return verificationDocument.name;
  }, [verificationDocument]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password) {
      setError('Name, email, and password are required');
      return;
    }

    if (!verificationDocument) {
      setError('Verification document is required');
      return;
    }

    const form = new FormData();
    form.append('name', name);
    form.append('email', email);
    form.append('password', password);
    form.append('phone', phone);
    form.append('barCouncilNumber', barCouncilNumber);
    form.append('verificationDocument', verificationDocument);

    setSubmitting(true);
    try {
      const res = await fetch(API_ENDPOINTS.lawyer.auth.signup, {
        method: 'POST',
        body: form
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || 'Application submission failed');
        return;
      }

      setSuccess('Application submitted. Awaiting admin verification.');
      setTimeout(() => navigate('/lawyer/login'), 1200);
    } catch (err) {
      setError('Cannot connect to server. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-[#0F172A]">Lawyer Signup (Verification)</h1>
          <p className="text-sm text-slate-600 mt-1">
            Submit your details and upload a verification document. You can login only after admin approval.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 text-green-700 px-4 py-3 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2563EB]"
                placeholder="Adv. Your Name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2563EB]"
                placeholder="you@lawfirm.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Phone (optional)</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2563EB]"
                placeholder="+91..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Bar Council Number (optional)</label>
            <input
              value={barCouncilNumber}
              onChange={(e) => setBarCouncilNumber(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2563EB]"
              placeholder="BCI/1234/2020"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Verification Document</label>
            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  className="hidden"
                  onChange={(e) => setVerificationDocument(e.target.files?.[0] || null)}
                />
                <div className="w-full px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white">
                  <div className="text-sm text-slate-700 truncate">{fileLabel}</div>
                </div>
              </label>
              {verificationDocument && (
                <button
                  type="button"
                  onClick={() => setVerificationDocument(null)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Upload your Bar Council ID / License / any official proof.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting…' : 'Submit for Verification'}
          </button>
        </form>

        <div className="mt-6 text-sm text-slate-600">
          Already applied?{' '}
          <Link to="/lawyer/login" className="font-semibold text-[#2563EB] hover:underline">
            Lawyer Login
          </Link>
        </div>
      </div>
    </div>
  );
}
