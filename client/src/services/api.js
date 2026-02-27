import axios from 'axios';

const API_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const restaurantOwner = JSON.parse(localStorage.getItem('restaurantOwner') || '{}');
    // Use restaurant owner token for restaurant-auth routes, user token everywhere else
    const isRestaurantRoute = config.url && config.url.includes('restaurant-auth');
    const token = isRestaurantRoute ? restaurantOwner.token : user.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401: clear stale tokens and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('restaurantOwner');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/user/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
