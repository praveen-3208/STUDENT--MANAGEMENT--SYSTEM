/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  GraduationCap,
  Users,
  UserCheck,
  UserX,
  Search,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  FileCode,
  Layers,
  Database,
  Server,
  ArrowRight,
  ExternalLink,
  Code2,
  Copy,
  Check,
} from 'lucide-react';
import { Student, StudentFormData, FormErrors } from './types';

// Initial sample student records (mirrors Django fixture: backend/students/fixtures/students.json)
const INITIAL_STUDENTS: Student[] = [
  {
    id: 1,
    name: 'Alex Morgan',
    email: 'alex.morgan@campus.edu',
    phone: '+1 (555) 234-5678',
    date_of_birth: '2003-04-12',
    course: 'Computer Science',
    enrollment_date: '2024-09-01',
    status: 'active',
  },
  {
    id: 2,
    name: 'Sophia Chen',
    email: 'sophia.chen@campus.edu',
    phone: '+1 (555) 876-5432',
    date_of_birth: '2002-11-28',
    course: 'Data Science',
    enrollment_date: '2024-09-01',
    status: 'active',
  },
  {
    id: 3,
    name: 'Marcus Vance',
    email: 'marcus.vance@campus.edu',
    phone: '+1 (555) 345-6789',
    date_of_birth: '2004-01-15',
    course: 'Electrical Engineering',
    enrollment_date: '2024-09-15',
    status: 'active',
  },
  {
    id: 4,
    name: 'Elena Rostova',
    email: 'elena.rostova@campus.edu',
    phone: '+1 (555) 987-1234',
    date_of_birth: '2001-08-22',
    course: 'Cybersecurity',
    enrollment_date: '2023-01-10',
    status: 'inactive',
  },
  {
    id: 5,
    name: 'David Kim',
    email: 'david.kim@campus.edu',
    phone: '+1 (555) 456-7890',
    date_of_birth: '2003-06-30',
    course: 'Artificial Intelligence',
    enrollment_date: '2024-09-20',
    status: 'active',
  },
];

const DEFAULT_FORM: StudentFormData = {
  name: '',
  email: '',
  phone: '',
  date_of_birth: '',
  course: '',
  status: 'active',
};

