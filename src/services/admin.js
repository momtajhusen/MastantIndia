
// =======================
// services/admin.js
// =======================
import apiClient from './apiClient';

/* =======================
   ADMIN MANAGEMENT
======================= */

export const getDashboardStats = () => {
  return apiClient.get('/admin/dashboard');
};

// Performance management
export const getAllWorkerPerformance = () => {
  return apiClient.get('/admin/performance/workers');
};

export const getWorkerPerformanceDetail = (id) => {
  return apiClient.get(`/admin/performance/workers/${id}`);
};

export const calculatePerformance = () => {
  return apiClient.post('/admin/performance/calculate');
};

export const generatePerformanceReports = () => {
  return apiClient.get('/admin/performance/reports');
};

// Emergency contacts
export const getEmergencyContacts = (workerId) => {
  return apiClient.get(`/admin/workers/${workerId}/emergency-contacts`);
};

export const createEmergencyContact = (workerId, data) => {
  return apiClient.post(`/admin/workers/${workerId}/emergency-contacts`, data);
};

export const updateEmergencyContact = (workerId, id, data) => {
  return apiClient.put(`/admin/workers/${workerId}/emergency-contacts/${id}`, data);
};

export const deleteEmergencyContact = (workerId, id) => {
  return apiClient.delete(`/admin/workers/${workerId}/emergency-contacts/${id}`);
};

export const setPrimaryContact = (workerId, id) => {
  return apiClient.post(`/admin/workers/${workerId}/emergency-contacts/${id}/set-primary`);
};

// Worker skills
export const getWorkerSkills = (workerId) => {
  return apiClient.get(`/admin/workers/${workerId}/skills`);
};

export const createWorkerSkill = (workerId, data) => {
  return apiClient.post(`/admin/workers/${workerId}/skills`, data);
};

export const updateWorkerSkill = (workerId, id, data) => {
  return apiClient.put(`/admin/workers/${workerId}/skills/${id}`, data);
};

export const deleteWorkerSkill = (workerId, id) => {
  return apiClient.delete(`/admin/workers/${workerId}/skills/${id}`);
};

export const verifyWorkerSkill = (workerId, id) => {
  return apiClient.post(`/admin/workers/${workerId}/skills/${id}/verify`);
};
