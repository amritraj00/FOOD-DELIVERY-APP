const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');

// @desc    Place new order
// @route   POST /api/orders
// @access  Private (user)
exports.placeOrder = async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress, subtotal, deliveryFee, tax, total, paymentMethod } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    const estimatedDelivery = new Date(Date.now() + 35 * 60 * 1000); // 35 mins

    const order = await Order.create({
      user: req.user._id,
      restaurant: restaurantId,
      restaurantName: restaurant.name,
      restaurantLat: restaurant.lat || 28.6200,
      restaurantLng: restaurant.lng || 77.2100,
      items,
      deliveryAddress,
      subtotal,
      deliveryFee: deliveryFee || 2.99,
      tax: tax || 0,
      total,
      paymentMethod: paymentMethod || 'COD',
      estimatedDelivery,
      statusHistory: [{ status: 'Placed', message: 'Order received and being sent to restaurant.' }],
    });

    // Simulate auto-progression in background
    simulateOrderProgress(order._id);

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Simulate real-time order status updates (demo)
const simulateOrderProgress = (orderId) => {
  const stages = [
    { status: 'Confirmed', delay: 30000, message: 'Restaurant has confirmed your order.' },
    { status: 'Preparing', delay: 90000, message: 'Chef is preparing your food with care.' },
    { status: 'Out for Delivery', delay: 180000, message: 'Delivery partner picked up your order.' },
    { status: 'Delivered', delay: 360000, message: 'Order delivered. Enjoy your meal!' },
  ];

  stages.forEach(({ status, delay, message }) => {
    setTimeout(async () => {
      try {
        await Order.findByIdAndUpdate(orderId, {
          $set: { status },
          $push: { statusHistory: { status, message, time: new Date() } },
        });
      } catch (e) { /* ignore */ }
    }, delay);
  });
};

// @desc    Get logged-in user orders
// @route   GET /api/orders/my
// @access  Private (user)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('restaurant', 'name image');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private (owner or admin)
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('restaurant', 'name image');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders/admin/all
// @access  Private (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('restaurant', 'name');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Private (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, message } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    order.statusHistory.push({ status, message: message || `Status updated to ${status}`, time: new Date() });
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update delivery location (simulated GPS)
// @route   PUT /api/orders/:id/location
// @access  Private
exports.updateDeliveryLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { deliveryPersonLat: lat, deliveryPersonLng: lng },
      { new: true }
    );
    res.json({ lat: order.deliveryPersonLat, lng: order.deliveryPersonLng });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
