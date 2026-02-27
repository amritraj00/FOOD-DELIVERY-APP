import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  loginRestaurant,
  registerRestaurant,
  logoutRestaurant,
  getStoredRestaurant,
} from '../services/restaurantAuthService';

const RestaurantAuthContext = createContext();

export const RestaurantAuthProvider = ({ children }) => {
  const [restaurantOwner, setRestaurantOwner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredRestaurant();
    if (stored) setRestaurantOwner(stored);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await loginRestaurant({ email, password });
    setRestaurantOwner(data);
    return data;
  };

  const register = async (formData, imageFile) => {
    const data = await registerRestaurant(formData, imageFile);
    setRestaurantOwner(data);
    return data;
  };

  const logout = () => {
    logoutRestaurant();
    setRestaurantOwner(null);
  };

  return (
    <RestaurantAuthContext.Provider value={{ restaurantOwner, loading, login, register, logout }}>
      {!loading && children}
    </RestaurantAuthContext.Provider>
  );
};

export const useRestaurantAuth = () => useContext(RestaurantAuthContext);
export default RestaurantAuthContext;
