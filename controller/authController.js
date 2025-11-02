const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const path = require('path');
const User = require('../model/User');
const UserProfile = require('../model/UserProfile');
const { validateRegistrationData, validateLoginData } = require('../utils/validation');

/**
 * Generate JWT Token
 */
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined. Please set it in your .env file.');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  // Debug: Log received data (remove in production)
  console.log('Received registration data:', {
    name: req.body.name,
    email: req.body.email,
    mobile_number: req.body.mobile_number,
    gender: req.body.gender,
    dob: req.body.dob,
    hasFiles: !!req.files
  });

  // Validate input data
  const validation = validateRegistrationData(req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }

  // Use cleaned data from validation
  const {
    mobile_number,
    email,
    password,
    name,
    dob,
    gender
  } = validation.cleanedData;

  // Handle optional fields (might come from form-data)
  const goals = req.body.goals ? String(req.body.goals).trim() : null;
  const interest = req.body.interest ? String(req.body.interest).trim() : null;

  // Check if user already exists
  const emailExists = await User.emailExists(email);
  if (emailExists) {
    return res.status(400).json({
      success: false,
      message: 'Email already registered'
    });
  }

  const mobileExists = await User.mobileExists(mobile_number);
  if (mobileExists) {
    return res.status(400).json({
      success: false,
      message: 'Mobile number already registered'
    });
  }

  // Create user
  const userId = await User.create({
    mobile_number,
    email,
    password,
    name,
    dob,
    gender: gender.toLowerCase(),
    goals,
    interest
  });

  // Handle profile images if uploaded
  const profileImages = [];
  if (req.files && req.files.length > 0) {
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      // Generate URL (you can use cloud storage URL here)
      const imageUrl = `/uploads/profile-images/${file.filename}`;
      await UserProfile.create(userId, imageUrl, i);
      profileImages.push(imageUrl);
    }
  }

  // Get created user with profiles
  const user = await User.findByIdWithProfiles(userId);

  // Generate token
  let token;
  try {
    token = generateToken(userId);
  } catch (error) {
    // If token generation fails, still return success but with error message
    return res.status(201).json({
      success: true,
      message: 'User registered successfully, but token generation failed. Please set JWT_SECRET in .env file.',
      error: error.message,
      data: {
        user
      }
    });
  }

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user,
      token
    }
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, mobile_number, password } = req.body;

  // Validate input data
  const validation = validateLoginData(req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }

  // Find user by email or mobile number
  let user;
  if (email) {
    user = await User.findByEmail(email);
  } else if (mobile_number) {
    user = await User.findByMobileNumber(mobile_number);
  }

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Verify password
  const isPasswordValid = await User.verifyPassword(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Get user with profiles
  const userWithProfiles = await User.findByIdWithProfiles(user.id);

  // Generate token
  let token;
  try {
    token = generateToken(user.id);
  } catch (error) {
    // If token generation fails, still return success but with error message
    return res.status(200).json({
      success: true,
      message: 'Login successful, but token generation failed. Please set JWT_SECRET in .env file.',
      error: error.message,
      data: {
        user: userWithProfiles
      }
    });
  }

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: userWithProfiles,
      token
    }
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdWithProfiles(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
});

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser
};

