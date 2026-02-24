const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updateDeliveryLocation,
} = require('../controllers/orderController');

router.post('/', protect, placeOrder);
router.get('/my', protect, getMyOrders);
router.get('/admin/all', protect, admin, getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.put('/:id/location', protect, updateDeliveryLocation);

module.exports = router;
