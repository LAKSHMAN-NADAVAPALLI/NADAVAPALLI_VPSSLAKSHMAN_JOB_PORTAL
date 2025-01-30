const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const AdminSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Email validation
  },
  phone: { 
    type: String, 
    required: true, 
    unique: true, 
    match: /^[0-9]{10}$/ // Simple phone validation (10 digits)
  },
  password: { 
    type: String, 
    required: true, 
    minlength: 8 // Ensure a minimum password length
  },
  isAdmin: { 
    type: Boolean, 
    default: true // Default to true since this is an Admin schema
  },
  createdAt: { 
    type: Date, 
    default: Date.now // Automatically set creation date
  }
});

// ** Hash password before saving **
AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Only hash if the password is modified
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ** Add a method to compare passwords **
AdminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ** Add a method to check admin status **
AdminSchema.methods.isAdminUser = function () {
  return this.isAdmin;
};

const Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;
