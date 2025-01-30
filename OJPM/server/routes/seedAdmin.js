// seedAdmin.js
const mongoose = require('mongoose');
const Admin = require('../models/Admin'); // Ensure the path is correct111
require('dotenv').config();



mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const seedAdmin = async () => {
  try {
    const admin = await Admin.findOne({ email: 'admin@example.com' });
    if (!admin) {
      await Admin.create({
        email: 'nvpsslakshman@gmail.com',
        phone: '1234567890',
        password: 'securepassword', // Change to a strong password
      });
      console.log('Admin account created');
    } else {
      console.log('Admin account already exists');
    }
    mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding admin:', error);
    mongoose.disconnect();
  }
};

seedAdmin();
