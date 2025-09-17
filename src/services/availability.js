
// =======================
// services/availability.js
// =======================
import apiClient from './apiClient';

/* =======================
   WORKER AVAILABILITY
======================= */

export const getWorkerAvailability = () => {
  return apiClient.get('/worker-availability');
};

export const setAvailability = (data) => {
  return apiClient.post('/worker-availability', data);
};

export const updateAvailability = (id, data) => {
  return apiClient.put(`/worker-availability/${id}`, data);
};

export const removeAvailability = (id) => {
  return apiClient.delete(`/worker-availability/${id}`);
};

// Admin availability management
export const getAdminWorkerAvailability = (workerId) => {
  return apiClient.get(`/admin/workers/${workerId}/availability`);
};

export const setWorkerAvailability = (workerId, data) => {
  return apiClient.post(`/admin/workers/${workerId}/availability`, data);
};

export const checkScheduleConflicts = () => {
  return apiClient.get('/admin/availability/check-conflicts');
};
