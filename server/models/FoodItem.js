const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide food item name'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Please provide food item image'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide food item price'],
      min: 0,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      default: 'Main Course',
      trim: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FoodItem', foodItemSchema);
