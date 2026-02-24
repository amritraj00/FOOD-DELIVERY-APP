import api from './api';

// Get all restaurants
export const getRestaurants = async () => {
  const response = await api.get('/restaurants');
  return response.data;
};

// Get single restaurant
export const getRestaurantById = async (id) => {
  const response = await api.get(`/restaurants/${id}`);
  return response.data;
};

// Create restaurant (Admin)
export const createRestaurant = async (formData) => {
  const response = await api.post('/restaurants', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Update restaurant (Admin)
export const updateRestaurant = async (id, formData) => {
  const response = await api.put(`/restaurants/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Delete restaurant (Admin)
export const deleteRestaurant = async (id) => {
  const response = await api.delete(`/restaurants/${id}`);
  return response.data;
};
