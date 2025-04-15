const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { validateRegisterInput } = require('../utils/validation');
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
  try {
    const { error } = validateRegisterInput(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const existingUser = await User.findByEmail(req.body.email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const userId = await User.create(req.body);
    res.status(201).json({ message: 'User registered successfully', userId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '300d' }
    );

    res.json({ token, userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getUserData = async (req, res) => {
  try {
    const userId = req.user.userId; // From auth middleware
    
    const userData = await User.getProfileData(userId);
    
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      message: 'User data retrieved successfully',
      user: userData
    });
    
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Server error while fetching user data' });
  }
};

module.exports = { register, login,getUserData };
