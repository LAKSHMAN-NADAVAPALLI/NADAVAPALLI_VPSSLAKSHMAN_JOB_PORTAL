const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./db');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./routes/authRoutes');
const jslRoutes = require('./routes/jslRoutes');
const adminRoutes = require('./routes/adminRoutes'); // Import the admin routes
const adminController = require('./controllers/adminController'); // Import the admin controller
const path = require('path'); // Import the path module
const fs = require('fs'); // Import the fs module

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',  // Your front-end URL
  credentials: true,                // Allow credentials (cookies)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],  // Allow relevant HTTP methods
}));

app.use(cookieParser());
app.use(helmet());
app.use(morgan('dev'));

// Disable caching globally
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// Constants
const PORT = process.env.PORT || 5001;

// Routes
app.use('/api/employer', authRoutes);
app.use('/api/jobseeker', jslRoutes);

// Static file serving with CORP header
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Log missing static files (for development purposes)
app.use('/uploads', (req, res, next) => {
  const filePath = path.join(__dirname, 'uploads', req.path);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
  }
  next();
});

// Admin Dashboard Routes
app.use('/api/admin', adminRoutes);
// Set up route for admin-related actions
app.post('/api/admin/login-otp', adminController.loginWithOtp);  // OTP-based Login
app.post('/api/admin/login-password', adminController.loginWithPassword);  // Password-based Login

// Error Handling Middleware
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error.message);
  }
};

startServer();

process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  process.exit();
});
