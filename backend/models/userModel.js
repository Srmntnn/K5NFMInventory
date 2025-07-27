const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  verifyOTP: { type: String, default: '' },
  verifyOtpExpiresAt: { type: Date, default: null },
  isVerified: { type: Boolean, default: false },
  resetOtp: { type: String, default: '' },
  resetOtpExpiresAt: { type: Date, default: null },
  role: { type: String, enum: ['admin', 'department'], default: 'department' },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
