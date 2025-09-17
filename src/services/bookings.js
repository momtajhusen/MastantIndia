
// =======================
// services/bookings.js
// =======================
import apiClient from './apiClient';

/* =======================
   BOOKINGS
======================= */

// Manufacturer booking APIs
export const getManufacturerBookings = (params) => {
  return apiClient.get('/manufacturer/bookings', { params });
};

export const checkoutBooking = (data) => {
  return apiClient.post('/manufacturer/bookings/checkout', data);
};

export const getBookingById = (id) => {
  return apiClient.get(`/manufacturer/bookings/${id}`);
};

export const updateBookingStatus = (bookingId, newStatus) => {
  return apiClient.put(`/manufacturer/bookings/${bookingId}/status`, newStatus);
};

// Worker booking APIs
export const getWorkerBookings = () => {
  return apiClient.get('/worker/bookings');
};

export const getWorkerBookingById = (id) => {
  return apiClient.get(`/worker/bookings/${id}`);
};

export const generateQrCode = (bookingId) => {
  return apiClient.post(`/worker/bookings/${bookingId}/qr-code`);
};

// Admin booking APIs
export const getAdminBookings = () => {
  return apiClient.get('/admin/bookings');
};

export const getAdminBookingById = (id) => {
  return apiClient.get(`/admin/bookings/${id}`);
};

export const adminUpdateBookingStatus = (id, data) => {
  return apiClient.put(`/admin/bookings/${id}/status`, data);
};

export const getBookingAnalytics = () => {
  return apiClient.get('/admin/bookings/analytics/summary');
};
