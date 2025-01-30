const express = require('express');
const { 
  register, 
  login, 
  getEmployerProfile, 
  updateEmployerProfile, 
  verifyToken 
} = require('../controllers/authController');
const upload = require('../multerConfig'); // Import multer config for file uploads
const router = express.Router();

// Routes for Registration and Login
router.post('/register', register);
router.post('/login', login);

// Route to Get Employer Profile (Protected)
router.get('/profile', verifyToken, getEmployerProfile);

// Route to Update Employer Profile with Profile Picture Upload (Protected)
router.put(
  '/profile', 
  verifyToken, 
  upload.single('profilePicture'), // Multer middleware to handle profile picture upload
  updateEmployerProfile // Controller to handle profile updates
);


module.exports = router;
