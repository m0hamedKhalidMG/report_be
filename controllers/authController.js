const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { validateRegisterInput,validateLawyerRegistration } = require('../utils/validation');
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
      { type: user.user_type, email: user.email,userId:user.id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ token, type:user.user_type });
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
const registerLawyer = async (req, res) => {
  try {
    
    // Validate input
    const { error } = validateLawyerRegistration(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }

    // Check if email exists
    const existingUser = await User.findByEmail(req.body.email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    //const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create lawyer user
    const lawyerData = {
      first_name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      user_type: 'lawyer' 
    };

    const userId = await User.create(lawyerData);

    // Generate JWT token
    const token = jwt.sign(
      { userId, email: req.body.email, user_type: 'lawyer' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'Lawyer registered successfully',
      type: 'lawyer',
      token
    });

  } catch (error) {
    console.error('Lawyer registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};
module.exports = { register, login,getUserData,registerLawyer };
