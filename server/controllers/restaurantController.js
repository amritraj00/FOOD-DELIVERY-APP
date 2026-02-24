const Restaurant = require('../models/Restaurant');
const path = require('path');

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
exports.getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().populate(
      'createdBy',
      'name email'
    );
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single restaurant
// @route   GET /api/restaurants/:id
// @access  Public
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate(
      'createdBy',
      'name email'
    );

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new restaurant
// @route   POST /api/restaurants
// @access  Private/Admin
exports.createRestaurant = async (req, res) => {
  try {
    const { name, description, cuisine, rating, deliveryTime, minOrder, imageUrl } = req.body;

    let image;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    } else if (imageUrl) {
      image = imageUrl;
    } else {
      return res.status(400).json({ message: 'Please upload an image or provide an image URL' });
    }

    const restaurant = await Restaurant.create({
      name,
      description,
      cuisine: cuisine || 'Multi-Cuisine',
      rating: rating || 4.5,
      deliveryTime: deliveryTime || '30-45 min',
      minOrder: minOrder || 10,
      image,
      createdBy: req.user._id,
    });

    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private/Admin
exports.updateRestaurant = async (req, res) => {
  try {
    const { name, description, cuisine, rating, deliveryTime, minOrder, imageUrl } = req.body;
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    restaurant.name = name || restaurant.name;
    restaurant.description = description || restaurant.description;
    restaurant.cuisine = cuisine || restaurant.cuisine;
    restaurant.rating = rating !== undefined ? rating : restaurant.rating;
    restaurant.deliveryTime = deliveryTime || restaurant.deliveryTime;
    restaurant.minOrder = minOrder !== undefined ? minOrder : restaurant.minOrder;

    if (req.file) {
      restaurant.image = `/uploads/${req.file.filename}`;
    } else if (imageUrl) {
      restaurant.image = imageUrl;
    }

    const updatedRestaurant = await restaurant.save();
    res.json(updatedRestaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private/Admin
exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    await restaurant.deleteOne();
    res.json({ message: 'Restaurant removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
