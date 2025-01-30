const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors'); // Add cors for cross-origin requests
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const Employer = require('../models/Employer');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();

// Configure CORS (adjust origins as needed)
const allowedOrigins = ['http://localhost:3000']; // Replace with your frontend origin
const corsOptions = {
  origin: allowedOrigins,
  credentials: true, // Allow cookies to be sent across origins
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(cookieParser());
// Helper function to generate JWT
const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if employer already exists
    const employerExists = await Employer.findOne({ email });
    if (employerExists) {
      return res.status(400).json({ message: 'Employer already exists' });
    }

    // Create new employer
    const employer = new Employer({
      name,
      email,
      password,
      isActive: true,
    });

    if (employer.isBlocked) {
      return res.status(403).json({ message: 'You are blocked by the admin' });
    }

    // Save the employer to the database
    await employer.save();

    res.status(201).json({ message: 'Employer registered successfully' });
  } catch (error) {
    console.error('Error during registration:', error.message);
    res.status(500).json({ message: 'Error registering employer' });
  }
};

// Login employer
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if employer exists in the database
    const employer = await Employer.findOne({ email });
    if (!employer) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if the employer's account is blocked
    if (employer.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked by the admin' });
    }

    // Compare the provided password with the stored password
    const isMatch = await employer.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create a JWT token for the employer
    const token = jwt.sign(
      { id: employer._id, role: 'Employer', email: employer.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    // Set the token in an HttpOnly cookie
    
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge:24 * 60 * 60 * 1000 });
    // Respond with a success message and the token
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    // Log the error for debugging and respond with a 500 server error
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
};



// Fetch employer profile (protected route)

//const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send('Unauthorized');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Decode the token
    req.user = decoded;  // Attach the decoded user to the request object
    console.log('Decoded email:', decoded.email);  // Check decoded email here
    next();
  } catch (err) {
    return res.status(403).send('Invalid token');
  }
};



// Get employer profile
// Get employer profile
const getEmployerProfile = async (req, res) => {
  try {
    const email = req.user?.email; // Email is decoded from the token
    if (!email) {
      return res.status(400).json({ error: 'Invalid request: Email not found in token' });
    }

    const employer = await Employer.findOne({ email }); // Query using the email from the token
    if (!employer) {
      return res.status(404).json({ error: 'Employer not found' });
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.status(200).json(employer); // Return the employer profile
  } catch (err) {
    console.error('Error fetching employer profile:', err);
    res.status(500).json({ error: 'Server error' });
  }
};




// Update employer profile
const updateEmployerProfile = async (req, res) => {
  try {
    const email = req.user?.email; 

    if (!email) {
      return res.status(400).json({ error: 'Invalid request: Email not found in token' });
    }

    const { name, address, phoneNumber, dob } = req.body; 
    let profilePicture = null; 

    // Check if a file was uploaded
    if (req.file) {
      profilePicture = req.file.path; // Use the correct file path property 
    }

    // Validation
    if (!name || !address || !phoneNumber || !dob) {
      return res.status(400).json({ error: 'All fields (name, address, phoneNumber, dob) are required.' });
    }

    // Update data object
    const updateData = { name, address, phoneNumber, dob };
    if (profilePicture) {
      updateData.profilePicture = profilePicture;
    }

    // Find and update the employer
    const employer = await Employer.findOneAndUpdate(
      { email },
      updateData,
      { new: true, runValidators: true }
    );

    if (!employer) {
      return res.status(404).json({ error: 'Employer not found.' });
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.status(200).json({ message: 'Profile updated successfully.', employer });

  } catch (err) {
    console.error('Error updating employer profile:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};



module.exports = { register, login, verifyToken,  getEmployerProfile, updateEmployerProfile };