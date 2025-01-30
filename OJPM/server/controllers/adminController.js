const Admin = require('../models/Admin');
const Employer = require('../models/Employer'); // Assuming Employer is a model
const JobSeeker = require('../models/Jobseeker');
const Job = require('../models/Job'); // Corrected model import
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const otpStore = {}; // Temporary OTP store, should use a more permanent solution like Redis or DB in production


// OTP-based login
const loginWithOtp = async (req, res) => {
  const { emailOrPhone, otp } = req.body;

  if (!emailOrPhone || !otp) {
    return res.status(400).json({ message: 'Email/Phone and OTP are required' });
  }

  const storedOtp = otpStore[emailOrPhone];
  if (!storedOtp) {
    return res.status(400).json({ message: 'OTP not found or expired' });
  }

  const otpExpirationTime = process.env.OTP_EXPIRATION_TIME * 60 * 1000 || 5 * 60 * 1000;
  const otpAge = Date.now() - storedOtp.sentAt;

  if (otpAge > otpExpirationTime) {
    delete otpStore[emailOrPhone];
    return res.status(400).json({ message: 'OTP has expired' });
  }

  if (storedOtp.otp !== parseInt(otp)) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  const admin = await Admin.findOne({
    $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
  });

  if (!admin) {
    return res.status(401).json({ message: 'Admin not found' });
  }

  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  delete otpStore[emailOrPhone];

  res.status(200).json({ message: 'Login successful', token });
};

// Password-based login

// Get all employers
const loginWithPassword = async (req, res) => {
  const { emailOrPhone, password } = req.body;

  if (!emailOrPhone || !password) {
    return res.status(400).json({ message: 'Email/Phone and password are required' });
  }

  const admin = await Admin.findOne({
    $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
  });

  if (!admin) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.status(200).json({ message: 'Login successful', token });
};

// Get all employers
const getEmployers = async (req, res) => {
  try {
    const employers = await Employer.find();
    const employerData = employers.map(emp => {
      return {
        email: emp.email,
        password: emp.password,  // Hashed password
        name: emp.name,
      };
    });
    res.status(200).json(employerData);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch employers', error: error.message });
  }
};

// Get all job seekers
const getJobSeekers = async (req, res) => {
  try {
    const jobSeekers = await JobSeeker.find();
    const jobSeekerData = jobSeekers.map(seeker => {
      return {
        email: seeker.email,
        password: seeker.password,  // Hashed password
        name: seeker.name,
      };
    });
    res.status(200).json(jobSeekerData);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch job seekers', error: error.message });
  }
};

// Block Employer
// Admin block employer
// Block Employer
const blockEmployer = async (req, res) => {
  const { email } = req.params;

  try {
    // Disable caching for this specific request
    res.setHeader('Cache-Control', 'no-store'); 

    const employer = await Employer.findOneAndUpdate(
      { email },
      { isBlocked: true },
      { new: true } // Return updated document
    );
    console.log("Employer blocked:", employer);

    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }

    res.status(200).json({ message: 'Employer blocked successfully', employer });
  } catch (error) {
    res.status(500).json({ message: 'Error blocking employer', error: error.message });
  }
};


// Unblock Employer
const unblockEmployer = async (req, res) => {
  const { email } = req.params;

  try {
    const employer = await Employer.findOneAndUpdate(
      { email },
      { isBlocked: false },
      { new: true }
    );
    

    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }

    res.status(200).json({ message: 'Employer unblocked successfully', employer });
  } catch (error) {
    res.status(500).json({ message: 'Error unblocking employer', error: error.message });
  }
};

const blockJobSeeker = async (req, res) => {
  const { email } = req.params;

  try {
     
    res.setHeader('Cache-Control', 'no-store'); 
    const jobSeeker = await JobSeeker.findOneAndUpdate(
      { email },
      { isBlocked: true },
      { new: true }
    );
    console.log("Jobseeker blocked:", jobseeker);
    if (!jobSeeker) {
      return res.status(404).json({ message: 'Job seeker not found' });
    }
    res.status(200).json({ message: 'Job seeker blocked successfully', jobSeeker });
  } catch (error) {
    res.status(500).json({ message: 'Failed to block job seeker', error: error.message });
  }
};

