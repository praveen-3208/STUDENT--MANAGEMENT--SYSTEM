import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateMe } from '../api';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedUser = await updateMe(formData);
      login(updatedUser); // Update local auth context with new user info
      setSuccess('Profile updated successfully!');
    } catch (err) {
      if (err.response && err.response.data) {
        // Simple error parsing for DRF
        const data = err.response.data;
        const msg = Object.values(data).map(v => Array.isArray(v) ? v[0] : v).join(' ');
        setError(msg || 'Failed to update profile.');
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            🎓
          </div>
          <h1 className="text-lg font-bold text-slate-900">Student Management System</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center p-6">
        <div className="w-full max-w-md bg-white rounded-xl shadow-xs border border-slate-200 p-8 mt-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">My Profile</h2>
            <p className="text-sm text-slate-500 mt-2">Update your account information.</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4 border border-red-200 flex items-start gap-2">
              <span className="mt-0.5 shrink-0">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-4 border border-green-200 flex items-start gap-2">
              <span className="mt-0.5 shrink-0">✓</span>
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition mt-6"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
