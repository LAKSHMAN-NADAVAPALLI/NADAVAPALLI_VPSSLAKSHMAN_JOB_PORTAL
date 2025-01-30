const express = require('express');

const router = express.Router();
const adminController = require('../controllers/adminController');

// Get all employers
router.get('/employers', adminController.getEmployers);
router.get('/jobseekers', adminController.getJobSeekers);
router.patch('/employer/:email/block', adminController.blockEmployer);
router.patch('/jobseeker/:email/block', adminController.blockJobSeeker);
router.put('/employer/:email/password', adminController.changeEmployerPassword);
router.put('/jobseeker/:email/password', adminController.changeJobSeekerPassword);

router.patch('/employer/:email/unblock', adminController.unblockEmployer);
router.patch('/jobseeker/:email/unblock', adminController.unblockJobSeeker);



router.get('/search', adminController.searchUsers);
router.get('/users/role/:role', adminController.getUsersByRole);

router.post('/jobs', adminController.addJob); // Add job
router.get('/jobs', adminController.viewJobs); // View all jobs
router.delete('/jobs/:id', adminController.deleteJob); // Delete a job
router.get('/dashboard-jobs', adminController.getJobsForDashboard); 
router.get('/jobs/:id/applicants',adminController.viewApplicants);
router.patch('/jobs/:id', adminController.updateJob); // Update job
module.exports = router;
