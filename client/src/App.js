import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { RestaurantAuthProvider } from './context/RestaurantAuthContext';
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
import AdminOrders from './pages/admin/AdminOrders';
import AdminRestaurantDetails from './pages/admin/AdminRestaurantDetails';

// Restaurant Owner Pages
import RestaurantRegister from './pages/restaurant/RestaurantRegister';
import RestaurantLogin from './pages/restaurant/RestaurantLogin';
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';

// Hides the main Navbar only on the restaurant owner dashboard
function ConditionalNavbar() {
  const location = useLocation();
  if (location.pathname === '/restaurant/dashboard') return null;
  return <Navbar />;
}

function AppLayout() {
  return (
    <div className="App">
      <ConditionalNavbar />
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
        <Route path="/admin/orders" element={<PrivateRoute adminOnly={true}><AdminOrders /></PrivateRoute>} />
        <Route path="/admin/restaurant-details" element={<PrivateRoute adminOnly={true}><AdminRestaurantDetails /></PrivateRoute>} />

        {/* Restaurant Owner Routes — Navbar hidden on all these */}
        <Route path="/restaurant/register" element={<RestaurantRegister />} />
        <Route path="/restaurant/login" element={<RestaurantLogin />} />
        <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <AuthProvider>
        <RestaurantAuthProvider>
          <Router>
            <AppLayout />
          </Router>
        </RestaurantAuthProvider>
      </AuthProvider>
    </CartProvider>
  );
}

export default App;
