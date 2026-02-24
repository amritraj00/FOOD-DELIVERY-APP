import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/user/login" />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/restaurants" />;
  }

  return children;
};

export default PrivateRoute;