// Source code snippets for interactive Architecture & Code Inspector
const SOURCE_CODE_MAP = {
  'models.py': {
    title: 'backend/students/models.py',
    desc: 'Django Student entity model with fields, choices, constraints, and auto enrollment date.',
    language: 'python',
    code: `from django.db import models

class Student(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]

    name = models.CharField(max_length=150, blank=False, null=False)
    email = models.EmailField(unique=True, blank=False, null=False)
    phone = models.CharField(max_length=30, blank=False, null=False)
    date_of_birth = models.DateField(blank=False, null=False)
    course = models.CharField(max_length=120, blank=False, null=False)
    enrollment_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')

    class Meta:
        ordering = ['-id']
        verbose_name = 'Student'
        verbose_name_plural = 'Students'

    def __str__(self):
        return f"{self.name} ({self.email}) - {self.course}"`,
  },
  'serializers.py': {
    title: 'backend/students/serializers.py',
    desc: 'DRF ModelSerializer with field-level format validation and duplicate email check.',
    language: 'python',
    code: `import re
from rest_framework import serializers
from .models import Student

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['id', 'name', 'email', 'phone', 'date_of_birth', 'course', 'enrollment_date', 'status']
        read_only_fields = ['id', 'enrollment_date']

    def validate_name(self, value):
        clean_name = value.strip()
        if not clean_name:
            raise serializers.ValidationError("Student name cannot be empty.")
        return clean_name

    def validate_email(self, value):
        clean_email = value.strip().lower()
        email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$'
        if not re.match(email_regex, clean_email):
            raise serializers.ValidationError("Please provide a valid email address.")

        query = Student.objects.filter(email__iexact=clean_email)
        if self.instance:
            query = query.exclude(pk=self.instance.pk)
        if query.exists():
            raise serializers.ValidationError(
                f"A student with email '{clean_email}' already exists. Please use a unique email."
            )
        return clean_email

    def validate_phone(self, value):
        clean_phone = value.strip()
        if not re.match(r'^[0-9+\\-()\\s]{7,25}$', clean_phone):
            raise serializers.ValidationError("Invalid phone format.")
        return clean_phone`,
  },
  'views.py': {
    title: 'backend/students/views.py',
    desc: 'StudentViewSet (ModelViewSet) with full CRUD, 400 validation, and explicit 404 handler.',
    language: 'python',
    code: `from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError
from .models import Student
from .serializers import StudentSerializer

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all().order_by('-id')
    serializer_class = StudentSerializer

    def get_object(self):
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        pk = self.kwargs.get(lookup_url_kwarg)
        try:
            return super().get_object()
        except Exception:
            raise NotFound(detail={"error": "Student Not Found", "detail": f"Student with ID '{pk}' does not exist.", "status_code": 404})

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Validation Error", "errors": serializer.errors, "status_code": 400}, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        return Response({"message": "Student created successfully.", "data": serializer.data}, status=status.HTTP_201_CREATED)`,
  },
  'api.js': {
    title: 'frontend/src/api.js',
    desc: 'Axios API methods: getStudents, getStudent, createStudent, updateStudent, deleteStudent.',
    language: 'javascript',
    code: `import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/students/';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

export const getStudents = async (params = {}) => {
  const res = await apiClient.get('/', { params });
  return Array.isArray(res.data) ? res.data : (res.data.results || res.data);
};

export const getStudent = async (id) => (await apiClient.get(\`/\${id}/\`)).data;
export const createStudent = async (data) => (await apiClient.post('/', data)).data;
export const updateStudent = async (id, data) => (await apiClient.put(\`/\${id}/\`, data)).data;
export const deleteStudent = async (id) => (await apiClient.delete(\`/\${id}/\`)).data;`,
  },
  'accounts/views.py': {
    title: 'backend/accounts/views.py',
    desc: 'Authentication views using TokenAuthentication (Login, Register, Logout).',
    language: 'python',
    code: `from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from .serializers import UserSerializer, RegisterSerializer

class LoginView(APIView):
    permission_classes = (AllowAny,)
    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({"token": token.key, "user": UserSerializer(user).data})
        return Response({"error": "Invalid credentials provided."}, status=status.HTTP_400_BAD_REQUEST)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)
    def post(self, request):
        request.user.auth_token.delete()
        return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)`,
  },
  'settings.py': {
    title: 'backend/sms_backend/settings.py (extract)',
    desc: 'CORS configuration, REST framework settings, and SQLite database setup.',
    language: 'python',
    code: `INSTALLED_APPS = [
    ...
    'rest_framework',
    'corsheaders',
    'students.apps.StudentsConfig',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    ...
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]`,
  },
};

