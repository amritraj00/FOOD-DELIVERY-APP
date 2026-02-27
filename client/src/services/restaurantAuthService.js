import api from './api';

const STORAGE_KEY = 'restaurantOwner';

// Register restaurant
export const registerRestaurant = async (data, imageFile) => {
  let payload;
  if (imageFile) {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, v));
    fd.append('image', imageFile);
    payload = fd;
  } else {
    payload = data;
  }
  const response = await api.post('/restaurant-auth/register', payload);
  if (response.data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data));
  }
  return response.data;
};

// Login restaurant owner
export const loginRestaurant = async (data) => {
  const response = await api.post('/restaurant-auth/login', data);
  if (response.data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data));
  }
  return response.data;
};

// Logout
export const logoutRestaurant = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// Get stored restaurant owner
export const getStoredRestaurant = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
};

// Get own orders
export const getMyOrders = async () => {
  const response = await api.get('/restaurant-auth/orders');
  return response.data;
};

// Confirm payment received
export const confirmPayment = async (orderId) => {
  const response = await api.put(`/restaurant-auth/orders/${orderId}/confirm-payment`);
  return response.data;
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  const response = await api.put(`/restaurant-auth/orders/${orderId}/update-status`, { status });
  return response.data;
};

// Update restaurant profile / payment details
export const updateProfile = async (data, imageFile) => {
  let payload;
  if (imageFile) {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, v === true ? 'true' : v === false ? 'false' : String(v ?? '')));
    fd.append('image', imageFile);
    payload = fd;
  } else {
    payload = data;
  }
  const response = await api.put('/restaurant-auth/profile', payload);
  return response.data;
};

// Get restaurant UPI (used by Cart)
export const getRestaurantUpi = async (restaurantId) => {
  const response = await api.get(`/restaurant-auth/upi/${restaurantId}`);
  return response.data;
};

// ── Menu Management ────────────────────────────────────────────────
export const getMenu = async () => {
  const res = await api.get('/restaurant-auth/menu');
  return res.data;
};

export const addMenuItem = async (data, imageFile) => {
  let payload;
  if (imageFile) {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, v === true ? 'true' : v === false ? 'false' : String(v ?? '')));
    fd.append('image', imageFile);
    payload = fd;
  } else {
    payload = data;
  }
  const res = await api.post('/restaurant-auth/menu', payload);
  return res.data;
};

export const updateMenuItem = async (id, data, imageFile) => {
  let payload;
  if (imageFile) {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, v === true ? 'true' : v === false ? 'false' : String(v ?? '')));
    fd.append('image', imageFile);
    payload = fd;
  } else {
    payload = data;
  }
  const res = await api.put(`/restaurant-auth/menu/${id}`, payload);
  return res.data;
};

export const deleteMenuItem = async (id) => {
  const res = await api.delete(`/restaurant-auth/menu/${id}`);
  return res.data;
};

export const toggleMenuItemAvailability = async (id) => {
  const res = await api.patch(`/restaurant-auth/menu/${id}/toggle`);
  return res.data;
};
