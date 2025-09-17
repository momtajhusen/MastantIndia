
// =======================
// services/ratings.js
// =======================
import apiClient from './apiClient';

/* =======================
   RATINGS SYSTEM
======================= */

export const submitRating = (data) => {
  return apiClient.post('/ratings', data);
};

export const getWorkerRatings = (id) => {
  return apiClient.get(`/ratings/worker/${id}`);
};

export const getManufacturerRatings = (id) => {
  return apiClient.get(`/ratings/manufacturer/${id}`);
};
