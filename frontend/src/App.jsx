import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import StudentList from './components/StudentList';
import StudentForm from './components/StudentForm';
import { getStudents } from './api';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

/**
 * Dashboard Component (Protected Route)
 */
function Dashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Fetch all students from the Django backend API
  const fetchStudentsList = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getStudents();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load students:', err);
      if (err.request && !err.response) {
        setError(
          'Django REST API is not reachable at http://localhost:8000/api/. Make sure your Django backend server is running.'
        );
      } else if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError(err.message || 'Unable to fetch students.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchStudentsList();
  }, [fetchStudentsList]);

  // Set student for editing
  const handleEdit = (student) => {
    setEditingStudent(student);
    const formEl = document.getElementById('student-form-card');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
  };

  const handleFormSuccess = () => {
    setEditingStudent(null);
    fetchStudentsList();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === 'active').length;
  const inactiveStudents = totalStudents - activeStudents;

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">🎓</div>
          <div>
            <h1 className="brand-title">Student Management System</h1>
            <p className="brand-subtitle">
              Welcome, {user?.username || 'User'}!
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="badge badge-active" title="Active students count">
            Active: {activeStudents}
          </span>
          <span className="badge badge-inactive" title="Inactive students count">
            Inactive: {inactiveStudents}
          </span>
          <span
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              borderLeft: '1px solid var(--border)',
              paddingLeft: '12px',
              paddingRight: '12px'
            }}
          >
            Total: <strong>{totalStudents}</strong>
          </span>
          <Link to="/profile" className="btn btn-secondary btn-sm" style={{ marginRight: '4px' }}>
            Profile
          </Link>
          <button onClick={handleLogout} className="btn btn-danger btn-sm">
            Logout
          </button>
        </div>
      </header>

      <main className="main-layout">
        <section aria-labelledby="form-heading">
          <StudentForm
            editingStudent={editingStudent}
            onSuccess={handleFormSuccess}
            onCancel={handleCancelEdit}
          />
        </section>

        <section aria-labelledby="list-heading">
          <StudentList
            students={students}
            loading={loading}
            error={error}
            onEdit={handleEdit}
            onRefresh={fetchStudentsList}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            courseFilter={courseFilter}
            setCourseFilter={setCourseFilter}
          />
        </section>
      </main>
    </div>
  );
}

/**
 * Main Application Component
 */
export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
      <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" replace />} />
      <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}
