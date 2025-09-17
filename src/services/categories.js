// =======================
// services/categories.js
// =======================
import apiClient from './apiClient';

/* =======================
   CATEGORIES
======================= */

// Public APIs
export const getPublicCategories = () => {
  return apiClient.get('/public/categories');
};

export const getPublicPopularCategories = () => {
  return apiClient.get('/public/categories/popular');
};

export const getPublicCategory = (slug) => {
  return apiClient.get(`/public/categories/${slug}`);
};

// Authenticated APIs
export const getCategories = () => {
  return apiClient.get('/categories');
};

export const getPopularCategories = () => {
  return apiClient.get('/categories/popular');
};

export const searchCategories = (params) => {
  return apiClient.get('/categories/search', { params });
};

export const getCategoryById = (id) => {
  return apiClient.get(`/categories/${id}`);
};

export const calculatePrice = (data) => {
  return apiClient.post('/categories/calculate-price', data);
};

// Manufacturer specific
export const bulkCalculatePrice = (data) => {
  return apiClient.post('/manufacturer/categories/bulk-calculate', data);
};

// Worker specific
export const getWorkerCategories = () => {
  return apiClient.get('/worker/categories/my-categories');
};

// Admin APIs
export const getAdminCategories = () => {
  return apiClient.get('/admin/categories');
};

export const createCategory = (data) => {
  return apiClient.post('/admin/categories', data);
};

export const getAdminCategory = (id) => {
  return apiClient.get(`/admin/categories/${id}`);
};

export const updateCategory = (id, data) => {
  return apiClient.put(`/admin/categories/${id}`, data);
};

export const deleteCategory = (id) => {
  return apiClient.delete(`/admin/categories/${id}`);
};

export const toggleCategoryStatus = (id) => {
  return apiClient.post(`/admin/categories/${id}/toggle-status`);
};

export const bulkCategoryAction = (data) => {
  return apiClient.post('/admin/categories/bulk-action', data);
};

export const getCategoryAnalytics = (id) => {
  return apiClient.get(`/admin/categories/${id}/analytics`);
};
