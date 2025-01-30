const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');



const jobSeekerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  isBlocked: { type: Boolean, default: false },

  profilePicture: { type: String, default: null }, // URL for the profile picture
  dob: { type: Date },
  address: { type: String },
  phoneNumber: { type: String },
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
});

jobSeekerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

jobSeekerSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('JobSeeker', jobSeekerSchema);