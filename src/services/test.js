// =======================
// services/test.js
// =======================
import apiClient from './apiClient';

/* =======================
   TEST ENDPOINTS
======================= */

export const testAuthentication = () => {
  return apiClient.get('/test-auth');
};

export const getCurrentUser = () => {
  return apiClient.get('/user');
};