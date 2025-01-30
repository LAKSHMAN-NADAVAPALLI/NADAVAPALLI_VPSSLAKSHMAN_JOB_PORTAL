// controllers/jslController.js

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors'); // Add cors for cross-origin requests
const Job = require('../models/Job');
const jwt = require('jsonwebtoken');
const Jobseeker = require('../models/Jobseeker');
const dotenv = require('dotenv');
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


// Register jobseeker
const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const jobseekerExists = await Jobseeker.findOne({ email });
    if (jobseekerExists) {
      return res.status(400).json({ message: 'jobseeker already exists' });
    }

    const jobseeker = new Jobseeker({
      name,
      email,
      password,
      isActive: true,
    });


    if (jobseeker.isBlocked) {
      return res.status(403).json({ message: 'You are blocked by the admin' });
    }

    await jobseeker.save();
    res.status(201).json({ message: 'jobseeker registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering jobseeker' });
  }
};

// Login jobseeker
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const jobseeker = await Jobseeker.findOne({ email });
    if (!jobseeker) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    

    if (jobseeker.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked by the admin' });
    }

    const isMatch = await jobseeker.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    

    const token = jwt.sign(
      { jobseekerId: jobseeker._id, email: jobseeker.email, role: 'jobseeker' }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, { // Use role-specific cookie name
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:24 * 60 * 60 * 1000 
    });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
};




const verifytoken = (req, res, next) => {
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

const getJobseekerProfile = async (req, res) => {
  try {
    const email = req.user?.email; // Email is decoded from the token
    if (!email) {
      return res.status(400).json({ error: 'Invalid request: Email not found in token' });
    }

    const jobseeker = await Jobseeker.findOne({ email }); // Query using the email from the token
    if (!jobseeker) {
      return res.status(404).json({ error: 'Jobseeker not found' });
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.status(200).json(jobseeker); // Return the employer profile
  } catch (err) {
    console.error('Error fetching Jobseeker profile:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateJobseekerProfile = async (req, res) => {
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
    const jobseeker = await Jobseeker.findOneAndUpdate(
      { email },
      updateData,
      { new: true, runValidators: true }
    );

    if (!jobseeker) {
      return res.status(404).json({ error: 'Jobseeker not found.' });
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.status(200).json({ message: 'Profile updated successfully.', jobseeker });

  } catch (err) {
    console.error('Error updating Jobseeker profile:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};



const applyForJob = async (req, res) => {
  const { id } = req.body;  // jobId is now id
  const email = req.user?.email;

  if (!id) {
    return res.status(400).json({ error: 'Job ID is required' });
  }

  try {
    const jobseeker = await Jobseeker.findOne({ email });
    if (!jobseeker) {
      return res.status(404).json({ error: 'Jobseeker not found' });
    }

    const jobs = await Job.findById(id);  // Updated from 'job' to 'jobs'
    if (!jobs) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const isAlreadyApplied = jobs.applicants.some(applicant => applicant.email === email);  // Updated here as well
    if (isAlreadyApplied) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }

    jobs.applicants.push({
      name: jobseeker.name,
      email: jobseeker.email,
      appliedAt: new Date(),
    });
    await jobs.save();

    jobseeker.applications.push(id);  // Using 'id' here
    await jobseeker.save();

    res.status(200).json({ message: 'Job applied successfully' });
  } catch (err) {
    console.error('Error applying for job:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const cancelJobApplication = async (req, res) => {
  const { id } = req.body;  // jobId is now id
  const email = req.user?.email;

  if (!id) {
    return res.status(400).json({ error: 'Job ID is required' });
  }

  try {
    const jobseeker = await Jobseeker.findOne({ email });
    console.log(req.body);
    if (!jobseeker) {
      return res.status(404).json({ error: 'Jobseeker not found' });
    }

    const jobs = await Job.findById(id);  // Updated from 'job' to 'jobs'
    if (!jobs) {
      return res.status(404).json({ error: 'Job not found' });
    }

    jobs.applicants = jobs.applicants.filter(applicant => applicant.email !== email);  // Updated here as well
    await jobs.save();

    jobseeker.applications = jobseeker.applications.filter(applicationId => applicationId !== id);
    await jobseeker.save();

    res.status(200).json({ message: 'Job application canceled' });
  } catch (err) {
    console.error('Error canceling job application:', err);
    res.status(500).json({ error: 'Server error' });
  }
};







module.exports = { register, login, verifytoken, getJobseekerProfile,updateJobseekerProfile, applyForJob, cancelJobApplication, };