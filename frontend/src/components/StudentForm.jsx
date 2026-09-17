import React, { useState, useEffect } from 'react';
import { createStudent, updateStudent } from '../api';

const DEFAULT_FORM = {
  name: '',
  email: '',
  phone: '',
  date_of_birth: '',
  course: '',
  status: 'active',
};

/**
 * StudentForm component:
 * - Handles both Create and Edit modes.
 * - In Edit mode, form fields are pre-filled with the selected student's data.
 * - Client-side validation for mandatory fields, valid email format, and reasonable dates.
 * - Captures and displays server-side validation errors (e.g., duplicate emails, DRF error payloads).
 */
export default function StudentForm({ editingStudent, onSuccess, onCancel }) {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync form when editingStudent prop changes
  useEffect(() => {
    if (editingStudent) {
      setFormData({
        name: editingStudent.name || '',
        email: editingStudent.email || '',
        phone: editingStudent.phone || '',
        date_of_birth: editingStudent.date_of_birth || '',
        course: editingStudent.course || '',
        status: editingStudent.status || 'active',
      });
      setErrors({});
      setServerError('');
      setSuccessMessage('');
    } else {
      setFormData(DEFAULT_FORM);
      setErrors({});
      setServerError('');
      setSuccessMessage('');
    }
  }, [editingStudent]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-level error when user starts correcting it
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  /**
   * Client-side validation:
   * Validates required fields, email format, and date before sending to server.
   */
  const validateForm = () => {
    const newErrors = {};

    // 1. Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address (e.g. name@campus.edu).';
    }

    // 3. Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (!/^[0-9+\-()\s]{7,25}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number (digits, +, -, ()).';
    }

    // 4. Date of birth validation
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required.';
    } else {
      const dob = new Date(formData.date_of_birth);
      const today = new Date();
      if (dob >= today) {
        newErrors.date_of_birth = 'Date of birth must be in the past.';
      }
    }

    // 5. Course validation
    if (!formData.course.trim()) {
      newErrors.course = 'Enrolled course is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    // Perform client validation first
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        date_of_birth: formData.date_of_birth,
        course: formData.course.trim(),
        status: formData.status,
      };

      if (editingStudent && editingStudent.id) {
        // Update existing student
        await updateStudent(editingStudent.id, payload);
        setSuccessMessage(`Student "${payload.name}" updated successfully!`);
      } else {
        // Create new student
        await createStudent(payload);
        setSuccessMessage(`Student "${payload.name}" enrolled successfully!`);
        setFormData(DEFAULT_FORM);
      }

      // Notify parent component to refresh student list
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 600);
      }
    } catch (err) {
      console.error('API Error:', err);

      // Extract server-side DRF validation errors
      if (err.response && err.response.data) {
        const data = err.response.data;

        // Check for field-specific errors returned by DRF serializer
        const fieldErrors = {};
        const rawErrors = data.errors || data;

        if (typeof rawErrors === 'object' && !Array.isArray(rawErrors)) {
          Object.keys(rawErrors).forEach((key) => {
            const val = rawErrors[key];
            if (Array.isArray(val)) {
              fieldErrors[key] = val.join(' ');
            } else if (typeof val === 'string') {
              fieldErrors[key] = val;
            }
          });
        }

        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
          setServerError(data.message || 'Please fix the highlighted errors below.');
        } else if (data.detail) {
          setServerError(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail));
        } else if (data.error) {
          setServerError(data.error);
        } else {
          setServerError('Server validation failed. Please review your input.');
        }
      } else if (err.request) {
        // Network error (backend server not running or CORS issue)
        setServerError(
          'Network Error: Unable to reach backend server at http://localhost:8000. Please ensure the Django server is running.'
        );
      } else {
        setServerError(err.message || 'An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditMode = Boolean(editingStudent && editingStudent.id);

  return (
    <div className="card" id="student-form-card">
      <div className="card-title">
        <span>{isEditMode ? 'Edit Student Details' : 'Enroll New Student'}</span>
        {isEditMode && (
          <span className="badge badge-inactive" style={{ fontSize: '0.75rem' }}>
            ID #{editingStudent.id}
          </span>
        )}
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="alert alert-success" id="form-success-banner" role="alert">
          <span>✓</span>
          <div>{successMessage}</div>
        </div>
      )}

      {/* Server Error Notification */}
      {serverError && (
        <div className="alert alert-danger" id="form-server-error-banner" role="alert">
          <span>⚠</span>
          <div>{serverError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="student-form" noValidate id="student-form">
        {/* Name */}
        <div className="form-group">
          <label htmlFor="student-name" className="form-label">
            Full Name <span className="required">*</span>
          </label>
          <input
            id="student-name"
            type="text"
            name="name"
            className={`form-control ${errors.name ? 'input-error' : ''}`}
            placeholder="e.g. Jordan Miller"
            value={formData.name}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {errors.name && <div className="field-error">{errors.name}</div>}
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="student-email" className="form-label">
            Email Address <span className="required">*</span>
          </label>
          <input
            id="student-email"
            type="email"
            name="email"
            className={`form-control ${errors.email ? 'input-error' : ''}`}
            placeholder="e.g. j.miller@campus.edu"
            value={formData.email}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {errors.email && <div className="field-error">{errors.email}</div>}
        </div>

        {/* Phone */}
        <div className="form-group">
          <label htmlFor="student-phone" className="form-label">
            Phone Number <span className="required">*</span>
          </label>
          <input
            id="student-phone"
            type="tel"
            name="phone"
            className={`form-control ${errors.phone ? 'input-error' : ''}`}
            placeholder="e.g. +1 (555) 019-2834"
            value={formData.phone}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {errors.phone && <div className="field-error">{errors.phone}</div>}
        </div>

        {/* Date of Birth */}
        <div className="form-group">
          <label htmlFor="student-dob" className="form-label">
            Date of Birth <span className="required">*</span>
          </label>
          <input
            id="student-dob"
            type="date"
            name="date_of_birth"
            className={`form-control ${errors.date_of_birth ? 'input-error' : ''}`}
            value={formData.date_of_birth}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {errors.date_of_birth && <div className="field-error">{errors.date_of_birth}</div>}
        </div>

        {/* Course */}
        <div className="form-group">
          <label htmlFor="student-course" className="form-label">
            Course / Major <span className="required">*</span>
          </label>
          <input
            id="student-course"
            type="text"
            name="course"
            className={`form-control ${errors.course ? 'input-error' : ''}`}
            placeholder="e.g. Computer Science, Data Analytics"
            value={formData.course}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {errors.course && <div className="field-error">{errors.course}</div>}
        </div>

        {/* Status */}
        <div className="form-group">
          <label htmlFor="student-status" className="form-label">
            Enrollment Status
          </label>
          <select
            id="student-status"
            name="status"
            className="form-control"
            value={formData.status}
            onChange={handleChange}
            disabled={isSubmitting}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button
            type="submit"
            id="btn-save-student"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{ flex: 1 }}
          >
            {isSubmitting
              ? isEditMode
                ? 'Updating...'
                : 'Saving...'
              : isEditMode
              ? 'Update Student'
              : 'Add Student'}
          </button>

          {isEditMode && (
            <button
              type="button"
              id="btn-cancel-edit"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
