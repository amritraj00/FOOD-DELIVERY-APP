const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const FoodItem = require('./models/FoodItem');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bitebuddy';

// ────────────────────────────────────────────────────────────────────
// 30 RESTAURANTS DATA
// ────────────────────────────────────────────────────────────────────
const rawRestaurants = [
  {
    name: 'Punjabi Tadka', cuisine: 'North Indian',
    description: 'Authentic Punjabi dhaba-style food with rich gravies, hot rotis and lassi.',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
    rating: 4.7, deliveryTime: '30-40 min', minOrder: 149,
    city: 'Delhi', state: 'Delhi', ownerName: 'Gurpreet Singh',
    ownerEmail: 'gurpreet@punjabitadka.com', ownerPassword: 'punjabi123',
    ownerPhone: '9876501001',
    upiId: '9876501001@paytm', upiName: 'GURPREET SINGH',
    bankName: 'Punjab National Bank', accountNumber: '1234560001', ifscCode: 'PUNB0001100',
    foods: [
      { name: 'Butter Chicken', price: 280, category: 'Non-Veg', description: 'Creamy tomato-based chicken curry', isVeg: false, rating: 4.8, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400' },
      { name: 'Dal Makhani', price: 220, category: 'Veg', description: 'Slow-cooked black lentils in butter and cream', isVeg: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400' },
      { name: 'Paneer Butter Masala', price: 260, category: 'Veg', description: 'Cottage cheese in rich buttery gravy', isVeg: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400' },
      { name: 'Chicken Biryani', price: 320, category: 'Non-Veg', description: 'Fragrant basmati rice with spiced chicken', isVeg: false, rating: 4.9, image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400' },
      { name: 'Garlic Naan', price: 60, category: 'Breads', description: 'Soft butter garlic naan from tandoor', isVeg: true, rating: 4.5, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400' },
      { name: 'Lassi', price: 80, category: 'Beverages', description: 'Thick sweet yogurt drink', isVeg: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=400' },
    ],
  },
  {
    name: 'Royal Mughal Kitchen', cuisine: 'Mughlai',
    description: 'Royal Mughal-inspired kebabs, biryanis and rich kormas prepared in traditional dum style.',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80',
    rating: 4.8, deliveryTime: '35-45 min', minOrder: 199,
    city: 'Lucknow', state: 'Uttar Pradesh', ownerName: 'Mohd Raza Khan',
    ownerEmail: 'raza@royalmughal.com', ownerPassword: 'mughal123', ownerPhone: '9876502002',
    upiId: '9876502002@gpay', upiName: 'MOHD RAZA KHAN',
    bankName: 'Bank of Baroda', accountNumber: '1234560002', ifscCode: 'BARB0LUCKNOW',
    foods: [
      { name: 'Lucknowi Biryani', price: 380, category: 'Non-Veg', description: 'Dum-cooked Awadhi biryani with tender meat', isVeg: false, rating: 4.9, image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400' },
      { name: 'Galouti Kebab', price: 320, category: 'Non-Veg', description: 'Melt-in-mouth minced meat kebabs', isVeg: false, rating: 4.9, image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400' },
      { name: 'Murgh Korma', price: 300, category: 'Non-Veg', description: 'Chicken in aromatic yogurt-based gravy', isVeg: false, rating: 4.7, image: 'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?w=400' },
      { name: 'Shahi Paneer', price: 280, category: 'Veg', description: 'Paneer in rich cashew cream sauce', isVeg: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400' },
      { name: 'Warqi Paratha', price: 50, category: 'Breads', description: 'Layered flaky Mughlai bread', isVeg: true, rating: 4.5, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400' },
      { name: 'Phirni', price: 120, category: 'Desserts', description: 'Creamy rice and milk dessert', isVeg: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400' },
    ],
  },
  {
    name: 'Delhi Darbar', cuisine: 'North Indian',
    description: 'Classic North Indian restaurant serving chole bhature, rajma chawal and more.',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&q=80',
    rating: 4.5, deliveryTime: '25-35 min', minOrder: 129,
    city: 'Delhi', state: 'Delhi', ownerName: 'Suresh Verma',
    ownerEmail: 'suresh@delhidarbar.com', ownerPassword: 'delhi123', ownerPhone: '9876503003',
    upiId: '9876503003@ybl', upiName: 'SURESH VERMA',
    bankName: 'HDFC Bank', accountNumber: '1234560003', ifscCode: 'HDFC0001234',
    foods: [
      { name: 'Chole Bhature', price: 160, category: 'Veg', description: 'Spiced chickpeas with fluffy fried bread', isVeg: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400' },
      { name: 'Rajma Chawal', price: 180, category: 'Veg', description: 'Kidney beans curry with steamed rice', isVeg: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400' },
      { name: 'Kadhi Pakoda', price: 170, category: 'Veg', description: 'Yogurt curry with fried gram-flour dumplings', isVeg: true, rating: 4.5, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
      { name: 'Aloo Paratha', price: 80, category: 'Breads', description: 'Stuffed potato flatbread with butter', isVeg: true, rating: 4.9, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400' },
      { name: 'Chicken Tikka', price: 280, category: 'Non-Veg', description: 'Tandoor grilled chicken tikka', isVeg: false, rating: 4.7, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400' },
      { name: 'Sweet Lassi', price: 70, category: 'Beverages', description: 'Chilled sweet yogurt drink', isVeg: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=400' },
    ],
  },
  {
    name: 'Madras Mess', cuisine: 'South Indian',
    description: 'Crispy dosas, fluffy idlis and authentic sambar from the heart of Tamil Nadu.',
    image: 'https://images.unsplash.com/photo-1630383249896-402a5a5e5a09?w=800&q=80',
    rating: 4.7, deliveryTime: '20-30 min', minOrder: 99,
    city: 'Chennai', state: 'Tamil Nadu', ownerName: 'Senthil Kumar',
    ownerEmail: 'senthil@madrasmess.com', ownerPassword: 'madras123', ownerPhone: '9876504004',
    upiId: '9876504004@paytm', upiName: 'SENTHIL KUMAR',
    bankName: 'Indian Bank', accountNumber: '1234560004', ifscCode: 'IDIB000C001',
    foods: [
      { name: 'Masala Dosa', price: 130, category: 'Veg', description: 'Crispy rice crepe with spiced potato filling', isVeg: true, rating: 4.9, image: 'https://images.unsplash.com/photo-1630383249896-402a5a5e5a09?w=400' },
      { name: 'Idli Sambar (4 pcs)', price: 110, category: 'Veg', description: 'Steamed rice cakes with lentil soup', isVeg: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400' },
      { name: 'Medu Vada', price: 90, category: 'Veg', description: 'Crispy lentil donuts with coconut chutney', isVeg: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
      { name: 'Rava Dosa', price: 140, category: 'Veg', description: 'Crispy semolina crepe with onions', isVeg: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1630383249896-402a5a5e5a09?w=400' },
      { name: 'Pongal', price: 120, category: 'Veg', description: 'Soft rice and lentil comfort food', isVeg: true, rating: 4.5, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400' },
      { name: 'Filter Coffee', price: 60, category: 'Beverages', description: 'South Indian decoction coffee with froth', isVeg: true, rating: 4.9, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400' },
    ],
  },
  {
    name: 'Udupi Sagar', cuisine: 'South Indian',
    description: 'Vegetarian restaurant serving Karnataka and Udupi cuisine with fresh coconut chutneys.',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
    rating: 4.6, deliveryTime: '25-35 min', minOrder: 99,
    city: 'Bengaluru', state: 'Karnataka', ownerName: 'Ramesh Bhat',
    ownerEmail: 'ramesh@udupisagar.com', ownerPassword: 'udupi123', ownerPhone: '9876505005',
    upiId: '9876505005@gpay', upiName: 'RAMESH BHAT',
    bankName: 'Canara Bank', accountNumber: '1234560005', ifscCode: 'CNRB0001001',
    foods: [
      { name: 'Set Dosa (3 pcs)', price: 120, category: 'Veg', description: 'Soft spongy dosas with chutney and sambar', isVeg: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1630383249896-402a5a5e5a09?w=400' },
      { name: 'Bisi Bele Bath', price: 150, category: 'Veg', description: 'Hot lentil rice with vegetables', isVeg: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400' },
      { name: 'Mysore Pak', price: 100, category: 'Desserts', description: 'Rich gram flour and ghee sweet', isVeg: true, rating: 4.9, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400' },
      { name: 'Pesarattu', price: 110, category: 'Veg', description: 'Green moong dal dosa', isVeg: true, rating: 4.5, image: 'https://images.unsplash.com/photo-1630383249896-402a5a5e5a09?w=400' },
      { name: 'Kesari Bath', price: 90, category: 'Desserts', description: 'Semolina halwa with saffron', isVeg: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400' },
      { name: 'Buttermilk', price: 50, category: 'Beverages', description: 'Spiced cold buttermilk', isVeg: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=400' },
    ],
  },
  {
    name: 'Hyderabadi Dum Biryani', cuisine: 'Hyderabadi',
    description: 'Authentic Hyderabadi dum biryani cooked in traditional handi with long-grain basmati.',
    image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=800&q=80',
    rating: 4.9, deliveryTime: '40-50 min', minOrder: 199,
    city: 'Hyderabad', state: 'Telangana', ownerName: 'Abdul Rehman',
    ownerEmail: 'abdul@hydbiryani.com', ownerPassword: 'hyd123', ownerPhone: '9876506006',
    upiId: '9876506006@ybl', upiName: 'ABDUL REHMAN',
    bankName: 'State Bank of Hyderabad', accountNumber: '1234560006', ifscCode: 'SBIN0020001',
    foods: [
      { name: 'Chicken Dum Biryani', price: 380, category: 'Non-Veg', description: 'Dum-style biryani with tender chicken and saffron rice', isVeg: false, rating: 4.9, image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400' },
      { name: 'Mutton Dum Biryani', price: 450, category: 'Non-Veg', description: 'Slow-cooked mutton with Hyderabadi masala', isVeg: false, rating: 4.9, image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400' },
      { name: 'Veg Dum Biryani', price: 280, category: 'Veg', description: 'Mixed vegetable biryani with fresh herbs', isVeg: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400' },
      { name: 'Mirchi Ka Salan', price: 150, category: 'Veg', description: 'Spicy green chilli curry', isVeg: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
      { name: 'Raita', price: 80, category: 'Sides', description: 'Cool yogurt with chopped vegetables', isVeg: true, rating: 4.5, image: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=400' },
      { name: 'Double Ka Meetha', price: 130, category: 'Desserts', description: 'Hyderabadi bread pudding with dry fruits', isVeg: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400' },
    ],
  },
  {
    name: 'Biryani Nation', cuisine: 'Biryani',
    description: 'Biryanis from across India — Kolkata, Lucknowi, Sindhi under one roof.',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80',
    rating: 4.7, deliveryTime: '35-45 min', minOrder: 179,
    city: 'Mumbai', state: 'Maharashtra', ownerName: 'Vikas Malhotra',
    ownerEmail: 'vikas@biryanination.com', ownerPassword: 'biryani123', ownerPhone: '9876507007',
    upiId: '9876507007@paytm', upiName: 'VIKAS MALHOTRA',
    bankName: 'Axis Bank', accountNumber: '1234560007', ifscCode: 'UTIB0000123',
    foods: [
      { name: 'Kolkata Biryani', price: 350, category: 'Non-Veg', description: 'Kolkata-style biryani with potato and egg', isVeg: false, rating: 4.8, image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400' },
      { name: 'Sindhi Biryani', price: 360, category: 'Non-Veg', description: 'Tangy and spicy Sindhi-style biryani', isVeg: false, rating: 4.7, image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400' },
      { name: 'Prawn Biryani', price: 420, category: 'Non-Veg', description: 'Fragrant biryani with fresh prawns', isVeg: false, rating: 4.8, image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400' },
      { name: 'Paneer Biryani', price: 290, category: 'Veg', description: 'Cottage cheese biryani with whole spices', isVeg: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400' },
      { name: 'Egg Biryani', price: 270, category: 'Non-Veg', description: 'Flavourful biryani with boiled eggs', isVeg: false, rating: 4.5, image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400' },
      { name: 'Shahi Tukda', price: 140, category: 'Desserts', description: 'Fried bread soaked in rabri', isVeg: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400' },
    ],
  },
  {
    name: 'Chaat Chowk', cuisine: 'Street Food',
    description: 'Famous Indian street food — pani puri, bhel puri, dahi puri and sev puri.',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80',
    rating: 4.6, deliveryTime: '15-25 min', minOrder: 79,
    city: 'Mumbai', state: 'Maharashtra', ownerName: 'Nilesh Patil',
    ownerEmail: 'nilesh@chaatchowk.com', ownerPassword: 'chaat123', ownerPhone: '9876508008',
    upiId: '9876508008@gpay', upiName: 'NILESH PATIL',
    bankName: 'ICICI Bank', accountNumber: '1234560008', ifscCode: 'ICIC0001234',
    foods: [
      { name: 'Pani Puri (10 pcs)', price: 80, category: 'Street Food', description: 'Crispy hollow puris filled with spiced tamarind water', isVeg: true, rating: 4.9, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400' },
      { name: 'Bhel Puri', price: 90, category: 'Street Food', description: 'Puffed rice mixed with chutneys and sev', isVeg: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
      { name: 'Dahi Puri', price: 110, category: 'Street Food', description: 'Puri topped with sweet yogurt and chutneys', isVeg: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400' },
      { name: 'Sev Puri', price: 100, category: 'Street Food', description: 'Crispy puri with sev, potatoes and chutneys', isVeg: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
      { name: 'Ragda Pattice', price: 130, category: 'Street Food', description: 'Spiced peas with potato patties', isVeg: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400' },
      { name: 'Sugarcane Juice', price: 60, category: 'Beverages', description: 'Fresh cold sugarcane juice with lemon and ginger', isVeg: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400' },
    ],
  },
  {
    name: 'Mumbai Masala', cuisine: 'Mumbai Street Food',
    description: "The best of Mumbai on your plate — vada pav, pav bhaji, misal pav.",
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
    rating: 4.8, deliveryTime: '20-30 min', minOrder: 99,
    city: 'Mumbai', state: 'Maharashtra', ownerName: 'Sanjay Jadhav',
    ownerEmail: 'sanjay@mumbaimasala.com', ownerPassword: 'mumbai123', ownerPhone: '9876509009',
    upiId: '9876509009@ybl', upiName: 'SANJAY JADHAV',
    bankName: 'Bank of Maharashtra', accountNumber: '1234560009', ifscCode: 'MAHB0001001',
    foods: [
      { name: 'Vada Pav', price: 50, category: 'Street Food', description: "Mumbai's favourite — spiced potato in pav", isVeg: true, rating: 4.9, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400' },
      { name: 'Pav Bhaji', price: 140, category: 'Veg', description: 'Rich vegetable mash with buttered pav', isVeg: true, rating: 4.9, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
      { name: 'Misal Pav', price: 130, category: 'Veg', description: 'Spicy sprouted lentils topped with sev', isVeg: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400' },
      { name: 'Bombay Sandwich', price: 120, category: 'Street Food', description: 'Grilled sandwich with chutneys and veggies', isVeg: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1554679665-f5537f187268?w=400' },
      { name: 'Bhakri Wadi', price: 160, category: 'Veg', description: 'Jowar bhakri with spiced vegetable sabzi', isVeg: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400' },
      { name: 'Solkadhi', price: 70, category: 'Beverages', description: 'Kokum and coconut milk digestive drink', isVeg: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=400' },
    ],
  },
  {
    name: 'Kolkata Kitchen', cuisine: 'Bengali',
    description: 'Authentic Bengali fish curries, mustard preparations and traditional mishti doi.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
    rating: 4.7, deliveryTime: '35-45 min', minOrder: 149,
    city: 'Kolkata', state: 'West Bengal', ownerName: 'Debashis Chatterjee',
    ownerEmail: 'debashis@kolkatakitchen.com', ownerPassword: 'kolkata123', ownerPhone: '9876510010',
    upiId: '9876510010@paytm', upiName: 'DEBASHIS CHATTERJEE',
    bankName: 'UCO Bank', accountNumber: '1234560010', ifscCode: 'UCBA0001001',
    foods: [
      { name: 'Macher Jhol', price: 280, category: 'Non-Veg', description: 'Bengali fish curry with potatoes', isVeg: false, rating: 4.8, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400' },
      { name: 'Chingri Malai Curry', price: 380, category: 'Non-Veg', description: 'Prawns in coconut milk curry', isVeg: false, rating: 4.9, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400' },
      { name: 'Kosha Mangsho', price: 350, category: 'Non-Veg', description: 'Slow-cooked spicy mutton curry', isVeg: false, rating: 4.8, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400' },
      { name: 'Aloo Posto', price: 160, category: 'Veg', description: 'Potatoes cooked in poppy seed paste', isVeg: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
      { name: 'Luchi with Alur Dom', price: 140, category: 'Veg', description: 'Deep-fried bread with potato curry', isVeg: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400' },
      { name: 'Mishti Doi', price: 90, category: 'Desserts', description: 'Sweetened caramel yogurt', isVeg: true, rating: 4.9, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400' },
    ],
  },
  {
    name: 'Gujarat Bhavan', cuisine: 'Gujarati',
    description: 'Complete Gujarati thali with dhokla, fafda, thepla and traditional sweets.',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80',
    rating: 4.6, deliveryTime: '25-35 min', minOrder: 129,
    city: 'Ahmedabad', state: 'Gujarat', ownerName: 'Haresh Shah',
    ownerEmail: 'haresh@gujaratbhavan.com', ownerPassword: 'gujarat123', ownerPhone: '9876511011',
    upiId: '9876511011@gpay', upiName: 'HARESH SHAH',
    bankName: 'Kotak Mahindra Bank', accountNumber: '1234560011', ifscCode: 'KKBK0001001',
    foods: [
      { name: 'Gujarati Thali', price: 250, category: 'Veg', description: 'Full thali with dal, sabzi, roti, rice and sweets', isVeg: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400' },
      { name: 'Dhokla (8 pcs)', price: 100, category: 'Veg', description: 'Steamed fermented gram flour snack', isVeg: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
      { name: 'Fafda Jalebi Combo', price: 130, category: 'Veg', description: 'Crispy gram flour strips with sweet jalebi', isVeg: true, rating: 4.9, image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400' },
      { name: 'Thepla Combo', price: 110, category: 'Veg', description: 'Spiced fenugreek flatbreads with pickle', isVeg: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400' },
      { name: 'Undhiyu', price: 200, category: 'Veg', description: 'Mixed vegetable dish with fenugreek dumplings', isVeg: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
      { name: 'Shrikhand', price: 100, category: 'Desserts', description: 'Sweetened strained yogurt with saffron', isVeg: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400' },
    ],
  },
  {
    name: 'Desert Haveli', cuisine: 'Rajasthani',
    description: 'Royal Rajasthani cuisine — dal baati churma, laal maas and ker sangri.',
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80',
    rating: 4.7, deliveryTime: '35-45 min', minOrder: 169,
    city: 'Jaipur', state: 'Rajasthan', ownerName: 'Lakshman Singh',
    ownerEmail: 'lakshman@deserthaveli.com', ownerPassword: 'rajasthan123', ownerPhone: '9876512012',
    upiId: '9876512012@ybl', upiName: 'LAKSHMAN SINGH',
    bankName: 'State Bank of Bikaner and Jaipur', accountNumber: '1234560012', ifscCode: 'SBIN0030001',
    foods: [
      { name: 'Dal Baati Churma', price: 280, category: 'Veg', description: 'The signature Rajasthani dish', isVeg: true, rating: 4.9, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400' },
      { name: 'Laal Maas', price: 380, category: 'Non-Veg', description: 'Fiery red mutton curry with Mathania chillies', isVeg: false, rating: 4.8, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400' },
      { name: 'Ker Sangri Sabzi', price: 180, category: 'Veg', description: 'Desert beans and berries traditional sabzi', isVeg: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
      { name: 'Pyaaz Kachori', price: 120, category: 'Street Food', description: 'Flaky pastry with spiced onion filling', isVeg: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400' },
      { name: 'Ghevar', price: 150, category: 'Desserts', description: 'Festive Rajasthani disc-shaped sweet', isVeg: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400' },
      { name: 'Thandai', price: 90, category: 'Beverages', description: 'Chilled milk with nuts and spices', isVeg: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=400' },
    ],
  },
  {
    name: 'Kerala Nirvana', cuisine: 'Kerala',
    description: 'Authentic Kerala cuisine — appam, puttu, fish molee and toddy shop favourites.',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
    rating: 4.8, deliveryTime: '30-40 min', minOrder: 149,
    city: 'Kochi', state: 'Kerala', ownerName: 'Thomas Cherian',
    ownerEmail: 'thomas@keralanirvana.com', ownerPassword: 'kerala123', ownerPhone: '9876513013',
    upiId: '9876513013@paytm', upiName: 'THOMAS CHERIAN',
    bankName: 'Federal Bank', accountNumber: '1234560013', ifscCode: 'FDRL0001001',
    foods: [
      { name: 'Kerala Fish Curry', price: 300, category: 'Non-Veg', description: 'Coconut milk fish curry with raw mango', isVeg: false, rating: 4.9, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400' },
      { name: 'Appam with Stew', price: 160, category: 'Non-Veg', description: 'Lacy rice hoppers with Kerala chicken stew', isVeg: false, rating: 4.8, image: 'https://images.unsplash.com/photo-1630383249896-402a5a5e5a09?w=400' },
      { name: 'Puttu and Kadala', price: 150, category: 'Veg', description: 'Steamed rice cylinders with black chickpea curry', isVeg: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400' },
      { name: 'Karimeen Pollichathu', price: 420, category: 'Non-Veg', description: 'Pearl spot fish wrapped in banana leaf', isVeg: false, rating: 4.9, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400' },
      { name: 'Kozhikodan Biriyani', price: 350, category: 'Non-Veg', description: 'Malabar-style fragrant chicken biryani', isVeg: false, rating: 4.8, image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400' },
      { name: 'Payasam', price: 120, category: 'Desserts', description: 'Creamy rice and vermicelli kheer', isVeg: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400' },
    ],
  },
  {
    name: 'Dragon Wok', cuisine: 'Indo-Chinese',
    description: 'The best Indo-Chinese food — dragon chicken, hakka noodles, fried rice and Manchurian.',
    image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=800&q=80',
    rating: 4.6, deliveryTime: '25-35 min', minOrder: 129,
    city: 'Delhi', state: 'Delhi', ownerName: 'Rocky Chen',
    ownerEmail: 'rocky@dragonwok.com', ownerPassword: 'dragon123', ownerPhone: '9876514014',
    upiId: '9876514014@gpay', upiName: 'ROCKY CHEN',
    bankName: 'HDFC Bank', accountNumber: '1234560014', ifscCode: 'HDFC0002345',
    foods: [
      { name: 'Chicken Manchurian', price: 250, category: 'Non-Veg', description: 'Crispy chicken in spicy Manchurian sauce', isVeg: false, rating: 4.7, image: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=400' },
      { name: 'Veg Hakka Noodles', price: 180, category: 'Veg', description: 'Stir-fried noodles with vegetables', isVeg: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400' },
      { name: 'Chicken Fried Rice', price: 220, category: 'Non-Veg', description: 'Wok-tossed egg fried rice with chicken', isVeg: false, rating: 4.7, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400' },
      { name: 'Paneer Chilli', price: 230, category: 'Veg', description: 'Paneer in spicy chilli sauce', isVeg: true, rating: 4.5, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400' },
      { name: 'Spring Rolls (6 pcs)', price: 160, category: 'Veg', description: 'Crispy rolls with vegetable filling', isVeg: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400' },
      { name: 'Hot and Sour Soup', price: 130, category: 'Veg', description: 'Tangy soup with vegetables', isVeg: true, rating: 4.5, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400' },
    ],
  },
  {
    name: 'Wok Street', cuisine: 'Indo-Chinese',
    description: 'Street-style Indo-Chinese bowls, baos and quick bites at affordable prices.',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80',
    rating: 4.5, deliveryTime: '20-30 min', minOrder: 99,
    city: 'Bengaluru', state: 'Karnataka', ownerName: 'Priya Sharma',
    ownerEmail: 'priya@wokstreet.com', ownerPassword: 'wok123', ownerPhone: '9876515015',
    upiId: '9876515015@ybl', upiName: 'PRIYA SHARMA',
    bankName: 'Yes Bank', accountNumber: '1234560015', ifscCode: 'YESB0001001',
    foods: [
      { name: 'Schezwan Noodles', price: 180, category: 'Veg', description: 'Fiery Schezwan sauce noodles', isVeg: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400' },
      { name: 'Honey Chilli Potato', price: 160, category: 'Veg', description: 'Crispy potatoes in sweet chilli glaze', isVeg: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
      { name: 'Dragon Chicken', price: 260, category: 'Non-Veg', description: 'Fiery chicken with dragon sauce', isVeg: false, rating: 4.8, image: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=400' },
      { name: 'Mushroom Fried Rice', price: 190, category: 'Veg', description: 'Wok fried rice with mushrooms and soy', isVeg: true, rating: 4.5, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400' },
      { name: 'Chicken Lollipop (6 pcs)', price: 220, category: 'Non-Veg', description: 'Deep fried chicken wings in spicy batter', isVeg: false, rating: 4.7, image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400' },
      { name: 'Lemon Iced Tea', price: 80, category: 'Beverages', description: 'Chilled lemon iced tea', isVeg: true, rating: 4.5, image: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=400' },
    ],
  },
  {
    name: 'Burger Baazi', cuisine: 'Fast Food',
    description: 'Gourmet burgers, crispy fries and milkshakes made fresh every order.',
    image: 'https://images.unsplash.com/photo-1554679665-f5537f187268?w=800&q=80',
    rating: 4.6, deliveryTime: '20-30 min', minOrder: 129,
    city: 'Pune', state: 'Maharashtra', ownerName: 'Aakash Mehta',
    ownerEmail: 'aakash@burgerbaazi.com', ownerPassword: 'burger123', ownerPhone: '9876516016',
    upiId: '9876516016@paytm', upiName: 'AAKASH MEHTA',
    bankName: 'IDFC First Bank', accountNumber: '1234560016', ifscCode: 'IDFB0001001',
    foods: [
      { name: 'Classic Chicken Burger', price: 220, category: 'Non-Veg', description: 'Crispy fried chicken in a brioche bun', isVeg: false, rating: 4.7, image: 'https://images.unsplash.com/photo-1554679665-f5537f187268?w=400' },
      { name: 'Double Patty Veggie Burger', price: 200, category: 'Veg', description: 'Double veggie patty with pesto mayo', isVeg: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1554679665-f5537f187268?w=400' },
      { name: 'Peri Peri Loaded Fries', price: 160, category: 'Veg', description: 'Crispy fries with peri peri seasoning and cheese sauce', isVeg: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
      { name: 'Mutton Smash Burger', price: 299, category: 'Non-Veg', description: 'Smashed mutton patty with caramelised onions', isVeg: false, rating: 4.9, image: 'https://images.unsplash.com/photo-1554679665-f5537f187268?w=400' },
      { name: 'Onion Rings', price: 120, category: 'Veg', description: 'Golden battered onion rings', isVeg: true, rating: 4.5, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
      { name: 'Oreo Milkshake', price: 180, category: 'Beverages', description: 'Thick Oreo and ice cream milkshake', isVeg: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=400' },
    ],
  },
  {
    name: 'FoodBox Express', cuisine: 'Fast Food',
    description: 'Quick bites — wraps, sandwiches, fries and refreshing drinks under 30 minutes.',
    image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&q=80',
    rating: 4.4, deliveryTime: '15-25 min', minOrder: 99,
    city: 'Noida', state: 'Uttar Pradesh', ownerName: 'Ritika Jain',
    ownerEmail: 'ritika@foodboxexpress.com', ownerPassword: 'foodbox123', ownerPhone: '9876517017',
    upiId: '9876517017@gpay', upiName: 'RITIKA JAIN',
    bankName: 'Kotak Mahindra Bank', accountNumber: '1234560017', ifscCode: 'KKBK0002001',
    foods: [
      { name: 'Chicken Tikka Wrap', price: 180, category: 'Non-Veg', description: 'Grilled chicken tikka in a wheat wrap', isVeg: false, rating: 4.6, image: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=400' },
      { name: 'Veg Club Sandwich', price: 150, category: 'Veg', description: 'Triple-layer sandwich with veggies and mayo', isVeg: true, rating: 4.5, image: 'https://images.unsplash.com/photo-1554679665-f5537f187268?w=400' },
      { name: 'Masala Corn', price: 90, category: 'Veg', description: 'Butter and spice-tossed sweet corn', isVeg: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
      { name: 'Paneer Roll', price: 170, category: 'Veg', description: 'Paneer tikka in a flaky paratha roll', isVeg: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=400' },
      { name: 'Cheesy Fries', price: 130, category: 'Veg', description: 'Golden fries with melted cheese sauce', isVeg: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
      { name: 'Cold Coffee', price: 120, category: 'Beverages', description: 'Chilled blended coffee with cream', isVeg: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400' },
    ],
  },
  {
    name: 'Pizza Piazza', cuisine: 'Pizza',
    description: 'Wood-fired Neapolitan-style pizzas with Indian toppings and thin crispy bases.',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
    rating: 4.7, deliveryTime: '30-40 min', minOrder: 199,
    city: 'Bengaluru', state: 'Karnataka', ownerName: 'Marco Fernandes',
    ownerEmail: 'marco@pizzapiazza.com', ownerPassword: 'pizza123', ownerPhone: '9876518018',
    upiId: '9876518018@ybl', upiName: 'MARCO FERNANDES',
    bankName: 'ICICI Bank', accountNumber: '1234560018', ifscCode: 'ICIC0002234',
    foods: [
      { name: 'Margherita Pizza', price: 280, category: 'Veg', description: 'Classic tomato, mozzarella and basil', isVeg: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400' },
      { name: 'Tikka Chicken Pizza', price: 350, category: 'Non-Veg', description: 'Chicken tikka with peppers and onions', isVeg: false, rating: 4.8, image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400' },
      { name: 'Paneer Tikka Pizza', price: 320, category: 'Veg', description: 'Spicy paneer tikka on herb base', isVeg: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400' },
      { name: 'BBQ Chicken Pizza', price: 360, category: 'Non-Veg', description: 'Smoky BBQ sauce with grilled chicken', isVeg: false, rating: 4.7, image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400' },
      { name: 'Garlic Bread with Dip', price: 150, category: 'Veg', description: 'Crispy garlic bread with cheese dip', isVeg: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400' },
      { name: 'Tiramisu', price: 200, category: 'Desserts', description: 'Classic Italian coffee dessert', isVeg: true, rating: 4.9, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400' },
    ],
  },
  {
    name: 'Coastal Cravings', cuisine: 'Seafood',
    description: 'Fresh-catch coastal seafood — Goan prawn curry, Chettinad fish fry and more.',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
    rating: 4.8, deliveryTime: '35-45 min', minOrder: 199,
    city: 'Goa', state: 'Goa', ownerName: 'Anthony DSouza',
    ownerEmail: 'anthony@coastalcravings.com', ownerPassword: 'coastal123', ownerPhone: '9876519019',
    upiId: '9876519019@paytm', upiName: 'ANTHONY DSOUZA',
    bankName: 'Goa Urban Co-op Bank', accountNumber: '1234560019', ifscCode: 'GUCB0000001',
    foods: [
      { name: 'Goan Prawn Curry', price: 380, category: 'Non-Veg', description: 'Coconut prawn curry Goan style', isVeg: false, rating: 4.9, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400' },
      { name: 'Chettinad Fish Fry', price: 340, category: 'Non-Veg', description: 'Spiced shallow-fried fish', isVeg: false, rating: 4.8, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400' },
      { name: 'Butter Garlic Crab', price: 550, category: 'Non-Veg', description: 'Crab tossed in garlic butter sauce', isVeg: false, rating: 4.9, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400' },
      { name: 'Recheado Pomfret', price: 420, category: 'Non-Veg', description: 'Goan stuffed pomfret with red masala', isVeg: false, rating: 4.7, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400' },
      { name: 'Prawn Koliwada', price: 280, category: 'Non-Veg', description: 'Mumbai-style crispy fried prawns', isVeg: false, rating: 4.7, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
      { name: 'Coconut Water', price: 70, category: 'Beverages', description: 'Fresh tender coconut water', isVeg: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400' },
    ],
  },
  {
    name: 'Meetha Den', cuisine: 'Desserts & Sweets',
    description: 'Traditional Indian mithai, ice creams, kulfi, halwa and festival specials.',
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800&q=80',
    rating: 4.8, deliveryTime: '20-30 min', minOrder: 99,
    city: 'Delhi', state: 'Delhi', ownerName: 'Meera Gupta',
    ownerEmail: 'meera@meethaden.com', ownerPassword: 'meetha123', ownerPhone: '9876520020',
    upiId: '9876520020@gpay', upiName: 'MEERA GUPTA',
    bankName: 'State Bank of India', accountNumber: '1234560020', ifscCode: 'SBIN0010001',
    foods: [
      { name: 'Gulab Jamun (6 pcs)', price: 100, category: 'Desserts', description: 'Soft milk-solid balls soaked in sugar syrup', isVeg: true, rating: 4.9, image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400' },
      { name: 'Kulfi (Malai)', price: 80, category: 'Desserts', description: 'Thick Indian ice cream on a stick', isVeg: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400' },
      { name: 'Jalebi (200g)', price: 120, category: 'Desserts', description: 'Crispy spirals in sugar syrup', isVeg: true, rating: 4.9, image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400' },
      { name: 'Gajar Ka Halwa', price: 130, category: 'Desserts', description: 'Slow-cooked carrot dessert with khoya', isVeg: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400' },
      { name: 'Rasmalai (4 pcs)', price: 150, category: 'Desserts', description: 'Cottage cheese discs in saffron milk', isVeg: true, rating: 4.9, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400' },
      { name: 'Kesar Kheer', price: 110, category: 'Desserts', description: 'Rice pudding with saffron and dry fruits', isVeg: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400' },
    ],
  },
  {
    name: 'Green Spoon', cuisine: 'Healthy & Salads',
    description: 'Nutritious bowls, salads, smoothies and low-calorie Indian meals.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
    rating: 4.5, deliveryTime: '20-30 min', minOrder: 149,
    city: 'Mumbai', state: 'Maharashtra', ownerName: 'Sneha Kapoor',
    ownerEmail: 'sneha@greenspoon.com', ownerPassword: 'green123', ownerPhone: '9876521021',
    upiId: '9876521021@ybl', upiName: 'SNEHA KAPOOR',
    bankName: 'RBL Bank', accountNumber: '1234560021', ifscCode: 'RATN0000001',
    foods: [
      { name: 'Quinoa Veggie Bowl', price: 260, category: 'Veg', description: 'Quinoa with roasted veggies and tahini', isVeg: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400' },
      { name: 'Grilled Chicken Caesar', price: 280, category: 'Non-Veg', description: 'Grilled chicken with romaine and Caesar dressing', isVeg: false, rating: 4.5, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400' },
      { name: 'Sprouts Chaat', price: 150, category: 'Veg', description: 'Mixed sprouts with lemon and spices', isVeg: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
      { name: 'Multigrain Wrap', price: 200, category: 'Veg', description: 'Multigrain wrap with hummus and grilled veggies', isVeg: true, rating: 4.5, image: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=400' },
      { name: 'Acai Smoothie Bowl', price: 240, category: 'Veg', description: 'Acai blended with berries and topped with granola', isVeg: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400' },
      { name: 'Detox Green Juice', price: 150, category: 'Beverages', description: 'Spinach, cucumber, ginger and apple juice', isVeg: true, rating: 4.5, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400' },
    ],
  },
  {
    name: 'Morning Bites', cuisine: 'Breakfast',
    description: 'Start your day right — poha, upma, parathas, omelette, idli and more.',
    image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&q=80',
    rating: 4.7, deliveryTime: '20-30 min', minOrder: 79,
    city: 'Indore', state: 'Madhya Pradesh', ownerName: 'Ravi Dwivedi',
    ownerEmail: 'ravi@morningbites.com', ownerPassword: 'morning123', ownerPhone: '9876522022',
    upiId: '9876522022@paytm', upiName: 'RAVI DWIVEDI',
    bankName: 'Central Bank of India', accountNumber: '1234560022', ifscCode: 'CBIN0001001',
    foods: [
      { name: 'Batata Poha', price: 90, category: 'Veg', description: 'Indore-style poha with sev and lemon', isVeg: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
      { name: 'Upma', price: 80, category: 'Veg', description: 'South Indian semolina upma with veggies', isVeg: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400' },
      { name: 'Cheese Omelette', price: 120, category: 'Non-Veg', description: 'Fluffy 3-egg omelette with cheese', isVeg: false, rating: 4.7, image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400' },
      { name: 'Stuffed Aloo Paratha (2 pcs)', price: 140, category: 'Veg', description: 'Crispy parathas with white butter', isVeg: true, rating: 4.9, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400' },
      { name: 'Banana Pancakes', price: 160, category: 'Veg', description: 'Fluffy pancakes with banana and honey', isVeg: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400' },
      { name: 'Masala Chai', price: 40, category: 'Beverages', description: 'Spiced ginger and cardamom tea', isVeg: true, rating: 4.9, image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400' },
    ],
  },
  {
    name: 'Goa Sun and Food', cuisine: 'Goan',
    description: 'Goan specialties — pork vindaloo, bebinca, sorpotel and the freshest calamari.',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
    rating: 4.7, deliveryTime: '30-40 min', minOrder: 149,
    city: 'Panaji', state: 'Goa', ownerName: 'Carlos Rodrigues',
    ownerEmail: 'carlos@goasunfood.com', ownerPassword: 'goa123', ownerPhone: '9876523023',
    upiId: '9876523023@gpay', upiName: 'CARLOS RODRIGUES',
    bankName: 'Bank of India', accountNumber: '1234560023', ifscCode: 'BKID0001001',
    foods: [
      { name: 'Pork Vindaloo', price: 360, category: 'Non-Veg', description: 'Fiery Goan pork curry vinegar-spiced', isVeg: false, rating: 4.8, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400' },
      { name: 'Beef Sorpotel', price: 380, category: 'Non-Veg', description: 'Tangy pork and liver Goan specialty', isVeg: false, rating: 4.7, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400' },
      { name: 'Calamari Fry', price: 340, category: 'Non-Veg', description: 'Crispy fried squid rings', isVeg: false, rating: 4.8, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400' },
      { name: 'Xacuti Chicken', price: 320, category: 'Non-Veg', description: 'Roasted coconut and poppy seed chicken', isVeg: false, rating: 4.7, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400' },
      { name: 'Bebinca (Slice)', price: 150, category: 'Desserts', description: 'Traditional layered Goan coconut pudding', isVeg: true, rating: 4.9, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400' },
      { name: 'Coconut Feni Mocktail', price: 100, category: 'Beverages', description: 'Authentic Goan coconut toddy mocktail', isVeg: true, rating: 4.5, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400' },
    ],
  },
  {
    name: 'Amritsar Dhaba', cuisine: 'Punjabi',
    description: 'Amritsari kulcha, tandoori chicken and authentic Punjabi flavours from the holy city.',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80',
    rating: 4.8, deliveryTime: '30-40 min', minOrder: 149,
    city: 'Amritsar', state: 'Punjab', ownerName: 'Jatinder Sandhu',
    ownerEmail: 'jatinder@amritsardhaba.com', ownerPassword: 'amritsar123', ownerPhone: '9876524024',
    upiId: '9876524024@ybl', upiName: 'JATINDER SANDHU',
    bankName: 'Punjab and Sind Bank', accountNumber: '1234560024', ifscCode: 'PSIB0001001',
    foods: [
      { name: 'Amritsari Kulcha (2 pcs)', price: 160, category: 'Veg', description: 'Stuffed tandoor kulcha with chole', isVeg: true, rating: 4.9, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400' },
      { name: 'Tandoori Chicken (Half)', price: 350, category: 'Non-Veg', description: 'Chargrilled chicken marinated overnight', isVeg: false, rating: 4.9, image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400' },
      { name: 'Amritsari Fish Fry', price: 320, category: 'Non-Veg', description: 'Crispy battered fresh water fish', isVeg: false, rating: 4.8, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400' },
      { name: 'Sarson Ka Saag Makki Roti', price: 200, category: 'Veg', description: 'Mustard greens with maize flatbread', isVeg: true, rating: 4.9, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
      { name: 'Mango Lassi', price: 90, category: 'Beverages', description: 'Thick mango-flavoured yogurt drink', isVeg: true, rating: 4.9, image: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=400' },
      { name: 'Pinni (100g)', price: 100, category: 'Desserts', description: 'Whole wheat and jaggery Punjabi sweet', isVeg: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400' },
    ],
  },
  {
    name: 'Highway Dhaba', cuisine: 'Multi-Cuisine',
    description: 'Classic highway dhaba experience — generous portions, home-style curries.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    rating: 4.5, deliveryTime: '30-40 min', minOrder: 129,
    city: 'Nashik', state: 'Maharashtra', ownerName: 'Bharat Shinde',
    ownerEmail: 'bharat@highwaydhaba.com', ownerPassword: 'highway123', ownerPhone: '9876525025',
    upiId: '9876525025@paytm', upiName: 'BHARAT SHINDE',
    bankName: 'Union Bank of India', accountNumber: '1234560025', ifscCode: 'UBIN0001001',
    foods: [
      { name: 'Roti Sabzi Thali', price: 180, category: 'Veg', description: '4 rotis with 2 sabzis, dal and rice', isVeg: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400' },
      { name: 'Chicken Curry with Rice', price: 240, category: 'Non-Veg', description: 'Home-style chicken curry with steamed rice', isVeg: false, rating: 4.7, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400' },
      { name: 'Egg Bhurji Pav', price: 120, category: 'Non-Veg', description: 'Scrambled spiced eggs with buttered pav', isVeg: false, rating: 4.8, image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400' },
      { name: 'Mixed Veg Curry', price: 160, category: 'Veg', description: 'Seasonal vegetables in masala gravy', isVeg: true, rating: 4.5, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
      { name: 'Butter Roti (4 pcs)', price: 60, category: 'Breads', description: 'Soft butter rotis from the tandoor', isVeg: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400' },
      { name: 'Chaas', price: 50, category: 'Beverages', description: 'Cold masala buttermilk', isVeg: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=400' },
    ],
  },
  {
    name: 'Annapurna Family Restaurant', cuisine: 'Multi-Cuisine',
    description: 'All-in-one family restaurant with Indian, Chinese and South Indian options.',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    rating: 4.4, deliveryTime: '30-45 min', minOrder: 149,
    city: 'Surat', state: 'Gujarat', ownerName: 'Kiran Patel',
    ownerEmail: 'kiran@annapurna.com', ownerPassword: 'anna123', ownerPhone: '9876526026',
    upiId: '9876526026@gpay', upiName: 'KIRAN PATEL',
    bankName: 'Dena Bank', accountNumber: '1234560026', ifscCode: 'BKDN0001001',
    foods: [
      { name: 'Paneer Tikka Masala', price: 270, category: 'Veg', description: 'Grilled paneer in spicy masala', isVeg: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400' },
      { name: 'Chicken 65', price: 260, category: 'Non-Veg', description: 'Deep-fried spicy chicken bites', isVeg: false, rating: 4.7, image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400' },
      { name: 'Veg Noodles', price: 170, category: 'Veg', description: 'Stir-fried noodles with veggies', isVeg: true, rating: 4.4, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400' },
      { name: 'Special Fried Rice', price: 200, category: 'Non-Veg', description: 'Classic egg fried rice', isVeg: false, rating: 4.5, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400' },
      { name: 'Gulab Jamun (4 pcs)', price: 80, category: 'Desserts', description: 'Soft jamuns in sugar syrup', isVeg: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400' },
      { name: 'Fresh Lime Soda', price: 60, category: 'Beverages', description: 'Chilled lime soda with salt or sweet', isVeg: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400' },
    ],
  },
  {
    name: 'Taste of India', cuisine: 'Multi-Cuisine',
    description: 'Celebrating all of India in one menu — from Kashmir to Kanyakumari.',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80',
    rating: 4.6, deliveryTime: '35-45 min', minOrder: 179,
    city: 'Hyderabad', state: 'Telangana', ownerName: 'Sunil Nagpal',
    ownerEmail: 'sunil@tasteofindia.com', ownerPassword: 'taste123', ownerPhone: '9876527027',
    upiId: '9876527027@ybl', upiName: 'SUNIL NAGPAL',
    bankName: 'HDFC Bank', accountNumber: '1234560027', ifscCode: 'HDFC0003456',
    foods: [
      { name: 'Kashmiri Rogan Josh', price: 380, category: 'Non-Veg', description: 'Aromatic lamb curry from Kashmir', isVeg: false, rating: 4.9, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400' },
      { name: 'Avial', price: 200, category: 'Veg', description: 'Mixed vegetable Kerala dish in coconut', isVeg: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
      { name: 'Gongura Chicken', price: 320, category: 'Non-Veg', description: 'Andhra sorrel leaf spicy chicken', isVeg: false, rating: 4.7, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400' },
      { name: 'Bisi Bele Bath', price: 180, category: 'Veg', description: 'Karnataka hot lentil rice', isVeg: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400' },
      { name: 'Naan Basket', price: 80, category: 'Breads', description: 'Assorted naans — butter, garlic, plain (3 pcs)', isVeg: true, rating: 4.5, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400' },
      { name: 'Kheer', price: 100, category: 'Desserts', description: 'Creamy rose-scented rice pudding', isVeg: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400' },
    ],
  },
  {
    name: 'Chettinad Kitchen', cuisine: 'South Indian',
    description: 'Bold Chettinad flavours — fiery curries, kuzhambu and traditional clay-pot cooking.',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80',
    rating: 4.8, deliveryTime: '35-45 min', minOrder: 169,
    city: 'Chennai', state: 'Tamil Nadu', ownerName: 'Velankanni Raj',
    ownerEmail: 'vel@chettikitchen.com', ownerPassword: 'chetti123', ownerPhone: '9876528028',
    upiId: '9876528028@paytm', upiName: 'VELANKANNI RAJ',
    bankName: 'South Indian Bank', accountNumber: '1234560028', ifscCode: 'SIBL0000001',
    foods: [
      { name: 'Chettinad Chicken Curry', price: 320, category: 'Non-Veg', description: 'Intensely spiced chicken with kalpasi', isVeg: false, rating: 4.9, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400' },
      { name: 'Kavuni Arisi Payasam', price: 130, category: 'Desserts', description: 'Black rice kheer Chettinad style', isVeg: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400' },
      { name: 'Kothu Parotta', price: 200, category: 'Non-Veg', description: 'Shredded parotta with egg and masala', isVeg: false, rating: 4.8, image: 'https://images.unsplash.com/photo-1630383249896-402a5a5e5a09?w=400' },
      { name: 'Chettinad Egg Roast', price: 180, category: 'Non-Veg', description: 'Dry masala egg roast', isVeg: false, rating: 4.7, image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400' },
      { name: 'Paniyaram', price: 130, category: 'Veg', description: 'Crispy fermented batter balls', isVeg: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1630383249896-402a5a5e5a09?w=400' },
      { name: 'Nannari Sherbet', price: 70, category: 'Beverages', description: 'Chilled Indian sarsaparilla sherbet', isVeg: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400' },
    ],
  },
  {
    name: 'Himalayan Bites', cuisine: 'Tibetan and Northeast Indian',
    description: 'Momos, thukpa and the best Himalayan comfort food in town.',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80',
    rating: 4.7, deliveryTime: '25-35 min', minOrder: 129,
    city: 'Darjeeling', state: 'West Bengal', ownerName: 'Tenzin Dorje',
    ownerEmail: 'tenzin@himalayanbites.com', ownerPassword: 'momo123', ownerPhone: '9876529029',
    upiId: '9876529029@gpay', upiName: 'TENZIN DORJE',
    bankName: 'State Bank of India', accountNumber: '1234560029', ifscCode: 'SBIN0040001',
    foods: [
      { name: 'Steamed Veg Momos (10 pcs)', price: 140, category: 'Veg', description: 'Steamed dumplings with cabbage and cheese filling', isVeg: true, rating: 4.9, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
      { name: 'Chicken Pan-fried Momos (8 pcs)', price: 180, category: 'Non-Veg', description: 'Crispy pan-fried chicken dumplings', isVeg: false, rating: 4.9, image: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=400' },
      { name: 'Thukpa Soup', price: 160, category: 'Non-Veg', description: 'Tibetan noodle soup with vegetables and meat', isVeg: false, rating: 4.8, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400' },
      { name: 'Shakpa', price: 180, category: 'Non-Veg', description: 'Traditional Tibetan meat stew', isVeg: false, rating: 4.7, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400' },
      { name: 'Sel Roti', price: 80, category: 'Veg', description: 'Sweet crispy Nepali rice flour doughnut', isVeg: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400' },
      { name: 'Butter Tea', price: 60, category: 'Beverages', description: 'Himalayan salted butter tea', isVeg: true, rating: 4.5, image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400' },
    ],
  },
  {
    name: 'Grill House India', cuisine: 'BBQ and Grill',
    description: 'Premium BBQ and grills — kebabs, tandoori platters and sizzlers.',
    image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&q=80',
    rating: 4.7, deliveryTime: '30-40 min', minOrder: 199,
    city: 'Bengaluru', state: 'Karnataka', ownerName: 'Ajay Nair',
    ownerEmail: 'ajay@grillhouseindia.com', ownerPassword: 'grill123', ownerPhone: '9876530030',
    upiId: '9876530030@ybl', upiName: 'AJAY NAIR',
    bankName: 'Kerala Gramin Bank', accountNumber: '1234560030', ifscCode: 'KLGB0000001',
    foods: [
      { name: 'Seekh Kebab Platter (8 pcs)', price: 380, category: 'Non-Veg', description: 'Juicy minced lamb seekh kebabs from tandoor', isVeg: false, rating: 4.9, image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400' },
      { name: 'Tandoori Platter (Veg)', price: 320, category: 'Veg', description: 'Paneer, mushroom and veg tandoori platter', isVeg: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
      { name: 'Murgh Malai Kebab', price: 320, category: 'Non-Veg', description: 'Creamy silky chicken kebabs from tandoor', isVeg: false, rating: 4.8, image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400' },
      { name: 'Sizzler Chicken', price: 420, category: 'Non-Veg', description: 'Grilled chicken sizzler on a hot plate', isVeg: false, rating: 4.8, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400' },
      { name: 'Tandoori Roti', price: 40, category: 'Breads', description: 'Whole wheat tandoor bread', isVeg: true, rating: 4.5, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400' },
      { name: 'Nimbu Pani', price: 60, category: 'Beverages', description: 'Fresh-squeezed lemonade', isVeg: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400' },
    ],
  },
];

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await FoodItem.deleteMany({});
    await Restaurant.deleteMany({});
    await User.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@bitebuddy.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('👤 Admin created: admin@bitebuddy.com / admin123');

    // Create test user
    await User.create({
      name: 'Test User',
      email: 'user@bitebuddy.com',
      password: 'user123',
      role: 'user',
      phone: '9876500000',
      address: '123 MG Road, Bengaluru, Karnataka',
    });
    console.log('👤 Test user created: user@bitebuddy.com / user123');

    // Seed 30 restaurants with their foods
    let totalFoods = 0;
    for (let i = 0; i < rawRestaurants.length; i++) {
      const r = rawRestaurants[i];
      const restaurant = await Restaurant.create({
        name: r.name,
        cuisine: r.cuisine,
        description: r.description,
        image: r.image,
        rating: r.rating,
        deliveryTime: r.deliveryTime,
        minOrder: r.minOrder,
        city: r.city,
        state: r.state,
        ownerName: r.ownerName,
        ownerEmail: r.ownerEmail,
        ownerPassword: r.ownerPassword,
        ownerPhone: r.ownerPhone,
        upiId: r.upiId,
        upiName: r.upiName,
        bankName: r.bankName,
        accountNumber: r.accountNumber,
        ifscCode: r.ifscCode,
        accountHolder: r.ownerName,
        isApproved: true,
        isRegistered: true,
        createdBy: admin._id,
      });

      const foods = r.foods.map((f) => ({
        name: f.name,
        price: f.price,
        category: f.category,
        description: f.description,
        isVeg: f.isVeg,
        rating: f.rating || 4.5,
        image: f.image,
        restaurantId: restaurant._id,
        isAvailable: true,
      }));
      await FoodItem.insertMany(foods);
      totalFoods += foods.length;
      console.log(`  🏪 ${i + 1}/30 — ${r.name} created (${foods.length} items)`);
    }

    console.log(`\n✅ Seeding complete!`);
    console.log(`   🏪 30 restaurants created`);
    console.log(`   🍽️  ${totalFoods} food items created`);
    console.log('\n🔑 Admin credentials:');
    console.log('   Email:    admin@bitebuddy.com');
    console.log('   Password: admin123');
    console.log('\n🔑 Test user credentials (for placing orders):');
    console.log('   Email:    user@bitebuddy.com');
    console.log('   Password: user123');
    console.log('   Login:    http://localhost:3000/user/login\n');
    console.log('🔑 Example restaurant owner credentials:');
    console.log('   Email:    gurpreet@punjabitadka.com');
    console.log('   Password: punjabi123');
    console.log('   Login:    http://localhost:3000/restaurant/login\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seed();
