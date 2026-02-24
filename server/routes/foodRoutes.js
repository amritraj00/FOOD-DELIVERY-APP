const express = require('express');
const router = express.Router();
const {
  getFoodItems,
  getFoodItemById,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,
} = require('../controllers/foodController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/:restaurantId', getFoodItems);
router.get('/item/:id', getFoodItemById);

// Admin routes
router.post(
  '/:restaurantId',
  protect,
  admin,
  upload.single('image'),
  createFoodItem
);
router.put('/:id', protect, admin, upload.single('image'), updateFoodItem);
router.delete('/:id', protect, admin, deleteFoodItem);

module.exports = router;
