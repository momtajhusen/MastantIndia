
// =======================
// services/qrCode.js
// =======================
import apiClient from './apiClient';

/* =======================
   QR CODE MANAGEMENT
======================= */

// Manufacturer QR scanning
export const scanQrCode = (data) => {
  return apiClient.post('/manufacturer/qr/scan', data);
};

export const verifyQrCode = (data) => {
  return apiClient.post('/manufacturer/qr/verify', data);
};

// Worker QR generation
export const generateWorkerQr = (bookingId) => {
  return apiClient.post(`/worker/qr/generate/${bookingId}`);
};

export const getQrStatus = (bookingId) => {
  return apiClient.get(`/worker/qr/status/${bookingId}`);
};
