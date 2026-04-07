const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "secret123", {
    expiresIn: "30d",
  });
};

// @desc    Register new user
exports.registerUser = async (req, res) => {
  const { username, useremail, userPassword, userType } = req.body;
  try {
    const userExists = await User.findOne({ useremail });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userPassword, salt);

    const user = await User.create({
      username,
      useremail,
      userPassword: hashedPassword,
      userType: userType || 'student',
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      userType: user.userType,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
exports.loginUser = async (req, res) => {
  const { useremail, userPassword } = req.body;
  const user = await User.findOne({ useremail });

  if (user && (await bcrypt.compare(userPassword, user.userPassword))) {
    res.json({
      _id: user._id,
      username: user.username,
      useremail: user.useremail,
      userType: user.userType,
      strikes: user.strikes,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
};

// @desc    Update Profile (For UserProfile.jsx)
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.username = req.body.username || user.username;
    user.useremail = req.body.useremail || user.useremail;
    
    if (req.body.userPassword) {
      const salt = await bcrypt.genSalt(10);
      user.userPassword = await bcrypt.hash(req.body.userPassword, salt);
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      useremail: updatedUser.useremail,
      userType: updatedUser.userType,
      strikes: updatedUser.strikes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Manage Strikes (Admin only - covers both Add and Remove)
exports.updateStrikes = async (req, res) => {
  const { action, reason } = req.body; 
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (action === 'add') {
      user.strikes += 1;
      user.strikeReasons.push({ reason: reason || "Manual strike by admin" });
    } else if (action === 'remove' && user.strikes > 0) {
      user.strikes -= 1;
    }
    
    await user.save();
    res.json({ message: 'Strikes updated', currentStrikes: user.strikes, reasons: user.strikeReasons });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (Admin only)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-userPassword");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};