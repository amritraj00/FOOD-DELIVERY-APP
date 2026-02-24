import api from './api';

// Get food items for a restaurant
export const getFoodItems = async (restaurantId) => {
  const response = await api.get(`/foods/${restaurantId}`);
  return response.data;
};

// Get single food item
export const getFoodItemById = async (id) => {
  const response = await api.get(`/foods/item/${id}`);
  return response.data;
};

// Create food item (Admin)
export const createFoodItem = async (restaurantId, formData) => {
  const response = await api.post(`/foods/${restaurantId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Update food item (Admin)
export const updateFoodItem = async (id, formData) => {
  const response = await api.put(`/foods/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Delete food item (Admin)
export const deleteFoodItem = async (id) => {
  const response = await api.delete(`/foods/${id}`);
  return response.data;
};
