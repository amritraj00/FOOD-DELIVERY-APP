import api from './api';

export const placeOrder = async (orderData) => {
  const { data } = await api.post('/orders', orderData);
  return data;
};

export const getMyOrders = async () => {
  const { data } = await api.get('/orders/my');
  return data;
};

export const getOrderById = async (id) => {
  const { data } = await api.get(`/orders/${id}`);
  return data;
};

export const updateOrderStatus = async (id, status, message) => {
  const { data } = await api.put(`/orders/${id}/status`, { status, message });
  return data;
};

export const getAllOrders = async () => {
  const { data } = await api.get('/orders/admin/all');
  return data;
};
