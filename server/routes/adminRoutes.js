const express = require('express');
const router = express.Router();
const { adminLogin } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');
const Restaurant = require('../models/Restaurant');

router.post('/login', adminLogin);

// Admin-only: get all restaurants with full private details (payment info, owner info)
router.get('/restaurants/details', protect, admin, async (req, res) => {
  try {
    const restaurants = await Restaurant.find().select('-ownerPassword').sort({ createdAt: -1 });
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin-only: toggle restaurant approval
router.put('/restaurants/:id/approve', protect, admin, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found.' });
    restaurant.isApproved = !restaurant.isApproved;
    await restaurant.save();
    res.json({ isApproved: restaurant.isApproved, message: `Restaurant ${restaurant.isApproved ? 'approved' : 'suspended'}.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
