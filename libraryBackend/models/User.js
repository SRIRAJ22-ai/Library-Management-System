const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true
  },
  useremail: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address']
  },
  userType: {
    type: String,
    required: true,
    enum: ['admin', 'student'],
    default: 'student'
  },
  userPassword: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  // Penalty System (Your Telugu requirements)
  strikes: {
    type: Number,
    default: 0
  },
  strikeReasons: [{
    reason: { type: String }, // e.g., "Late Submission", "Book Damage"
    date: { type: Date, default: Date.now }
  }],
  totalFines: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true 
});

// Virtual field to check if user is blocked (e.g., more than 3 strikes)
userSchema.virtual('isBlocked').get(function() {
  return this.strikes >= 3;
});

const User = mongoose.model('User', userSchema);
module.exports = User;