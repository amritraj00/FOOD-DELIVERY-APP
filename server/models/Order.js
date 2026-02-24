const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  foodItem: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  quantity: { type: Number, required: true, min: 1 },
});

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, default: '' },
  pincode: { type: String, default: '' },
  lat: { type: Number, default: 28.6139 },
  lng: { type: Number, default: 77.2090 },
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    restaurantName: { type: String, required: true },
    restaurantLat: { type: Number, default: 28.6200 },
    restaurantLng: { type: Number, default: 77.2100 },
    items: [orderItemSchema],
    deliveryAddress: addressSchema,
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 2.99 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['COD', 'Online', 'UPI'], default: 'COD' },
    upiId: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Placed',
    },
    statusHistory: [
      {
        status: String,
        time: { type: Date, default: Date.now },
        message: String,
      },
    ],
    estimatedDelivery: { type: Date },
    deliveryPersonName: { type: String, default: 'Rahul Kumar' },
    deliveryPersonPhone: { type: String, default: '+91 98765 43210' },
    deliveryPersonLat: { type: Number },
    deliveryPersonLng: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
