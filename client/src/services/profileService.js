import api from './api';

export const getProfile = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

export const updateProfile = async (profileData) => {
  const { data } = await api.put('/auth/profile', profileData);
  return data;
};

export const addAddress = async (addressData) => {
  const { data } = await api.post('/auth/address', addressData);
  return data;
};

export const deleteAddress = async (idx) => {
  const { data } = await api.delete(`/auth/address/${idx}`);
  return data;
};

export const setDefaultAddress = async (idx) => {
  const { data } = await api.put(`/auth/address/${idx}/default`);
  return data;
};
