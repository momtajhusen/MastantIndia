
// =======================
// services/manufacturer.js
// =======================
import apiClient from './apiClient';

/* =======================
   MANUFACTURER SPECIFIC
======================= */

// Company details
export const getCompanyDetails = () => {
  return apiClient.get('/manufacturer/company');
};

export const createCompanyDetails = (data) => {
  return apiClient.post('/manufacturer/company', data);
};

export const updateCompanyDetails = (data) => {
  return apiClient.put('/manufacturer/company', data);
};

// Preferences
export const getPreferences = () => {
  return apiClient.get('/manufacturer/preferences');
};

export const setPreferences = (data) => {
  return apiClient.post('/manufacturer/preferences', data);
};

export const updatePreferences = (data) => {
  return apiClient.put('/manufacturer/preferences', data);
};

// Recommendations
export const getCategoryRecommendations = () => {
  return apiClient.get('/manufacturer/recommendations/categories');
};

export const getWorkerRecommendations = () => {
  return apiClient.get('/manufacturer/recommendations/workers');
};

export const acceptRecommendation = (id) => {
  return apiClient.post(`/manufacturer/recommendations/accept/${id}`);
};

export const rejectRecommendation = (id) => {
  return apiClient.post(`/manufacturer/recommendations/reject/${id}`);
};

// Payments
export const initiatePayment = (data) => {
  return apiClient.post('/manufacturer/payments/initiate', data);
};

export const getPaymentHistory = () => {
  return apiClient.get('/manufacturer/payments/history');
};

export const getPaymentReceipt = (id) => {
  return apiClient.get(`/manufacturer/payments/${id}/receipt`);
};

export const requestRefund = (id, data) => {
  return apiClient.post(`/manufacturer/payments/refund/${id}`, data);
};

// Overtime
export const approveOvertime = (bookingId, data) => {
  return apiClient.post(`/manufacturer/overtime/approve/${bookingId}`, data);
};

export const rejectOvertime = (bookingId, data) => {
  return apiClient.post(`/manufacturer/overtime/reject/${bookingId}`, data);
};
