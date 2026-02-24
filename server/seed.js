const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const FoodItem = require('./models/FoodItem');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/food-delivery';

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await FoodItem.deleteMany({});
    await Restaurant.deleteMany({});
    await User.deleteMany({ role: 'admin' });
    console.log('🧹 Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@food.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('👤 Admin created: admin@food.com / admin123');

    // Restaurants data
    const restaurantsData = [
      {
        name: 'Pizza Palace',
        cuisine: 'Italian',
        description: 'Authentic Italian pizzas made with fresh ingredients and traditional wood-fired ovens.',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
        rating: 4.8,
        deliveryTime: '25-35 min',
        minOrder: 12,
        createdBy: admin._id,
      },
      {
        name: 'Burger Barn',
        cuisine: 'American',
        description: 'Juicy handcrafted burgers with premium beef patties and the freshest toppings.',
        image: 'https://images.unsplash.com/photo-1554679665-f5537f187268?w=800&q=80',
        rating: 4.6,
        deliveryTime: '20-30 min',
        minOrder: 10,
        createdBy: admin._id,
      },
      {
        name: 'Sushi Sakura',
        cuisine: 'Japanese',
        description: 'Premium sushi and Japanese cuisine prepared by master chefs with the finest seafood.',
        image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80',
        rating: 4.9,
        deliveryTime: '35-45 min',
        minOrder: 15,
        createdBy: admin._id,
      },
      {
        name: 'Spice of India',
        cuisine: 'Indian',
        description: 'Rich, aromatic Indian dishes bursting with authentic spices and traditional flavors.',
        image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
        rating: 4.7,
        deliveryTime: '30-40 min',
        minOrder: 12,
        createdBy: admin._id,
      },
      {
        name: 'Dragon Wok',
        cuisine: 'Chinese',
        description: 'Classic Chinese stir-fries, dim sum, and noodles from the heart of Canton.',
        image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80',
        rating: 4.5,
        deliveryTime: '25-35 min',
        minOrder: 10,
        createdBy: admin._id,
      },
      {
        name: 'Taco Fiesta',
        cuisine: 'Mexican',
        description: 'Vibrant Mexican street food with bold flavors, fresh salsa, and handmade tortillas.',
        image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
        rating: 4.6,
        deliveryTime: '20-30 min',
        minOrder: 8,
        createdBy: admin._id,
      },
    ];

    const restaurants = await Restaurant.insertMany(restaurantsData);
    console.log(`🏪 ${restaurants.length} restaurants created`);

    // Food items per restaurant
    const foodData = [
      // Pizza Palace
      {
        restaurantId: restaurants[0]._id,
        items: [
          { name: 'Margherita Pizza', price: 12.99, category: 'Pizza', description: 'Classic tomato sauce, fresh mozzarella, and basil on a crispy crust.', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80' },
          { name: 'Pepperoni Feast', price: 15.99, category: 'Pizza', description: 'Loaded with premium pepperoni and double mozzarella cheese.', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&q=80' },
          { name: 'BBQ Chicken Pizza', price: 16.99, category: 'Pizza', description: 'Smoky BBQ sauce, grilled chicken, red onions, and cilantro.', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80' },
          { name: 'Truffle Mushroom', price: 17.99, category: 'Pizza', description: 'Wild mushrooms, truffle oil, garlic, and Parmesan on white sauce.', image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=600&q=80' },
          { name: 'Garlic Bread', price: 5.99, category: 'Sides', description: 'Crispy garlic bread with herb butter and melted cheese.', image: 'https://images.unsplash.com/photo-1619531040576-f9416740661e?w=600&q=80' },
          { name: 'Tiramisu', price: 6.99, category: 'Desserts', description: 'Classic Italian dessert with mascarpone and espresso-soaked ladyfingers.', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80' },
        ],
      },
      // Burger Barn
      {
        restaurantId: restaurants[1]._id,
        items: [
          { name: 'Classic Cheeseburger', price: 11.99, category: 'Burgers', description: 'Juicy beef patty, cheddar cheese, lettuce, tomato, and house sauce.', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80' },
          { name: 'Double Smash Burger', price: 14.99, category: 'Burgers', description: 'Two smashed beef patties, American cheese, caramelized onions, pickles.', image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&q=80' },
          { name: 'BBQ Bacon Burger', price: 15.99, category: 'Burgers', description: 'Beef patty with crispy bacon, BBQ sauce, onion rings, and cheddar.', image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&q=80' },
          { name: 'Crispy Chicken Burger', price: 12.99, category: 'Burgers', description: 'Crispy fried chicken, coleslaw, pickles, and honey mustard.', image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&q=80' },
          { name: 'Loaded Fries', price: 6.99, category: 'Sides', description: 'Crispy fries topped with cheese sauce, bacon bits, and jalapeños.', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80' },
          { name: 'Chocolate Milkshake', price: 5.99, category: 'Drinks', description: 'Thick and creamy chocolate milkshake with whipped cream.', image: 'https://images.unsplash.com/photo-1572490122747-3e9b1b6e4d9f?w=600&q=80' },
        ],
      },
      // Sushi Sakura
      {
        restaurantId: restaurants[2]._id,
        items: [
          { name: 'Salmon Nigiri (8pc)', price: 16.99, category: 'Nigiri', description: 'Fresh Atlantic salmon hand-pressed over seasoned sushi rice.', image: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&q=80' },
          { name: 'Dragon Roll', price: 18.99, category: 'Rolls', description: 'Shrimp tempura inside, avocado outside, eel sauce drizzle.', image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=600&q=80' },
          { name: 'Rainbow Roll', price: 19.99, category: 'Rolls', description: 'California roll topped with tuna, salmon, yellow tail, and avocado.', image: 'https://images.unsplash.com/photo-1617196034097-5a1a0e57a40e?w=600&q=80' },
          { name: 'Spicy Tuna Roll', price: 14.99, category: 'Rolls', description: 'Tuna with spicy mayo, cucumber, and sesame seeds.', image: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=600&q=80' },
          { name: 'Edamame', price: 5.99, category: 'Starters', description: 'Steamed soybeans with sea salt and sesame oil.', image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&q=80' },
          { name: 'Miso Soup', price: 3.99, category: 'Soups', description: 'Traditional Japanese miso broth with tofu, wakame, and green onion.', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80' },
        ],
      },
      // Spice of India
      {
        restaurantId: restaurants[3]._id,
        items: [
          { name: 'Butter Chicken', price: 15.99, category: 'Main Course', description: 'Tender chicken in a rich, creamy tomato-based sauce with aromatic spices.', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=80' },
          { name: 'Biryani Royal', price: 17.99, category: 'Rice Dishes', description: 'Fragrant basmati rice cooked with saffron, spices, and choice of protein.', image: 'https://images.unsplash.com/photo-1563379091339-03246963d867?w=600&q=80' },
          { name: 'Paneer Tikka Masala', price: 14.99, category: 'Main Course', description: 'Grilled cottage cheese cubes in vibrant tikka masala sauce.', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80' },
          { name: 'Dal Makhani', price: 12.99, category: 'Main Course', description: 'Slow-cooked black lentils and red kidney beans in a buttery sauce.', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80' },
          { name: 'Garlic Naan', price: 3.99, category: 'Bread', description: 'Soft leavened bread with garlic and butter, baked in tandoor oven.', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80' },
          { name: 'Mango Lassi', price: 5.99, category: 'Drinks', description: 'Refreshing yogurt-based drink blended with sweet Alphonso mangoes.', image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&q=80' },
        ],
      },
      // Dragon Wok
      {
        restaurantId: restaurants[4]._id,
        items: [
          { name: 'Kung Pao Chicken', price: 13.99, category: 'Main Course', description: 'Stir-fried chicken with peanuts, vegetables, and chili peppers.', image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&q=80' },
          { name: 'Beef Fried Rice', price: 12.99, category: 'Rice', description: 'Wok-tossed jasmine rice with tender beef, eggs, and vegetables.', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=80' },
          { name: 'Dim Sum Basket', price: 11.99, category: 'Dim Sum', description: 'Steamed assortment of pork dumplings, shrimp har gow, and siu mai.', image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80' },
          { name: 'Wonton Noodle Soup', price: 10.99, category: 'Soups', description: 'Clear broth with silky wontons, egg noodles, and bok choy.', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80' },
          { name: 'Spring Rolls (6pc)', price: 7.99, category: 'Starters', description: 'Crispy golden rolls filled with vegetables and glass noodles.', image: 'https://images.unsplash.com/photo-1606941272884-ebdfbf9fb68d?w=600&q=80' },
          { name: 'Peking Duck', price: 24.99, category: 'Specialties', description: 'Roasted Peking duck with crispy skin, pancakes, cucumber, and hoisin.', image: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=600&q=80' },
        ],
      },
      // Taco Fiesta
      {
        restaurantId: restaurants[5]._id,
        items: [
          { name: 'Carne Asada Tacos (3pc)', price: 12.99, category: 'Tacos', description: 'Grilled marinated beef with cilantro, onion, and lime on corn tortillas.', image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80' },
          { name: 'Al Pastor Tacos (3pc)', price: 11.99, category: 'Tacos', description: 'Pork marinated in achiote and pineapple on corn tortillas.', image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&q=80' },
          { name: 'Chicken Burrito', price: 13.99, category: 'Burritos', description: 'Flour tortilla loaded with seasoned chicken, rice, black beans, cheese, and salsa.', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80' },
          { name: 'Loaded Nachos', price: 10.99, category: 'Starters', description: 'Tortilla chips with queso, guacamole, jalapeños, black beans, and pico de gallo.', image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600&q=80' },
          { name: 'Guacamole & Chips', price: 7.99, category: 'Starters', description: 'Fresh hand-mashed avocado with lime, cilantro, and tomato.', image: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=600&q=80' },
          { name: 'Churros with Dip', price: 6.99, category: 'Desserts', description: 'Crispy fried dough dusted in cinnamon sugar with chocolate dipping sauce.', image: 'https://images.unsplash.com/photo-1624471897278-8e07c3db75ce?w=600&q=80' },
        ],
      },
    ];

    for (const restaurantFoods of foodData) {
      const items = restaurantFoods.items.map((item) => ({
        ...item,
        restaurantId: restaurantFoods.restaurantId,
      }));
      await FoodItem.insertMany(items);
    }

    const totalFoods = foodData.reduce((sum, r) => sum + r.items.length, 0);
    console.log(`🍕 ${totalFoods} food items created`);
    console.log('\n✅ Seeding complete!\n');
    console.log('🔑 Admin credentials:');
    console.log('   Email:    admin@food.com');
    console.log('   Password: admin123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seed();
