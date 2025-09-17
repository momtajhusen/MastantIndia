
// =======================
// services/cart.js
// =======================
import apiClient from './apiClient';

/* =======================
   CART (Manufacturer Only)
======================= */

export const getCartItems = () => {
  return apiClient.get('/manufacturer/cart');
};

export const addToCart = (data) => {
  return apiClient.post('/manufacturer/cart', data);
};

export const updateCartItem = (id, data) => {
  return apiClient.put(`/manufacturer/cart/${id}`, data);
};

export const removeCartItem = (id) => {
  return apiClient.delete(`/manufacturer/cart/${id}`);
};

export const clearCart = () => {
  return apiClient.delete('/manufacturer/cart');
};

