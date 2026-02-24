const FoodItem = require('../models/FoodItem');
const Restaurant = require('../models/Restaurant');

// @desc    Get all food items for a restaurant
// @route   GET /api/foods/:restaurantId
// @access  Public
exports.getFoodItems = async (req, res) => {
  try {
    const foodItems = await FoodItem.find({
      restaurantId: req.params.restaurantId,
    }).populate('restaurantId', 'name');

    res.json(foodItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single food item
// @route   GET /api/foods/item/:id
// @access  Public
exports.getFoodItemById = async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id).populate(
      'restaurantId',
      'name'
    );

    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    res.json(foodItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new food item
// @route   POST /api/foods/:restaurantId
// @access  Private/Admin
exports.createFoodItem = async (req, res) => {
  try {
    const { name, price, description, category, imageUrl } = req.body;
    const { restaurantId } = req.params;

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    let image;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    } else if (imageUrl) {
      image = imageUrl;
    } else {
      return res.status(400).json({ message: 'Please upload an image or provide an image URL' });
    }

    const foodItem = await FoodItem.create({
      name,
      price,
      description: description || '',
      category: category || 'Main Course',
      image,
      restaurantId,
    });

    res.status(201).json(foodItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update food item
// @route   PUT /api/foods/:id
// @access  Private/Admin
exports.updateFoodItem = async (req, res) => {
  try {
    const { name, price, description, category, imageUrl } = req.body;
    const foodItem = await FoodItem.findById(req.params.id);

    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    foodItem.name = name || foodItem.name;
    foodItem.price = price !== undefined ? price : foodItem.price;
    foodItem.description = description !== undefined ? description : foodItem.description;
    foodItem.category = category || foodItem.category;

    if (req.file) {
      foodItem.image = `/uploads/${req.file.filename}`;
    } else if (imageUrl) {
      foodItem.image = imageUrl;
    }

    const updatedFoodItem = await foodItem.save();
    res.json(updatedFoodItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete food item
// @route   DELETE /api/foods/:id
// @access  Private/Admin
exports.deleteFoodItem = async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);

    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    await foodItem.deleteOne();
    res.json({ message: 'Food item removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
