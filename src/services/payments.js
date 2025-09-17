// =======================
// services/payments.js
// =======================
import apiClient from './apiClient';

/* =======================
   PAYMENT WEBHOOKS & PROCESSING
======================= */

// Note: Webhook endpoints are typically called by payment gateways
// These are here for reference but won't be called from React Native app

export const handleRazorpayWebhook = (data) => {
  return apiClient.post('/payments/webhook/razorpay', data);
};

export const handlePaytmWebhook = (data) => {
  return apiClient.post('/payments/webhook/paytm', data);
};