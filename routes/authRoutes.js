const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getCurrentUser
} = require('../controller/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { uploadMultipleProfiles } = require('../middlewares/uploadMiddleware');

// Public routes
router.post('/register', uploadMultipleProfiles, registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;

