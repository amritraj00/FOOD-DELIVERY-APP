import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// User Pages
import HomePage from './pages/user/HomePage';
import UserLogin from './pages/user/UserLogin';
import UserRegister from './pages/user/UserRegister';
import Restaurants from './pages/user/Restaurants';
import RestaurantMenu from './pages/user/RestaurantMenu';
import Cart from './pages/user/Cart';
import Orders from './pages/user/Orders';
import OrderTracking from './pages/user/OrderTracking';
import UserProfile from './pages/user/UserProfile';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import AdminRestaurants from './pages/admin/AdminRestaurants';
import AdminFoods from './pages/admin/AdminFoods';

function App() {
  return (
    <CartProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <Routes>
              {/* Home Route */}
              <Route path="/" element={<HomePage />} />

              {/* User Routes */}
              <Route path="/user/login" element={<UserLogin />} />
              <Route path="/user/register" element={<UserRegister />} />
              <Route path="/restaurants" element={<PrivateRoute><Restaurants /></PrivateRoute>} />
              <Route path="/restaurants/:id" element={<PrivateRoute><RestaurantMenu /></PrivateRoute>} />
              <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
              <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
              <Route path="/orders/:id/track" element={<PrivateRoute><OrderTracking /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<PrivateRoute adminOnly={true}><Dashboard /></PrivateRoute>} />
              <Route path="/admin/restaurants" element={<PrivateRoute adminOnly={true}><AdminRestaurants /></PrivateRoute>} />
              <Route path="/admin/restaurants/:id/foods" element={<PrivateRoute adminOnly={true}><AdminFoods /></PrivateRoute>} />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
          </div>
        </Router>
      </AuthProvider>
    </CartProvider>
  );
}

export default App;
