
// =======================
// services/superAdmin.js
// =======================
import apiClient from './apiClient';

/* =======================
   SUPER ADMIN
======================= */

// System settings
export const getSystemSettings = () => {
  return apiClient.get('/super-admin/system-settings');
};

export const createSystemSetting = (data) => {
  return apiClient.post('/super-admin/system-settings', data);
};

export const updateSystemSetting = (key, data) => {
  return apiClient.put(`/super-admin/system-settings/${key}`, data);
};

export const deleteSystemSetting = (key) => {
  return apiClient.delete(`/super-admin/system-settings/${key}`);
};

// Admin management
export const getAdminList = () => {
  return apiClient.get('/super-admin/admins');
};

export const createAdmin = (data) => {
  return apiClient.post('/super-admin/admins', data);
};

export const updateAdminRole = (id, data) => {
  return apiClient.put(`/super-admin/admins/${id}/role`, data);
};

// System management
export const getAllUsers = () => {
  return apiClient.get('/super-admin/system/users');
};

export const updateUserStatus = (id, data) => {
  return apiClient.put(`/super-admin/system/users/${id}/status`, data);
};

export const getSystemOverview = () => {
  return apiClient.get('/super-admin/system/analytics/overview');
};

// Category management
export const importCategories = (formData) => {
  return apiClient.post('/super-admin/categories/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const exportCategories = () => {
  return apiClient.get('/super-admin/categories/export');
};

export const syncPricing = (data) => {
  return apiClient.post('/super-admin/categories/sync-pricing', data);
};

export const getSystemAnalytics = () => {
  return apiClient.get('/super-admin/categories/system-analytics');
};