type ViewTab = 'app' | 'code' | 'docs';

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>('app');
  const [selectedCodeFile, setSelectedCodeFile] = useState<keyof typeof SOURCE_CODE_MAP>('models.py');
  const [copiedCode, setCopiedCode] = useState(false);

  // Auth state mock
  const [user, setUser] = useState<{username: string, email?: string} | null>(() => {
    try {
      const token = localStorage.getItem('sms_auth_token_mock');
      if (token) {
        const username = token.split('-')[0] || 'User';
        const email = localStorage.getItem('sms_auth_email_mock') || `${username}@example.com`;
        return { username, email };
      }
    } catch {}
    return null;
  });
  
  const [authView, setAuthView] = useState<'login' | 'register' | 'profile'>('login');
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '', confirm_password: '' });
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    
    if (authView === 'profile') {
      // Mock profile update
      localStorage.setItem('sms_auth_email_mock', authForm.email);
      localStorage.setItem('sms_auth_token_mock', `${authForm.username}-token-12345`);
      setUser({ username: authForm.username, email: authForm.email });
      setAuthSuccess('Profile updated successfully!');
      return;
    }
    if (authView === 'register') {
      if (authForm.password !== authForm.confirm_password) {
        setAuthError('Passwords do not match.');
        return;
      }
      if (authForm.password.length < 8) {
        setAuthError('Password must be at least 8 characters.');
        return;
      }
      // Mock register success
      alert('Registration successful! Please sign in.');
      setAuthView('login');
      setAuthForm({ ...authForm, password: '', confirm_password: '' });
    } else {
      if (!authForm.username || !authForm.password) {
        setAuthError('Please provide credentials.');
        return;
      }
      // Mock login
      localStorage.setItem('sms_auth_token_mock', `${authForm.username}-token-12345`);
      setUser({ username: authForm.username });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sms_auth_token_mock');
    setUser(null);
  };

  // Student records state (persisted to localStorage for realistic simulation)
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('sms_students_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_STUDENTS;
  });

  const [loading, setLoading] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<StudentFormData>(DEFAULT_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');

  // Deletion modal state
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sms_students_data', JSON.stringify(students));
    } catch {
      // Ignore
    }
  }, [students]);

  // Sync editing student into form
  useEffect(() => {
    if (editingStudent) {
      setFormData({
        name: editingStudent.name,
        email: editingStudent.email,
        phone: editingStudent.phone,
        date_of_birth: editingStudent.date_of_birth,
        course: editingStudent.course,
        status: editingStudent.status,
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

  // Handle text input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  /**
   * Client-side validation:
   * Required fields, email format, phone digits, past date of birth.
   */
  const validateClientForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address (e.g. name@campus.edu).';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (!/^[0-9+\-()\s]{7,25}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number (digits, +, -, ()).';
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required.';
    } else {
      const dob = new Date(formData.date_of_birth);
      const today = new Date();
      if (dob >= today) {
        newErrors.date_of_birth = 'Date of birth must be in the past.';
      }
    }

    if (!formData.course.trim()) {
      newErrors.course = 'Enrolled course is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Server-side simulated validation:
   * Matches Django REST Framework's unique email validation and field constraints.
   */
  const validateServerSide = (payload: StudentFormData, targetId?: number): string | null => {
    const normalizedEmail = payload.email.trim().toLowerCase();
    const duplicate = students.find(
      (s) => s.email.toLowerCase() === normalizedEmail && s.id !== targetId
    );

    if (duplicate) {
      return `A student with email '${normalizedEmail}' already exists. Please use a unique email address.`;
    }
    return null;
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    if (!validateClientForm()) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Check server validation (e.g. duplicate email)
      const duplicateError = validateServerSide(
        formData,
        editingStudent ? editingStudent.id : undefined
      );

      if (duplicateError) {
        setServerError(duplicateError);
        setErrors((prev) => ({ ...prev, email: duplicateError }));
        setIsSubmitting(false);
        return;
      }

      if (editingStudent) {
        // Update student
        setStudents((prev) =>
          prev.map((s) =>
            s.id === editingStudent.id
              ? {
                  ...s,
                  name: formData.name.trim(),
                  email: formData.email.trim().toLowerCase(),
                  phone: formData.phone.trim(),
                  date_of_birth: formData.date_of_birth,
                  course: formData.course.trim(),
                  status: formData.status,
                }
              : s
          )
        );
        setSuccessMessage(`Student "${formData.name.trim()}" updated successfully!`);
        setEditingStudent(null);
      } else {
        // Create new student
        const newId = students.length > 0 ? Math.max(...students.map((s) => s.id)) + 1 : 1;
        const today = new Date().toISOString().split('T')[0];
        const newStudent: Student = {
          id: newId,
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          date_of_birth: formData.date_of_birth,
          course: formData.course.trim(),
          enrollment_date: today,
          status: formData.status,
        };

        setStudents((prev) => [newStudent, ...prev]);
        setSuccessMessage(`Student "${newStudent.name}" enrolled successfully! (ID: #${newStudent.id})`);
        setFormData(DEFAULT_FORM);
      }

      setIsSubmitting(false);
    }, 300);
  };

  // Delete Action
  const confirmDeleteStudent = () => {
    if (!studentToDelete) return;
    setIsDeleting(true);

    setTimeout(() => {
      setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
      if (editingStudent?.id === studentToDelete.id) {
        setEditingStudent(null);
      }
      setStudentToDelete(null);
      setIsDeleting(false);
      setSuccessMessage(`Student record #${studentToDelete.id} was deleted successfully.`);
    }, 200);
  };

  // Reset sample data
  const handleResetData = () => {
    setStudents(INITIAL_STUDENTS);
    setEditingStudent(null);
    setSuccessMessage('Database reset to initial 5 sample student records.');
  };

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        student.course.toLowerCase().includes(query);

      const matchesCourse =
        courseFilter === 'all' || student.course.toLowerCase() === courseFilter.toLowerCase();

      return matchesSearch && matchesCourse;
    });
  }, [students, searchTerm, courseFilter]);

  // Unique courses for filter
  const courseOptions = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.course).filter(Boolean))).sort();
  }, [students]);

  // Metrics
  const totalCount = students.length;
  const activeCount = students.filter((s) => s.status === 'active').length;
  const inactiveCount = totalCount - activeCount;

  // Copy code helper
  const handleCopyCode = () => {
    navigator.clipboard.writeText(SOURCE_CODE_MAP[selectedCodeFile].code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                Student Management System
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                React 18 (Vite) + Django REST Framework + SQLite
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {user && (
              <>
                <button
                  onClick={() => {
                    setAuthView('profile');
                    setAuthForm(prev => ({ ...prev, username: user.username, email: user.email || '' }));
                    setAuthSuccess('');
                    setAuthError('');
                  }}
                  className="px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors text-slate-700 hover:text-slate-900 hover:bg-slate-200 mr-2 border border-transparent"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 mr-2 border border-red-100"
                >
                  Logout ({user.username})
                </button>
              </>
            )}
            <button
              id="tab-app-preview"
              onClick={() => setActiveTab('app')}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'app'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Live Application</span>
            </button>
            <button
              id="tab-code-inspector"
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'code'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Code Inspector</span>
            </button>
            <button
              id="tab-docs-instructions"
              onClick={() => setActiveTab('docs')}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'docs'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Setup Guide</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab 1: Live Interactive CRUD App */}
        {activeTab === 'app' && user && authView === 'profile' && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-white p-8 rounded-xl shadow-xs border border-slate-200 w-full max-w-md">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    🎓
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">My Profile</h2>
                </div>
                <button
                  onClick={() => setAuthView('login')}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>

              {authError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4 border border-red-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}
              {authSuccess && (
                <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-4 border border-green-200 flex items-start gap-2">
                  <span className="mt-0.5 shrink-0">✓</span>
                  <span>{authSuccess}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={authForm.username}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={authForm.email}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition mt-2"
                >
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'app' && !user && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-white p-8 rounded-xl shadow-xs border border-slate-200 w-full max-w-md">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold mx-auto mb-4 text-xl">
                  🎓
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {authView === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {authView === 'login' ? 'Sign in to manage student records.' : 'Sign up for the Student Management System.'}
                </p>
              </div>

              {authError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4 border border-red-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={authForm.username}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden"
                  />
                </div>
                
                {authView === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={authForm.email}
                      onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={authForm.password}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden"
                  />
                </div>

                {authView === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={authForm.confirm_password}
                      onChange={(e) => setAuthForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition mt-2"
                >
                  {authView === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-slate-600">
                {authView === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => {
                    setAuthView(authView === 'login' ? 'register' : 'login');
                    setAuthError('');
                  }}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  {authView === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'app' && user && authView !== 'profile' && (
          <div className="space-y-6">
            {/* Quick Metrics & System Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{totalCount}</div>
                  <div className="text-xs text-slate-500 font-medium">Total Students</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-700">{activeCount}</div>
                  <div className="text-xs text-slate-500 font-medium">Active Enrolled</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                  <UserX className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-700">{inactiveCount}</div>
                  <div className="text-xs text-slate-500 font-medium">Inactive</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">SQLite DB</div>
                    <div className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Ready & Seeded
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleResetData}
                  title="Reset sample students"
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Global Success / Error Alerts */}
            {successMessage && (
              <div
                id="global-success-banner"
                className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-sm font-medium">{successMessage}</span>
                </div>
                <button
                  onClick={() => setSuccessMessage('')}
                  className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold"
                >
                  Dismiss
                </button>
              </div>
            )}

            {serverError && (
              <div
                id="global-error-banner"
                className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <span className="text-sm font-medium">{serverError}</span>
                </div>
                <button
                  onClick={() => setServerError('')}
                  className="text-red-700 hover:text-red-900 text-xs font-semibold"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Main 2-Column Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Student Form (Create / Edit) */}
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                      {editingStudent ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                    <h2 className="text-base font-bold text-slate-900">
                      {editingStudent ? 'Edit Student Details' : 'Enroll New Student'}
                    </h2>
                  </div>
                  {editingStudent && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      ID #{editingStudent.id}
                    </span>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate id="student-form">
                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="input-name"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="input-name"
                      type="text"
                      name="name"
                      placeholder="e.g. Jordan Miller"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 text-sm rounded-lg border ${
                        errors.name
                          ? 'border-red-500 bg-red-50/30'
                          : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      } outline-hidden transition`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-600 font-medium">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="input-email"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="input-email"
                      type="email"
                      name="email"
                      placeholder="e.g. j.miller@campus.edu"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 text-sm rounded-lg border ${
                        errors.email
                          ? 'border-red-500 bg-red-50/30'
                          : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      } outline-hidden transition`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600 font-medium">{errors.email}</p>
                    )}
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      Enforces unique email across all student records.
                    </span>
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="input-phone"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="input-phone"
                      type="tel"
                      name="phone"
                      placeholder="e.g. +1 (555) 019-2834"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 text-sm rounded-lg border ${
                        errors.phone
                          ? 'border-red-500 bg-red-50/30'
                          : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      } outline-hidden transition`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-600 font-medium">{errors.phone}</p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label
                      htmlFor="input-dob"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="input-dob"
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 text-sm rounded-lg border ${
                        errors.date_of_birth
                          ? 'border-red-500 bg-red-50/30'
                          : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      } outline-hidden transition`}
                    />
                    {errors.date_of_birth && (
                      <p className="mt-1 text-xs text-red-600 font-medium">
                        {errors.date_of_birth}
                      </p>
                    )}
                  </div>

                  {/* Course */}
                  <div>
                    <label
                      htmlFor="input-course"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Course / Major <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="input-course"
                      type="text"
                      name="course"
                      placeholder="e.g. Computer Science, Robotics"
                      value={formData.course}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 text-sm rounded-lg border ${
                        errors.course
                          ? 'border-red-500 bg-red-50/30'
                          : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      } outline-hidden transition`}
                    />
                    {errors.course && (
                      <p className="mt-1 text-xs text-red-600 font-medium">{errors.course}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <label
                      htmlFor="input-status"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Enrollment Status
                    </label>
                    <select
                      id="input-status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden transition"
                    >
                      <option value="active">Active (Enrolled)</option>
                      <option value="inactive">Inactive (Suspended / On Leave)</option>
                    </select>
                  </div>

                  {/* Form Action Buttons */}
                  <div className="pt-2 flex gap-2">
                    <button
                      type="submit"
                      id="btn-submit-student"
                      disabled={isSubmitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-2 px-4 rounded-lg text-sm shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : editingStudent ? (
                        <>
                          <Pencil className="w-4 h-4" />
                          <span>Update Student</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Enroll Student</span>
                        </>
                      )}
                    </button>

                    {editingStudent && (
                      <button
                        type="button"
                        id="btn-cancel-edit-mode"
                        onClick={() => setEditingStudent(null)}
                        className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Right Column: Student Table, Search & Filter */}
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="search-students-filter"
                      type="text"
                      placeholder="Search by name, email, or course..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden"
                    />
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <label htmlFor="select-course-filter" className="text-xs font-semibold text-slate-600">
                      Course:
                    </label>
                    <select
                      id="select-course-filter"
                      value={courseFilter}
                      onChange={(e) => setCourseFilter(e.target.value)}
                      className="px-2.5 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 outline-hidden"
                    >
                      <option value="all">All Courses ({students.length})</option>
                      {courseOptions.map((course) => (
                        <option key={course} value={course}>
                          {course}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setCourseFilter('all');
                      }}
                      className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 text-xs font-medium"
                      title="Clear filters"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Students Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-700">
                      <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                        <tr>
                          <th className="px-4 py-3">ID</th>
                          <th className="px-4 py-3">Student Name</th>
                          <th className="px-4 py-3">Contact</th>
                          <th className="px-4 py-3">Course</th>
                          <th className="px-4 py-3">DOB</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredStudents.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                              <GraduationCap className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                              <p className="font-medium text-slate-700">No students found</p>
                              <p className="text-xs text-slate-400 mt-1">
                                {searchTerm || courseFilter !== 'all'
                                  ? 'No records match your search filter criteria.'
                                  : 'Enroll your first student using the form on the left.'}
                              </p>
                            </td>
                          </tr>
                        ) : (
                          filteredStudents.map((student) => (
                            <tr
                              key={student.id}
                              id={`row-student-${student.id}`}
                              className="hover:bg-slate-50/80 transition-colors"
                            >
                              <td className="px-4 py-3 font-mono text-xs text-slate-400">
                                #{student.id}
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-semibold text-slate-900">{student.name}</div>
                                <div className="text-xs text-slate-400">
                                  Enrolled: {student.enrollment_date}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-blue-600 font-medium hover:underline">
                                  <a href={`mailto:${student.email}`}>{student.email}</a>
                                </div>
                                <div className="text-xs text-slate-500">{student.phone}</div>
                              </td>
                              <td className="px-4 py-3 font-medium text-slate-800">
                                {student.course}
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-600">
                                {student.date_of_birth}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                    student.status === 'active'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                                  }`}
                                >
                                  {student.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    id={`btn-edit-student-${student.id}`}
                                    onClick={() => setEditingStudent(student)}
                                    title="Edit student"
                                    className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    id={`btn-delete-student-${student.id}`}
                                    onClick={() => setStudentToDelete(student)}
                                    title="Delete student"
                                    className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Interactive Code Inspector */}
        {activeTab === 'code' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="border-b border-slate-200 p-4 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-blue-600" />
                  Django & React Source Code Browser
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspect the actual code generated in <code className="bg-slate-200 px-1 rounded">backend/</code> and <code className="bg-slate-200 px-1 rounded">frontend/</code>.
                </p>
              </div>

              {/* Code file selector tabs */}
              <div className="flex flex-wrap gap-1">
                {(Object.keys(SOURCE_CODE_MAP) as Array<keyof typeof SOURCE_CODE_MAP>).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCodeFile(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                      selectedCodeFile === key
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            {/* Code view header */}
            <div className="px-6 py-3 bg-slate-900 text-slate-300 text-xs font-mono flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span className="ml-2 text-slate-200 font-semibold">
                  {SOURCE_CODE_MAP[selectedCodeFile].title}
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-md transition"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            <div className="p-4 bg-slate-900 overflow-x-auto text-slate-100 text-xs font-mono leading-relaxed">
              <pre>
                <code>{SOURCE_CODE_MAP[selectedCodeFile].code}</code>
              </pre>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
              <strong>Key Architectural Role:</strong> {SOURCE_CODE_MAP[selectedCodeFile].desc}
            </div>
          </div>
        )}

        {/* Tab 3: Setup & Architecture Documentation */}
        {activeTab === 'docs' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Student Management System - Architecture & Setup Guide
              </h2>
              <p className="text-sm text-slate-600">
                Complete instructions for running both the Django REST Framework backend and React Vite frontend locally.
              </p>
            </div>

            {/* Quick Architecture Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50">
                <div className="font-bold text-blue-900 text-sm mb-1 flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-600" />
                  Django + DRF Backend
                </div>
                <p className="text-xs text-slate-600">
                  Runs on port 8000 with <code>StudentViewSet</code> exposing full CRUD, field-level validations, unique email rules, and CORS configuration.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50">
                <div className="font-bold text-emerald-900 text-sm mb-1 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  React + Vite Frontend
                </div>
                <p className="text-xs text-slate-600">
                  Runs on port 5173 with modular components, client-side validation, Axios API functions, live search, and delete modals.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/50">
                <div className="font-bold text-purple-900 text-sm mb-1 flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-600" />
                  SQLite Persistence
                </div>
                <p className="text-xs text-slate-600">
                  Zero-config relational database with migrations and sample fixtures pre-populated with 5 active and inactive student records.
                </p>
              </div>
            </div>

            {/* Terminal Commands Guide */}
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                  Run Django REST Framework Backend
                </h3>
                <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs space-y-2 overflow-x-auto">
                  <div className="text-slate-400"># Navigate to backend and create virtual environment</div>
                  <div className="text-emerald-400">cd backend</div>
                  <div>python3 -m venv venv</div>
                  <div>source venv/bin/activate <span className="text-slate-500"># (on Windows: .\venv\Scripts\activate)</span></div>
                  <br />
                  <div className="text-slate-400"># Install dependencies & run migrations</div>
                  <div>pip install -r requirements.txt</div>
                  <div>python manage.py makemigrations</div>
                  <div>python manage.py migrate</div>
                  <br />
                  <div className="text-slate-400"># (Optional) Load sample students fixture & start server</div>
                  <div>python manage.py loaddata students/fixtures/students.json</div>
                  <div className="text-yellow-300 font-semibold">python manage.py runserver 8000</div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                  Run React Frontend (Vite)
                </h3>
                <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs space-y-2 overflow-x-auto">
                  <div className="text-slate-400"># In a second terminal, navigate to frontend</div>
                  <div className="text-emerald-400">cd frontend</div>
                  <br />
                  <div className="text-slate-400"># Install packages & start dev server</div>
                  <div>npm install</div>
                  <div className="text-yellow-300 font-semibold">npm run dev</div>
                  <br />
                  <div className="text-slate-400"># Access the UI at:</div>
                  <div className="text-blue-400">http://localhost:5173</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div
          id="modal-delete-confirmation"
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Confirm Student Deletion</h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Are you sure you want to delete student <strong>{studentToDelete.name}</strong> (
              <span className="text-blue-600">{studentToDelete.email}</span>)?
              <br />
              <br />
              This action cannot be undone and will permanently remove their record from the database.
            </p>

            <div className="flex justify-end gap-3">
              <button
                id="btn-cancel-modal-delete"
                onClick={() => setStudentToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-modal-delete"
                onClick={confirmDeleteStudent}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition flex items-center gap-2"
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
