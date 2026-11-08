import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const AdminSetup: React.FC = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', setupKey: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { setupKey, ...admin } = form;
      const response = await api.post('/auth/setup-admin', admin, {
        headers: { 'x-admin-setup-key': setupKey }
      });
      setMessage(response.data.message || 'Admin account created. You can now sign in.');
      setForm({ firstName: '', lastName: '', email: '', password: '', setupKey: '' });
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'Could not create the admin account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-12">
      <section className="w-full border-y border-gray-200 bg-white py-8 sm:border sm:rounded-2xl sm:px-8">
        <p className="text-xs font-black uppercase tracking-widest text-blue-700">One-time setup</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950">Create the administrator</h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">Only the first Admin account can be created here. Keep the setup key private.</p>

        {error && <p role="alert" className="mt-6 border-l-4 border-rose-500 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">{error}</p>}
        {message && <p role="status" className="mt-6 border-l-4 border-emerald-500 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{message} <Link to="/login" className="underline">Sign in</Link></p>}

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-xs font-bold text-gray-600">
              First name
              <input required autoComplete="given-name" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
            </label>
            <label className="space-y-1.5 text-xs font-bold text-gray-600">
              Last name
              <input required autoComplete="family-name" value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
            </label>
          </div>
          <label className="block space-y-1.5 text-xs font-bold text-gray-600">
            Email
            <input required type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
          </label>
          <label className="block space-y-1.5 text-xs font-bold text-gray-600">
            Password
            <input required minLength={8} type="password" autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
          </label>
          <label className="block space-y-1.5 text-xs font-bold text-gray-600">
            Admin setup key
            <input required type="password" autoComplete="off" value={form.setupKey} onChange={(event) => setForm({ ...form, setupKey: event.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
          </label>
          <button disabled={loading} className="w-full rounded-lg bg-gray-950 px-4 py-3.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create the only Admin account'}
          </button>
        </form>
      </section>
    </main>
  );
};

export default AdminSetup;