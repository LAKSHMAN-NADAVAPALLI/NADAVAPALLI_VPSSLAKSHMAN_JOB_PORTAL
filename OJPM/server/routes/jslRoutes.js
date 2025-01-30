// routes/authRoutes.js

const express = require('express');
const { 
    register, 
    login, 
    getJobseekerProfile, 
    updateJobseekerProfile, 
    verifytoken,
    applyForJob,
    cancelJobApplication,
    
  } = require('../controllers/jslController');
  const upload = require('../multerConfig'); 
//const protect = require('../middlewares/authMiddleware');
const router = express.Router();

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);


//router.get('/profile', protect, getEmployerProfile);
router.get('/profile', verifytoken, getJobseekerProfile);

// Route to Update Employer Profile with Profile Picture Upload (Protected)
router.put(
  '/profile', 
  verifytoken, 
  upload.single('profilePicture'), // Multer middleware to handle profile picture upload
  updateJobseekerProfile // Controller to handle profile updates
);
router.post('/jobs/apply', verifytoken, applyForJob);

// Cancel Job Application (protected route)
router.post('/jobs/cancel', verifytoken, cancelJobApplication);
module.exports = router;
