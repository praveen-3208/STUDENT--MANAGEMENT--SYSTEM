import axios from 'axios';

/**
 * Base URL for the Django REST Framework students endpoint.
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';

// Create an Axios instance with default headers and timeout
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
});

// Interceptor to attach token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('sms_auth_token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

/**
 * Authentication Endpoints
 */
export const loginUser = async (credentials) => {
  const response = await apiClient.post('auth/login/', credentials);
  if (response.data.token) {
    localStorage.setItem('sms_auth_token', response.data.token);
  }
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await apiClient.post('auth/register/', userData);
  return response.data;
};

export const logoutUser = async () => {
  try {
    await apiClient.post('auth/logout/');
  } catch (err) {
    // ignore
  } finally {
    localStorage.removeItem('sms_auth_token');
  }
};

export const getMe = async () => {
  const response = await apiClient.get('auth/me/');
  return response.data;
};

export const updateMe = async (data) => {
  const response = await apiClient.put('auth/me/', data);
  return response.data;
};

/**
 * Fetch all students, with optional query parameters (e.g. search, course, status).
 */
export const getStudents = async (params = {}) => {
  const response = await apiClient.get('students/', { params });
  return Array.isArray(response.data) ? response.data : (response.data.results || response.data);
};

/**
 * Fetch a single student record by its unique identifier.
 */
export const getStudent = async (id) => {
  const response = await apiClient.get(`students/${id}/`);
  return response.data;
};

/**
 * Create a new student record.
 */
export const createStudent = async (data) => {
  const response = await apiClient.post('students/', data);
  return response.data;
};

/**
 * Update an existing student record.
 */
export const updateStudent = async (id, data) => {
  const response = await apiClient.put(`students/${id}/`, data);
  return response.data;
};

/**
 * Delete a student record by ID.
 */
export const deleteStudent = async (id) => {
  const response = await apiClient.delete(`students/${id}/`);
  return response.data;
};

export default {
  loginUser,
  registerUser,
  logoutUser,
  getMe,
  updateMe,
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
};
