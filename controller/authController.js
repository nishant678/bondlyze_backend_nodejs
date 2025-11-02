const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const User = require('../model/User');
const UserProfile = require('../model/UserProfile');
const { generateToken } = require('../config/jwtToken');
const { validateRegistrationData, validateLoginData } = require('../utils/validation');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  try {
    // Validate input data
    const validation = validateRegistrationData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const {
      mobile_number,
      email,
      password,
      name,
      dob,
      gender
    } = validation.cleanedData;

    // Handle optional fields
    const goals = req.body.goals ? String(req.body.goals).trim() : null;
    const interest = req.body.interest ? String(req.body.interest).trim() : null;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User Already Exists, Try Login!"
      });
    }

    // Check mobile number
    const existingMobileUser = await User.findOne({ mobile_number });
    if (existingMobileUser) {
      return res.status(400).json({
        message: "Mobile Number Already Registered!"
      });
    }

    // Hash password
    bcrypt.hash(password, 5, async (err, hash) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          message: `Registration Error: ${err.message}`
        });
      } else {
        // Create new user instance
        const newUser = new User({
          mobile_number,
          email,
          password: hash,
          name,
          dob,
          gender: gender.toLowerCase(),
          goals,
          interest
        });

        // Save user to database
        await newUser.save();

        // Handle profile images if uploaded
        if (req.files && req.files.length > 0) {
          for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const imageUrl = `/uploads/profile-images/${file.filename}`;
            await UserProfile.create(newUser.id, imageUrl, i);
          }
        }

        // Get user with profiles for response
        const userWithProfiles = await User.findByIdWithProfiles(newUser.id);

        // Generate token
        let token;
        try {
          token = generateToken(newUser.id);
        } catch (error) {
          return res.status(201).json({
            message: "New User Added",
            user: userWithProfiles,
            error: "Token generation failed. Please set JWT_SECRET in .env file."
          });
        }

        res.status(201).json({
          message: "New User Added",
          user: userWithProfiles,
          token
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: `Registration Error: ${error.message}`
    });
  }
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  try {
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
      user = await User.findOne({ email });
    } else if (mobile_number) {
      user = await User.findOne({ mobile_number });
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
      return res.status(200).json({
        success: true,
        message: 'Login successful, but token generation failed. Please set JWT_SECRET in .env file.',
        error: error.message,
        user: userWithProfiles
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userWithProfiles,
      token
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: `Login Error: ${error.message}`
    });
  }
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

