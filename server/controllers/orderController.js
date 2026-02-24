const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');

// @desc    Place new order
// @route   POST /api/orders
// @access  Private (user)
exports.placeOrder = async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress, subtotal, deliveryFee, tax, total, paymentMethod, upiId } = req.body;

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
      upiId: upiId || '',
      estimatedDelivery,
      statusHistory: [{ status: 'Placed', message: 'Order received! Restaurant will confirm it shortly.' }],
    });

    // Simulate auto-progression in background
    simulateOrderProgress(order._id);

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Auto-simulate only up to "Preparing". Admin must manually set "Out for Delivery".
const simulateOrderProgress = (orderId) => {
  const stages = [
    { status: 'Confirmed', delay: 60000, message: 'Restaurant has confirmed your order.' },
    { status: 'Preparing', delay: 180000, message: 'Chef is preparing your food with care.' },
  ];

  stages.forEach(({ status, delay, message }) => {
    setTimeout(async () => {
      try {
        const order = await Order.findById(orderId);
        // Only advance if still in expected prior state (don't override manual admin changes)
        if (!order) return;
        const allowedPrior = { 'Confirmed': 'Placed', 'Preparing': 'Confirmed' };
        if (order.status === allowedPrior[status]) {
          await Order.findByIdAndUpdate(orderId, {
            $set: { status },
            $push: { statusHistory: { status, message, time: new Date() } },
          });
        }
      } catch (e) { /* ignore */ }
    }, delay);
  });
};

// Called when admin sets status to "Out for Delivery" — auto-delivers after 20 min
const scheduleAutoDelivery = (orderId) => {
  setTimeout(async () => {
    try {
      const order = await Order.findById(orderId);
      if (order && order.status === 'Out for Delivery') {
        await Order.findByIdAndUpdate(orderId, {
          $set: { status: 'Delivered' },
          $push: { statusHistory: { status: 'Delivered', message: 'Order delivered. Enjoy your meal! 🎉', time: new Date() } },
        });
      }
    } catch (e) { /* ignore */ }
  }, 20 * 60 * 1000); // 20 minutes
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

    const statusMessages = {
      'Out for Delivery': 'Delivery partner picked up your order and is on the way!',
      'Delivered': 'Order delivered successfully. Enjoy your meal! 🎉',
      'Cancelled': 'Order has been cancelled.',
    };

    order.status = status;
    order.statusHistory.push({
      status,
      message: message || statusMessages[status] || `Status updated to ${status}`,
      time: new Date()
    });
    await order.save();

    // When admin sets "Out for Delivery", auto-deliver after 20 minutes
    if (status === 'Out for Delivery') {
      scheduleAutoDelivery(order._id);
    }

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
