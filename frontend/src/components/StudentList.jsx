import React, { useState } from 'react';
import { deleteStudent } from '../api';

/**
 * StudentList Component:
 * - Renders a responsive table with student records: Name, Email, Phone, Course, Status, Actions.
 * - Provides search and filter controls by student name and course.
 * - Handles Edit trigger (passing student object to parent for form pre-filling).
 * - Implements a clean Delete confirmation modal before calling the delete API.
 * - Automatically triggers parent list refresh after deletion.
 */
export default function StudentList({
  students = [],
  loading = false,
  error = '',
  onEdit,
  onRefresh,
  searchTerm = '',
  setSearchTerm,
  courseFilter = 'all',
  setCourseFilter,
}) {
  // Modal state for delete confirmation
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Extract unique course names for the course dropdown filter
  const courseOptions = Array.from(
    new Set(students.map((s) => s.course).filter(Boolean))
  ).sort();

  // Apply client-side search and course filtering
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      !searchTerm ||
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCourse =
      courseFilter === 'all' ||
      student.course.toLowerCase() === courseFilter.toLowerCase();

    return matchesSearch && matchesCourse;
  });

  // Open confirmation modal
  const promptDelete = (student) => {
    setDeleteError('');
    setStudentToDelete(student);
  };

  // Close confirmation modal
  const cancelDelete = () => {
    if (isDeleting) return;
    setStudentToDelete(null);
    setDeleteError('');
  };

  // Execute delete API call
  const confirmDelete = async () => {
    if (!studentToDelete) return;

    setIsDeleting(true);
    setDeleteError('');

    try {
      await deleteStudent(studentToDelete.id);
      setStudentToDelete(null);
      // Automatically refresh the student list
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to delete student:', err);
      if (err.response && err.response.data && err.response.data.detail) {
        setDeleteError(err.response.data.detail);
      } else if (err.request) {
        setDeleteError('Network error: Could not reach Django server to delete student.');
      } else {
        setDeleteError(err.message || 'Failed to delete student record.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="card" id="student-list-card">
      <div className="card-title">
        <span>Enrolled Students</span>
        <span className="badge badge-active" id="student-count-badge">
          {filteredStudents.length} {filteredStudents.length === 1 ? 'Record' : 'Records'}
        </span>
      </div>

      {/* Toolbar: Search and Course Filter */}
      <div className="toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            id="student-search-input"
            type="text"
            className="form-control search-input"
            placeholder="Search by name, email, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="course-filter-select" className="form-label" style={{ margin: 0 }}>
            Course:
          </label>
          <select
            id="course-filter-select"
            className="form-control"
            style={{ width: 'auto', minWidth: '160px' }}
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
          >
            <option value="all">All Courses</option>
            {courseOptions.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>

          <button
            type="button"
            id="btn-refresh-list"
            className="btn btn-secondary btn-sm"
            onClick={onRefresh}
            title="Refresh list from server"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Error alert if backend communication failed */}
      {error && (
        <div className="alert alert-danger" id="list-error-banner" role="alert">
          <span>⚠</span>
          <div style={{ flex: 1 }}>
            <strong>Connection Notice:</strong> {error}
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={onRefresh}
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="empty-state" id="students-loading-state">
          <div className="empty-state-icon">⏳</div>
          <p>Loading student records from server...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        /* Empty State */
        <div className="empty-state" id="students-empty-state">
          <div className="empty-state-icon">🎓</div>
          <h3>No students found</h3>
          <p style={{ marginTop: '6px' }}>
            {searchTerm || courseFilter !== 'all'
              ? 'Try adjusting your search criteria or filter options.'
              : 'Use the form to enroll your first student!'}
          </p>
        </div>
      ) : (
        /* Responsive Students Table */
        <div className="table-responsive">
          <table className="student-table" id="students-data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Course</th>
                <th>DOB</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} id={`student-row-${student.id}`}>
                  <td>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                      #{student.id}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--text-main)' }}>{student.name}</strong>
                  </td>
                  <td>
                    <a
                      href={`mailto:${student.email}`}
                      style={{ color: 'var(--primary)', textDecoration: 'none' }}
                    >
                      {student.email}
                    </a>
                  </td>
                  <td>{student.phone}</td>
                  <td>{student.course}</td>
                  <td>{student.date_of_birth}</td>
                  <td>
                    <span
                      className={`badge ${
                        student.status === 'active' ? 'badge-active' : 'badge-inactive'
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons" style={{ justifyContent: 'center' }}>
                      <button
                        type="button"
                        id={`btn-edit-${student.id}`}
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => onEdit(student)}
                        title="Edit student"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        id={`btn-delete-${student.id}`}
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => promptDelete(student)}
                        title="Delete student"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="modal-backdrop" id="delete-confirmation-modal">
          <div className="modal-content" role="dialog" aria-modal="true">
            <div className="modal-header">Confirm Deletion</div>
            <div className="modal-body">
              Are you sure you want to delete student{' '}
              <strong>{studentToDelete.name}</strong> (
              <span style={{ color: 'var(--primary)' }}>{studentToDelete.email}</span>)?
              <br />
              <br />
              This action cannot be undone and will permanently remove their enrollment record.
              {deleteError && (
                <div className="alert alert-danger" style={{ marginTop: '12px' }}>
                  {deleteError}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                id="btn-cancel-delete"
                className="btn btn-secondary"
                onClick={cancelDelete}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-delete"
                className="btn btn-danger"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Student'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
