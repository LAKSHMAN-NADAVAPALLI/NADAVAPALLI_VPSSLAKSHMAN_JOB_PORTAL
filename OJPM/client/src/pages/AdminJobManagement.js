import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminJobManagement.css';

const AdminJobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    salary: '',
  });
  const [editingJob, setEditingJob] = useState(null);
  const [applicants, setApplicants] = useState([]);

  // Fetch all jobs on component mount
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5001/api/admin/jobs');
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error.message);
      alert('Failed to fetch jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch applicants for a specific job
  const fetchApplicants = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5001/api/admin/jobs/${id}/applicants`);
      setApplicants(response.data.applicants);
    } catch (error) {
      console.error('Error fetching applicants:', error.message);
      alert('Failed to fetch applicants. Please try again later.');
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Add or update a job
  const handleSubmitJob = async () => {
    if (!formData.title && !formData.description && !formData.location && !formData.salary) {
      alert('Please fill in at least one field to update.');
      return;
    }

    setLoading(true);
    try {
      console.log(editingJob._id);

      if (editingJob) {
        // PATCH request to update only provided fields
        const response = await axios.patch(`http://localhost:5001/api/admin/jobs/${editingJob._id}`, formData);
        setJobs(jobs.map((job) => (job._id === editingJob._id ? response.data : job)));
        alert('Job updated successfully');
      } else {
        // POST request to add a new job
        const response = await axios.post('http://localhost:5001/api/admin/jobs', formData);
        setJobs([...jobs, response.data]);
        alert('Job added successfully');
      }
      setFormData({ title: '', description: '', location: '', salary: '' });
      setEditingJob(null);
    } catch (error) {
      console.error('Error saving job:', error.message);
      alert('Failed to save job. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Delete a job
  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    setLoading(true);
    try {
      await axios.delete(`http://localhost:5001/api/admin/jobs/${id}`);
      setJobs(jobs.filter((job) => job._id !== id));
      alert('Job deleted successfully');
    } catch (error) {
      console.error('Error deleting job:', error.message);
      alert('Failed to delete job. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Start editing a job
  const startEditing = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title || '',
      description: job.description || '',
      location: job.location || '',
      salary: job.salary || '',
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingJob(null);
    setFormData({ title: '', description: '', location: '', salary: '' });
  };

  return (
    <div className="admin-job-management">
      <h2>Admin Job Management</h2>

      <div className="form-container">
        <h3>{editingJob ? 'Edit Job' : 'Add Job'}</h3>
        <input
          type="text"
          name="title"
          placeholder="Job Title"
          value={formData.title}
          onChange={handleInputChange}
        />
        <textarea
          name="description"
          placeholder="Job Description"
          value={formData.description}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="location"
          placeholder="Job Location"
          value={formData.location}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="salary"
          placeholder="Job Salary"
          value={formData.salary}
          onChange={handleInputChange}
        />
        <div>
          <button onClick={handleSubmitJob} disabled={loading}>
            {editingJob ? 'Update Job' : 'Add Job'}
          </button>
          {editingJob && (
            <button onClick={cancelEditing} style={{ marginLeft: '10px' }}>
              Cancel
            </button>
          )}
        </div>
      </div>

      <h3>Jobs</h3>
      {loading ? (
        <p>Loading...</p>
      ) : jobs.length > 0 ? (
        <ul>
          {jobs.map((job) => (
            <li key={job._id}>
              <strong>{job.title}</strong> - {job.location}
              <p>Salary: ${job.salary}</p>
              <p>{job.description}</p>
              <button onClick={() => startEditing(job)}>Edit</button>
              <button onClick={() => handleDeleteJob(job._id)} className="delete">
                Delete
              </button>
              <button onClick={() => fetchApplicants(job._id)} className="view-applicants">
                View Applicants
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No jobs available.</p>
      )}

      {applicants.length > 0 && (
        <div className="applicants-list">
          <h3>Applicants</h3>
          <ul>
            {applicants.map((applicant, index) => (
              <li key={index}>
                <p>Name: {applicant.name}</p>
                <p>Email: {applicant.email}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminJobManagement;
