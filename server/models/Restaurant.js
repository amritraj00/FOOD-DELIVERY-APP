const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide restaurant name'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Please provide restaurant image'],
    },
    description: {
      type: String,
      required: [true, 'Please provide restaurant description'],
      trim: true,
    },
    cuisine: {
      type: String,
      default: 'Multi-Cuisine',
      trim: true,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
    },
    deliveryTime: {
      type: String,
      default: '30-45 min',
    },
    minOrder: {
      type: Number,
      default: 10,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Restaurant', restaurantSchema);
