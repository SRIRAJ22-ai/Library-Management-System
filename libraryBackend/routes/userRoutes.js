const express = require('express');
const router = express.Router();
const { 
  registerUser, loginUser, getUsers, 
  updateProfile, updateStrikes, deleteUser 
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', protect, adminOnly, getUsers);
router.put('/profile', protect, updateProfile);
router.put('/:id/strikes', protect, adminOnly, updateStrikes);
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;