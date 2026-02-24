# 🚀 Quick Start Guide

## Step-by-Step Setup Instructions

### 1️⃣ Install MongoDB

**Windows:**
- Download MongoDB from https://www.mongodb.com/try/download/community
- Install MongoDB and start the service
- Or use MongoDB Atlas (cloud) by updating the connection string

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### 2️⃣ Backend Setup

Open PowerShell/Terminal and run:

```powershell
# Navigate to server folder
cd "server"

# Install dependencies
npm install

# The .env file is already created with default settings
# Edit it if you need to change MongoDB connection or port

# Create uploads folder for images
New-Item -ItemType Directory -Force -Path "uploads"

# Start the backend server
npm run dev
```

You should see:
```
Server running on port 5000
MongoDB Connected: localhost
```

### 3️⃣ Frontend Setup

Open a NEW PowerShell/Terminal window and run:

```powershell
# Navigate to client folder
cd "client"

# Install dependencies
npm install

# Start the React app
npm start
```

Browser will automatically open at `http://localhost:3000`

### 4️⃣ Create Admin User

**Option 1: Via MongoDB Compass**
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Create a new database: `food-delivery`
4. Register a user through the app first
5. In the `users` collection, find your user
6. Change role from "user" to "admin"

**Option 2: Via MongoDB Shell**
```javascript
use food-delivery
db.users.updateOne(
  { email: "youremail@example.com" },
  { $set: { role: "admin" } }
)
```

### 5️⃣ Test the Application

**As User:**
1. Go to http://localhost:3000/user/register
2. Register with your details
3. Login and browse restaurants

**As Admin:**
1. Update your role to admin (see step 4)
2. Go to http://localhost:3000/admin/login
3. Login with admin credentials
4. Add restaurants and food items

## 🎯 Default Ports

- Backend API: http://localhost:5000
- Frontend: http://localhost:3000
- MongoDB: mongodb://localhost:27017

## ⚡ Quick Commands

**Backend:**
```bash
cd server
npm run dev          # Start with nodemon (auto-restart)
npm start            # Start without auto-restart
```

**Frontend:**
```bash
cd client
npm start            # Start development server
npm run build        # Build for production
```

## 🔧 Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Check if port 5000 is available
- Verify .env file exists in server folder

### Frontend shows connection error
- Ensure backend is running on port 5000
- Check browser console for errors

### Can't upload images
- Ensure `uploads` folder exists in server directory
- Check folder permissions

### MongoDB connection failed
- Start MongoDB service
- Or use MongoDB Atlas and update MONGODB_URI in .env

## 📋 Testing Checklist

✅ Backend server starts without errors
✅ Frontend loads at localhost:3000
✅ Can register new user
✅ Can login as user
✅ Can view restaurants (empty initially)
✅ Can login as admin
✅ Can add restaurant with image
✅ Can add food items to restaurant
✅ Images display correctly
✅ Can edit and delete items

## 🎉 You're All Set!

Start building your food delivery empire! 🍕🍔🍟
