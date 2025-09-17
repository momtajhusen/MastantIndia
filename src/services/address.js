// =======================
// services/address.js
// =======================
import apiClient from './apiClient';

/* =======================
   ADDRESS MANAGEMENT
======================= */

// Address Management APIs
export const getAllAddresses = () => {
  return apiClient.get('/public/addr/addresses');
};

export const createAddress = (data) => {
  return apiClient.post('/public/addr/addresses', data);
};

export const getAddressById = (id) => {
  return apiClient.get(`/public/addr/addresses/${id}`);
};

export const updateAddress = (id, data) => {
  return apiClient.put(`/public/addr/addresses/${id}`, data);
};

export const deleteAddress = (id) => {
  return apiClient.delete(`/public/addr/addresses/${id}`);
};

export const setAddressActive = (id) => {
  return apiClient.patch(`/public/addr/addresses/${id}/set-active`);
};

export const getActiveAddress = () => {
  return apiClient.get('/public/addr/addresses/active');
};

// Helper function to create home address with default values
export const createHomeAddress = (addressData) => {
  const homeAddressDefaults = {
    address_type: 'home',
    country: 'India',
    is_active: true,
    is_default: false,
    ...addressData
  };
  return createAddress(homeAddressDefaults);
};

// Helper function to create office address with default values
export const createOfficeAddress = (addressData) => {
  const officeAddressDefaults = {
    address_type: 'office',
    country: 'India',
    is_active: false,
    is_default: false,
    ...addressData
  };
  return createAddress(officeAddressDefaults);
};

// Address validation helper
export const validateAddressData = (addressData) => {
  const requiredFields = [
    'address_label',
    'address_type',
    'house_flat_no',
    'area_street',
    'city',
    'state',
    'pincode',
    'contact_person',
    'contact_phone'
  ];
  
  const missingFields = requiredFields.filter(field => !addressData[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
  
  // Validate pincode format (assuming Indian pincode)
  if (!/^\d{6}$/.test(addressData.pincode)) {
    throw new Error('Pincode must be 6 digits');
  }
  
  // Validate phone number format
  if (!/^\d{10}$/.test(addressData.contact_phone.replace(/\D/g, ''))) {
    throw new Error('Phone number must be 10 digits');
  }
  
  return true;
};