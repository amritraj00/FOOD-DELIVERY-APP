const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  addAddress,
  deleteAddress,
  setDefaultAddress,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/address', protect, addAddress);
router.delete('/address/:idx', protect, deleteAddress);
router.put('/address/:idx/default', protect, setDefaultAddress);

module.exports = router;
