import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (errors.non_field_errors) {
       setErrors((prev) => ({ ...prev, non_field_errors: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    if (formData.password !== formData.confirm_password) {
      setErrors({ confirm_password: "Passwords do not match." });
      return;
    }

    setLoading(true);

    try {
      await registerUser(formData);
      // After successful registration, redirect to login
      navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
    } catch (err) {
      if (err.response && err.response.data) {
        setErrors(err.response.data);
      } else {
        setErrors({ non_field_errors: 'Registration failed. Please try again later.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-8 shadow-lg border border-slate-200 bg-white">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold mx-auto mb-4 text-xl">
            🎓
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
          <p className="text-sm text-slate-500 mt-2">Sign up for the Student Management System.</p>
        </div>

        {errors.non_field_errors && (
          <div className="alert alert-danger mb-4" role="alert">
            <span>⚠</span>
            <div>{errors.non_field_errors}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              className={`form-control ${errors.username ? 'input-error' : ''}`}
              value={formData.username}
              onChange={handleChange}
              required
            />
            {errors.username && <div className="field-error">{errors.username}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              className={`form-control ${errors.email ? 'input-error' : ''}`}
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              className={`form-control ${errors.password ? 'input-error' : ''}`}
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
            />
            {errors.password && <div className="field-error">{errors.password}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm_password">Confirm Password</label>
            <input
              id="confirm_password"
              type="password"
              name="confirm_password"
              className={`form-control ${errors.confirm_password ? 'input-error' : ''}`}
              value={formData.confirm_password}
              onChange={handleChange}
              required
              minLength={8}
            />
            {errors.confirm_password && <div className="field-error">{errors.confirm_password}</div>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-2.5 text-base mt-4"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
