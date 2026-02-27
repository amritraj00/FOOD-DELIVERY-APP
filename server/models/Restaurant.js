const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, default: '' },
    description: { type: String, required: true, trim: true },
    cuisine: { type: String, default: 'Multi-Cuisine', trim: true },
    rating: { type: Number, default: 4.5, min: 1, max: 5 },
    deliveryTime: { type: String, default: '25-40 min' },
    minOrder: { type: Number, default: 99 },
    isOpen: { type: Boolean, default: true },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    phone: { type: String, default: '' },
    lat: { type: Number, default: 28.6200 },
    lng: { type: Number, default: 77.2100 },

    // Owner / Auth fields
    ownerName: { type: String, required: true, trim: true },
    ownerEmail: { type: String, required: true, unique: true, lowercase: true, trim: true },
    ownerPassword: { type: String, required: true },
    ownerPhone: { type: String, default: '' },
    isApproved: { type: Boolean, default: true }, // admin can toggle
    isRegistered: { type: Boolean, default: true },

    // Payment / UPI details (only owner & admin can see)
    upiId: { type: String, default: '' },
    upiName: { type: String, default: '' },
    bankName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    accountHolder: { type: String, default: '' },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

restaurantSchema.pre('save', async function (next) {
  if (!this.isModified('ownerPassword')) return next();
  this.ownerPassword = await bcrypt.hash(this.ownerPassword, 10);
  next();
});

restaurantSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.ownerPassword);
};

module.exports = mongoose.model('Restaurant', restaurantSchema);
