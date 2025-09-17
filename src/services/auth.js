// =======================
// services/auth.js
// =======================
import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* =======================
   AUTHENTICATION
======================= */

// 1. Send OTP
export const sendOtp = (data) => {
  return apiClient.post('/auth/send-otp', data);
};

// 2. Verify OTP
export const verifyOtp = async (data) => {
  const response = await apiClient.post('/auth/verify-otp', data);
  
  // Save token to AsyncStorage
  if (response.data.success && response.data.token) {
    await AsyncStorage.setItem('auth_token', response.data.token);
    await AsyncStorage.setItem('user_data', JSON.stringify(response.data.user));
    
    // Save role-specific token
    const userRole = response.data.user.role;
    await AsyncStorage.setItem(`${userRole}_token`, response.data.token);
  }
  
  return response;
};

// 3. Get user profile
export const getProfile = () => {
  return apiClient.get('/auth/profile');
};

// 4. Update profile
export const updateProfile = (data) => {
  return apiClient.put('/auth/profile', data);
};

// 5. Logout
export const logout = async () => {
  const response = await apiClient.post('/auth/logout');
  
  // Clear all stored data
  await AsyncStorage.multiRemove([
    'auth_token',
    'user_data',
    'manufacturer_token',
    'worker_token',
    'admin_token',
    'super_admin_token'
  ]);
  
  return response;
};

// 6. Logout from all devices
export const logoutAll = async () => {
  const response = await apiClient.post('/auth/logout-all');
  
  // Clear all stored data
  await AsyncStorage.multiRemove([
    'auth_token',
    'user_data',
    'manufacturer_token',
    'worker_token',
    'admin_token',
    'super_admin_token'
  ]);
  
  return response;
};

// 7. Refresh token
export const refreshToken = async () => {
  const response = await apiClient.post('/auth/refresh-token');
  
  if (response.data.success && response.data.token) {
    await AsyncStorage.setItem('auth_token', response.data.token);
  }
  
  return response;
};
