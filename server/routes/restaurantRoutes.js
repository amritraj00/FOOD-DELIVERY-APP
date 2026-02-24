const express = require('express');
const router = express.Router();
const {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} = require('../controllers/restaurantController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getRestaurants);
router.get('/:id', getRestaurantById);

// Admin routes
router.post('/', protect, admin, upload.single('image'), createRestaurant);
router.put('/:id', protect, admin, upload.single('image'), updateRestaurant);
router.delete('/:id', protect, admin, deleteRestaurant);

module.exports = router;
