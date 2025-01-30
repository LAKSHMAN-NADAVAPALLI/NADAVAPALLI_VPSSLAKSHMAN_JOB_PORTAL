const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  salary: { type: Number, required: true },
  employer: { type: String, default: 'Admin' },
  createdAt: { type: Date, default: Date.now },

  // This stores the applicants for each job
  applicants: [
    {
      name: { type: String, required: true },
      email: { type: String, required: true },
      appliedAt: { type: Date, default: Date.now }
    }
  ]
});


module.exports = mongoose.model('Job', jobSchema);
