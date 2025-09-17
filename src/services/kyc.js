
// =======================
// services/kyc.js
// =======================
import apiClient from './apiClient';

/* =======================
   KYC DOCUMENTS
======================= */

export const uploadKycDocument = (formData) => {
  return apiClient.post('/kyc/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getMyKycDocuments = () => {
  return apiClient.get('/kyc/documents');
};

// Admin KYC management
export const getAdminKycDocuments = (params) => {
  return apiClient.get('/admin/kyc/documents', { params });
};

export const verifyKycDocument = (id, data) => {
  return apiClient.put(`/admin/kyc/verify/${id}`, data);
};