// Change Employer Password
const changeEmployerPassword = async (req, res) => {
  const { email } = req.params;
  const { newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email and new password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const employer = await Employer.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }

    res.status(200).json({ message: 'Password updated successfully for employer' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update employer password', error: error.message });
  }
};

const changeJobSeekerPassword = async (req, res) => {
  const { email } = req.params;
  const { newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email and new password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const jobSeeker = await JobSeeker.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (!jobSeeker) {
      return res.status(404).json({ message: 'Job seeker not found' });
    }

    res.status(200).json({ message: 'Password updated successfully for job seeker' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update job seeker password', error: error.message });
  }
};

// Search users by criteria (e.g., name, email, role)
const searchUsers = async (req, res) => {
  const { query } = req.query;

  try {
    const employers = await Employer.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    });

    const jobSeekers = await JobSeeker.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    });

    res.status(200).json({ employers, jobSeekers });
  } catch (error) {
    res.status(500).json({ message: 'Failed to search users', error: error.message });
  }
};


// Unblock Employer
// Unblock Employer


// Unblock Job Seeker
const unblockJobSeeker = async (req, res) => {
  const { email } = req.params;

  try {
    const jobSeeker = await JobSeeker.findOne({ email });
    if (!jobSeeker) {
      return res.status(404).json({ message: 'Job seeker not found' });
    }

    jobSeeker.isBlocked = false; // Unblock the job seeker
    await jobSeeker.save();

    res.status(200).json({ message: 'Job seeker unblocked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error unblocking job seeker' });
  }
};


// Get users by role (Admin, Employer, JobSeeker)
const getUsersByRole = async (req, res) => {
  const { role } = req.params;

  try {
    let users;
    if (role === 'Admin') {
      users = await Admin.find();
    } else if (role === 'Employer') {
      users = await Employer.find();
    } else if (role === 'jobseeker') {
      users = await JobSeeker.find();
    } else {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users by role', error: error.message });
  }
};






const viewJobs = async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
};

// Add a new job
const addJob = async (req, res) => {
  const { title, description, location, salary } = req.body;

  if (!title || !description || !location || !salary) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newJob = new Job({ title, description, location, salary });
    await newJob.save();
    res.status(201).json(newJob);
  } catch (error) {
    res.status(500).json({ message: 'Error adding job', error: error.message });
  }
};

// Delete a job by ID
const deleteJob = async (req, res) => {
  const { id } = req.params;

  try {
    const job = await Job.findByIdAndDelete(id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json({ message: 'Job deleted successfully', job });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job', error: error.message });
  }
};

// Fetch jobs for dashboard (Admin, Employer, Job Seeker)
const getJobsForDashboard = async (req, res) => {
  try {
    const jobs = await Job.find(); // Add filtering logic if needed
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs for dashboard', error: error.message });
  }
};


const viewApplicants = async (req, res) => {
  const { id } = req.params;

  try {
    const jobs = await Job.findById(id);
    if (!jobs) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.status(200).json({ applicants: jobs.applicants });
  } catch (err) {
    console.error('Error fetching applicants:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


const updateJob = async (req, res) => {
  const { id } = req.params;
  const updateFields = req.body; // Accepts any fields for updating

  try {
    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { $set: updateFields }, // Dynamically update provided fields
      { new: true, runValidators: true }
      
    );
    console.log('Updating job with ID:', id);



    if (!updatedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: 'Error updating job', error: error.message });
  }
};








module.exports = {
  getEmployers,
  getJobSeekers,
  searchUsers,
  loginWithOtp,
  loginWithPassword,
  blockEmployer,
  blockJobSeeker,
  changeEmployerPassword,
  changeJobSeekerPassword,
  unblockEmployer,
  unblockJobSeeker,
  getUsersByRole,
  addJob,
  viewJobs,
  deleteJob,
  getJobsForDashboard,
  viewApplicants,
  updateJob,
};