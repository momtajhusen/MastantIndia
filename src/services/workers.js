
// =======================
// services/workers.js
// =======================
import apiClient from './apiClient';

/* =======================
   WORKERS
======================= */

// Public worker APIs
export const getWorkers = (params) => {
  return apiClient.get('/workers', { params });
};

export const getWorkerById = (id) => {
  return apiClient.get(`/workers/${id}`);
};

export const getWorkersByCategory = (categoryId) => {
  return apiClient.get(`/workers/category/${categoryId}`);
};

// Worker specific APIs
export const getWorkerProfile = () => {
  return apiClient.get('/worker/profile');
};

export const updateWorkerProfile = (data) => {
  return apiClient.put('/worker/profile', data);
};

export const updateWorkerAvailability = (data) => {
  return apiClient.put('/worker/availability', data);
};

export const getWorkerBookings = () => {
  return apiClient.get('/worker/bookings');
};

export const getWorkerPerformance = () => {
  return apiClient.get('/worker/performance');
};

export const getWorkerAttendance = () => {
  return apiClient.get('/worker/attendance');
};

// Admin worker management
export const getAdminWorkers = () => {
  return apiClient.get('/admin/workers');
};

export const createWorker = (data) => {
  return apiClient.post('/admin/workers', data);
};

export const getAdminWorker = (id) => {
  return apiClient.get(`/admin/workers/${id}`);
};

export const updateWorkerStatus = (id, data) => {
  return apiClient.put(`/admin/workers/${id}/status`, data);
};

export const getWorkerAnalytics = (id) => {
  return apiClient.get(`/admin/workers/${id}/analytics`);
};
