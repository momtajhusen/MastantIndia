
// =======================
// services/wallet.js
// =======================
import apiClient from './apiClient';

/* =======================
   WALLET & PAYMENTS
======================= */

export const getWalletBalance = () => {
  return apiClient.get('/wallet/balance');
};

export const getWalletTransactions = () => {
  return apiClient.get('/wallet/transactions');
};

// Worker withdrawal APIs
export const requestWithdrawal = (data) => {
  return apiClient.post('/worker/wallet/withdraw', data);
};

export const getWithdrawals = () => {
  return apiClient.get('/worker/wallet/withdrawals');
};

// Admin withdrawal management
export const getAdminWithdrawals = () => {
  return apiClient.get('/admin/withdrawals');
};

export const processWithdrawal = (id, data) => {
  return apiClient.put(`/admin/withdrawals/${id}/process`, data);
};
