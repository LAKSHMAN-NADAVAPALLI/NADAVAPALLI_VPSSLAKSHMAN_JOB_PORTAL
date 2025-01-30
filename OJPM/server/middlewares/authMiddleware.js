const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const Employer = require('../models/Employer');

dotenv.config();

const authMiddleware = async (req, res, next) => {
  console.log('Cookies received in backend:', req.cookies);
  const token = req.cookies.employertoken;

  if (!token) {
    return res.status(401).json({ message: 'Noauth middleware token found, authorization denied' });
  }

  try {
    console.log('Cookies received:', req.cookies);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded info to request (e.g., employer ID)
    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
