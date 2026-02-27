const express = require('express');
const router = express.Router();
const {
  registerRestaurant,
  loginRestaurant,
  getProfile,
  updateProfile,
  getRestaurantOrders,
  confirmPayment,
  updateOrderStatus,
  getRestaurantUpi,
  getMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
} = require('../controllers/restaurantAuthController');
const { restaurantOwner } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public
router.post('/register', upload.single('image'), registerRestaurant);
router.post('/login', loginRestaurant);
router.get('/upi/:restaurantId', getRestaurantUpi);

// Protected – restaurant owner only
router.get('/profile', restaurantOwner, getProfile);
router.put('/profile', restaurantOwner, upload.single('image'), updateProfile);
router.get('/orders', restaurantOwner, getRestaurantOrders);
router.put('/orders/:id/confirm-payment', restaurantOwner, confirmPayment);
router.put('/orders/:id/update-status', restaurantOwner, updateOrderStatus);

// Menu management
router.get('/menu', restaurantOwner, getMenu);
router.post('/menu', restaurantOwner, upload.single('image'), addMenuItem);
router.put('/menu/:id', restaurantOwner, upload.single('image'), updateMenuItem);
router.delete('/menu/:id', restaurantOwner, deleteMenuItem);
router.patch('/menu/:id/toggle', restaurantOwner, toggleMenuItemAvailability);

module.exports = router;
