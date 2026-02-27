const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const FoodItem = require('../models/FoodItem');
const generateToken = require('../utils/generateToken');

// Helper – strip sensitive fields for public responses
const publicRestaurant = (r) => ({
  _id: r._id,
  name: r.name,
  image: r.image,
  description: r.description,
  cuisine: r.cuisine,
  rating: r.rating,
  deliveryTime: r.deliveryTime,
  minOrder: r.minOrder,
  isOpen: r.isOpen,
  address: r.address,
  city: r.city,
  state: r.state,
  pincode: r.pincode,
  phone: r.phone,
  lat: r.lat,
  lng: r.lng,
  isApproved: r.isApproved,
});

// Helper – full data including payment details (owner/admin only)
const privateRestaurant = (r) => ({
  ...publicRestaurant(r),
  ownerName: r.ownerName,
  ownerEmail: r.ownerEmail,
  ownerPhone: r.ownerPhone,
  upiId: r.upiId,
  upiName: r.upiName,
  bankName: r.bankName,
  accountNumber: r.accountNumber,
  ifscCode: r.ifscCode,
  accountHolder: r.accountHolder,
});

// ─────────────────────────────────────────────────────────────────
// @route   POST /api/restaurant-auth/register
// @access  Public
// ─────────────────────────────────────────────────────────────────
exports.registerRestaurant = async (req, res) => {
  try {
    const {
      // Restaurant info
      name, description, cuisine, image, address, city, state, pincode, phone,
      deliveryTime, minOrder,
      // Owner info
      ownerName, ownerEmail, ownerPassword, ownerPhone,
      // Payment info
      upiId, upiName, bankName, accountNumber, ifscCode, accountHolder,
    } = req.body;

    if (!name || !description || !ownerName || !ownerEmail || !ownerPassword) {
      return res.status(400).json({ message: 'Please fill all required fields.' });
    }

    const exists = await Restaurant.findOne({ ownerEmail });
    if (exists) {
      return res.status(400).json({ message: 'A restaurant is already registered with this email.' });
    }

    let imageUrl = image || '';
    if (req.file) imageUrl = `/uploads/${req.file.filename}`;
    if (!imageUrl) imageUrl = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600';

    const restaurant = await Restaurant.create({
      name, description, cuisine: cuisine || 'Multi-Cuisine',
      image: imageUrl,
      address: address || '', city: city || '', state: state || '',
      pincode: pincode || '', phone: phone || '',
      deliveryTime: deliveryTime || '30-45 min',
      minOrder: minOrder || 99,
      ownerName, ownerEmail, ownerPassword, ownerPhone: ownerPhone || '',
      upiId: upiId || '', upiName: upiName || ownerName,
      bankName: bankName || '', accountNumber: accountNumber || '',
      ifscCode: ifscCode || '', accountHolder: accountHolder || ownerName,
      isApproved: true,
    });

    const token = generateToken(restaurant._id, 'restaurant_owner');
    res.status(201).json({ token, restaurant: privateRestaurant(restaurant) });
  } catch (err) {
    console.error('registerRestaurant:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   POST /api/restaurant-auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────────
exports.loginRestaurant = async (req, res) => {
  try {
    const { email, password } = req.body;
    const restaurant = await Restaurant.findOne({ ownerEmail: email.toLowerCase().trim() });
    if (!restaurant) return res.status(401).json({ message: 'Invalid email or password.' });

    const match = await restaurant.matchPassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid email or password.' });

    if (!restaurant.isApproved) {
      return res.status(403).json({ message: 'Your restaurant is pending admin approval.' });
    }

    const token = generateToken(restaurant._id, 'restaurant_owner');
    res.json({ token, restaurant: privateRestaurant(restaurant) });
  } catch (err) {
    console.error('loginRestaurant:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   GET /api/restaurant-auth/profile
// @access  Private (restaurant owner only)
// ─────────────────────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.restaurantId);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found.' });
    res.json(privateRestaurant(restaurant));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   PUT /api/restaurant-auth/profile
// @access  Private (restaurant owner only)
// ─────────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.restaurantId);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found.' });

    const allowed = [
      'name', 'description', 'cuisine', 'image', 'address', 'city', 'state',
      'pincode', 'phone', 'deliveryTime', 'minOrder', 'isOpen',
      'ownerName', 'ownerPhone',
      'upiId', 'upiName', 'bankName', 'accountNumber', 'ifscCode', 'accountHolder',
    ];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) restaurant[field] = req.body[field];
    });

    if (req.file) restaurant.image = `/uploads/${req.file.filename}`;

    if (req.body.newPassword) {
      restaurant.ownerPassword = req.body.newPassword; // pre-save hook will hash
    }

    await restaurant.save();
    res.json({ message: 'Profile updated.', restaurant: privateRestaurant(restaurant) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   GET /api/restaurant-auth/orders
// @access  Private (restaurant owner only – sees ONLY own orders)
// ─────────────────────────────────────────────────────────────────
exports.getRestaurantOrders = async (req, res) => {
  try {
    const orders = await Order.find({ restaurant: req.restaurantId })
      .populate('user', 'name email phone')
      .populate('items.food', 'name image price')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   PUT /api/restaurant-auth/orders/:id/confirm-payment
// @access  Private (restaurant owner only)
// ─────────────────────────────────────────────────────────────────
exports.confirmPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    // Ensure this order belongs to this restaurant
    if (order.restaurant.toString() !== req.restaurantId.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Payment already confirmed.' });
    }

    order.paymentStatus = 'paid';
    order.status = 'Confirmed'; // Advance to Confirmed once restaurant confirms payment
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({ status: 'Confirmed', time: new Date(), message: 'Payment confirmed by restaurant' });
    await order.save();

    res.json({ message: 'Payment confirmed. Order is now Confirmed.', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   PUT /api/restaurant-auth/orders/:id/update-status
// @access  Private (restaurant owner – can advance status)
// ─────────────────────────────────────────────────────────────────
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    if (order.restaurant.toString() !== req.restaurantId.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    order.status = status;
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({ status, time: new Date() });
    await order.save();

    res.json({ message: `Order status updated to ${status}.`, order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// @route   GET /api/restaurant-auth/upi/:restaurantId
// @access  Public (needed by Cart.js to get UPI for payment QR)
// ─────────────────────────────────────────────────────────────────
exports.getRestaurantUpi = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId).select('name upiId upiName ownerPhone');
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found.' });
    res.json({
      restaurantName: restaurant.name,
      upiId: restaurant.upiId || '8581951334-3@ybl',
      upiName: restaurant.upiName || restaurant.name,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// MENU MANAGEMENT (restaurant owner)
// ─────────────────────────────────────────────────────────────────

// @route   GET /api/restaurant-auth/menu
exports.getMenu = async (req, res) => {
  try {
    const items = await FoodItem.find({ restaurantId: req.restaurantId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route   POST /api/restaurant-auth/menu
exports.addMenuItem = async (req, res) => {
  try {
    const { name, price, category, description, isVeg, image, isAvailable } = req.body;
    if (!name || !price) return res.status(400).json({ message: 'Name and price are required.' });

    let itemImage = image || '';
    if (req.file) itemImage = `/uploads/${req.file.filename}`;
    if (!itemImage) itemImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';

    const item = await FoodItem.create({
      name,
      price: Number(price),
      category: category || 'Main Course',
      description: description || '',
      isVeg: isVeg === true || isVeg === 'true',
      image: itemImage,
      restaurantId: req.restaurantId,
      isAvailable: isAvailable !== false && isAvailable !== 'false',
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route   PUT /api/restaurant-auth/menu/:id
exports.updateMenuItem = async (req, res) => {
  try {
    const item = await FoodItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Food item not found.' });
    if (item.restaurantId.toString() !== req.restaurantId.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    const fields = ['name', 'price', 'category', 'description', 'isVeg', 'image', 'isAvailable'];
    fields.forEach((f) => { if (req.body[f] !== undefined) item[f] = req.body[f]; });
    if (req.body.price) item.price = Number(req.body.price);
    if (req.file) item.image = `/uploads/${req.file.filename}`;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route   DELETE /api/restaurant-auth/menu/:id
exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await FoodItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Food item not found.' });
    if (item.restaurantId.toString() !== req.restaurantId.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    await item.deleteOne();
    res.json({ message: 'Food item deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route   PATCH /api/restaurant-auth/menu/:id/toggle
exports.toggleMenuItemAvailability = async (req, res) => {
  try {
    const item = await FoodItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Food item not found.' });
    if (item.restaurantId.toString() !== req.restaurantId.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    item.isAvailable = !item.isAvailable;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
