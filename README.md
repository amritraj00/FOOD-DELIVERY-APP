# �️ BiteBuddy — Smart Food Ordering Platform

A fully-featured, production-ready MERN stack application for ordering food from local restaurants, with separate Admin, Restaurant Owner, and Customer interfaces.

## 🚀 Features

### Admin Control Centre
- Secure admin authentication
- Manage all restaurants on the platform
- Add, edit, and remove food items by restaurant
- View orders and payment details
- Image upload for restaurants and food items

### Customer Panel
- Customer registration and login
- Browse curated local restaurants
- View full menus with prices and categories
- Cart with UPI/COD payment support
- Real-time order tracking

### Restaurant Owner Portal
- Separate owner login & registration
- Manage menu items (add/edit/delete/toggle)
- View & update incoming orders live
- UPI payment management dashboard

## 🛠️ Tech Stack

### Frontend
- React.js (Functional components & hooks)
- React Router DOM v6
- Axios for API calls
- React Toastify for notifications
- CSS3 with responsive design

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT authentication
- Bcrypt for password hashing
- Multer for image uploads
- RESTful API architecture

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bitebuddy
JWT_SECRET=bitebuddy_secret_jwt_key_change_in_production_99887
NODE_ENV=development
```

4. Create uploads directory:
```bash
mkdir uploads
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Open a new terminal and navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## 🗄️ Database Models

### User Model
- name (String, required)
- email (String, required, unique)
- password (String, required, hashed)
- role (String, enum: ['user', 'admin'], default: 'user')
- timestamps

### Restaurant Model
- name (String, required)
- image (String, required)
- description (String, required)
- createdBy (ObjectId, ref: 'User')
- timestamps

### FoodItem Model
- name (String, required)
- image (String, required)
- price (Number, required)
- restaurantId (ObjectId, ref: 'Restaurant')
- timestamps

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/admin/login` - Admin login
- `GET /api/auth/me` - Get current user (Protected)

### Restaurants
- `GET /api/restaurants` - Get all restaurants (Public)
- `GET /api/restaurants/:id` - Get single restaurant (Public)
- `POST /api/restaurants` - Create restaurant (Admin only)
- `PUT /api/restaurants/:id` - Update restaurant (Admin only)
- `DELETE /api/restaurants/:id` - Delete restaurant (Admin only)

### Food Items
- `GET /api/foods/:restaurantId` - Get food items by restaurant (Public)
- `GET /api/foods/item/:id` - Get single food item (Public)
- `POST /api/foods/:restaurantId` - Create food item (Admin only)
- `PUT /api/foods/:id` - Update food item (Admin only)
- `DELETE /api/foods/:id` - Delete food item (Admin only)

## 🎯 Usage

### Creating an Admin User

To create an admin user, you can either:

1. Register as a normal user and manually update the role in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

2. Or use MongoDB Compass/Shell to create an admin directly

### User Flow
1. Register a new account at `/user/register`
2. Login at `/user/login`
3. Browse restaurants at `/restaurants`
4. Click on a restaurant to view its menu

### Admin Flow
1. Login at `/admin/login`
2. Access dashboard at `/admin/dashboard`
3. Manage restaurants at `/admin/restaurants`
4. Add/edit/delete restaurants
5. Click "Foods" to manage food items for a specific restaurant

## 📁 Project Structure

```
Food Delivery App/
├── server/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── restaurantController.js
│   │   └── foodController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Restaurant.js
│   │   └── FoodItem.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── restaurantRoutes.js
│   │   └── foodRoutes.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── uploads/
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
└── client/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   ├── PrivateRoute.js
    │   │   ├── RestaurantForm.js
    │   │   └── FoodForm.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── user/
    │   │   │   ├── UserLogin.js
    │   │   │   ├── UserRegister.js
    │   │   │   ├── Restaurants.js
    │   │   │   └── RestaurantMenu.js
    │   │   └── admin/
    │   │       ├── AdminLogin.js
    │   │       ├── Dashboard.js
    │   │       ├── AdminRestaurants.js
    │   │       └── AdminFoods.js
    │   ├── services/
    │   │   ├── api.js
    │   │   ├── authService.js
    │   │   ├── restaurantService.js
    │   │   └── foodService.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── .gitignore
    └── package.json
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected routes (both frontend and backend)
- Role-based access control
- Input validation
- Secure file upload with type and size restrictions

## 🎨 UI Features

- Responsive design (mobile-friendly)
- Card-based layouts
- Modal forms for add/edit operations
- Toast notifications for user feedback
- Loading states
- Empty states
- Clean and modern interface

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running locally or update the connection string in `.env`
- Check if port 27017 is available

### Port Already in Use
- Change the PORT in `.env` file
- Kill the process using the port

### Image Upload Issues
- Ensure the `uploads` folder exists in the server directory
- Check file permissions

## 📝 Future Enhancements

- Order management system
- Payment integration
- User cart functionality
- Restaurant ratings and reviews
- Search and filter functionality
- Email verification
- Password reset functionality

## 👨‍💻 Development

For development with hot reload:

Backend:
```bash
npm run dev
```

Frontend:
```bash
npm start
```

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

Built with ❤️ using the MERN Stack
