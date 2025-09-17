// =======================
// services/training.js
// =======================
import apiClient from './apiClient';

/* =======================
   TRAINING SYSTEM
======================= */

// Worker training APIs
export const getWorkerTrainingModules = () => {
  return apiClient.get('/worker/training/modules');
};

export const startTrainingModule = (id) => {
  return apiClient.post(`/worker/training/modules/${id}/start`);
};

export const completeVideo = (id) => {
  return apiClient.post(`/worker/training/modules/${id}/complete-video`);
};

export const submitQuiz = (id, data) => {
  return apiClient.post(`/worker/training/modules/${id}/submit-quiz`, data);
};

export const getTrainingProgress = () => {
  return apiClient.get('/worker/training/progress');
};

// Admin training management
export const getAdminTrainingModules = () => {
  return apiClient.get('/admin/training/modules');
};

export const createTrainingModule = (data) => {
  return apiClient.post('/admin/training/modules', data);
};

export const updateTrainingModule = (id, data) => {
  return apiClient.put(`/admin/training/modules/${id}`, data);
};

export const deleteTrainingModule = (id) => {
  return apiClient.delete(`/admin/training/modules/${id}`);
};

export const getAllTrainingProgress = () => {
  return apiClient.get('/admin/training/progress');
};
