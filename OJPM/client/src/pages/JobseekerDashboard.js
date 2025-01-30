import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./JobseekerDashboard.css";

const JobseekerDashboard = () => {
  const [jobseekerData, setJobseekerData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    education: "",
    dob: "",
    address: "",
    profilePicture: "",
    applications: [],
  });
  const [jobs, setJobs] = useState([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [applicationDetails, setApplicationDetails] = useState({
    name: "",
    phoneNumber: "",
    education: "",
  });
  const [appliedJob, setAppliedJob] = useState(null); // To track the applied job for canceling application

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("User not logged in.");
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const email = decoded.email;
      setJobseekerData((prevState) => ({ ...prevState, email }));
      fetchJobseekerProfile(email, token);
      fetchJobs(token);
    } catch (err) {
      console.error("Invalid token:", err);
      setError("Invalid or expired token.");
      setLoading(false);
    }
  }, []);

  const fetchJobseekerProfile = async (email, token) => {
    try {
      const response = await axios.get("http://localhost:5001/api/jobseeker/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobseekerData(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile.");
      setLoading(false);
    }
  };

  const fetchJobs = async (token) => {
    try {
      const response = await axios.get("http://localhost:5001/api/admin/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(response.data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load jobs.");
    }
  };

  const handleApplyJob = (jobId) => {
    if (jobseekerData.applications.includes(jobId)) return;
    setApplyingJobId(jobId);
  };

  const handleCancelApplication = async (jobId) => {
    const token = localStorage.getItem("token");
    if (!token || !jobId) return;

    try {
      await axios.post(
        "http://localhost:5001/api/jobseeker/jobs/cancel",
        { id: String(jobId) },
        
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(jobId) ;
      setJobseekerData((prev) => ({
        ...prev,
        applications: prev.applications.filter((id) => id !== jobId),
      }));
      alert("Application canceled successfully.");
    } catch (err) {
      console.error("Error canceling job application:", err);
      setError("Failed to cancel job application.");
    }
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.post(
        "http://localhost:5001/api/jobseeker/jobs/apply",
        { id: applyingJobId, ...applicationDetails },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJobseekerData((prev) => ({
        ...prev,
        applications: [...prev.applications, applyingJobId],
      }));
      setAppliedJob(applyingJobId); // Track applied job
      setApplyingJobId(null); // Reset applying job id
    } catch (err) {
      console.error("Error applying for job:", err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const formData = new FormData();
      formData.append("name", jobseekerData.name);
      if (profilePicture) formData.append("profilePicture", profilePicture);
      formData.append("dob", jobseekerData.dob);
      formData.append("address", jobseekerData.address);
      formData.append("phoneNumber", jobseekerData.phoneNumber);

      const response = await axios.put(
        "http://localhost:5001/api/jobseeker/profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Profile updated successfully!");
      setJobseekerData(response.data);
      setEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobseekerData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="dashboard-container">
      <div className="profile-section">
        <div className="profile-picture-container">
          <img
            src={
              jobseekerData.profilePicture
                ? `http://localhost:5001/${jobseekerData.profilePicture}`
                : `http://localhost:5001/uploads/default-placeholder.webp`
            }
            alt="Profile"
            className="profile-picture"
          />
        </div>
        <h2>Jobseeker Dashboard</h2>
        {!editing ? (
          <div>
            <h3>Welcome, {jobseekerData.name || "Jobseeker"}</h3>
            <p>Email: {jobseekerData.email || "Not provided"}</p>
            <button onClick={() => setEditing(true)} className="edit-profile-btn">
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile} className="profile-form">
            <div>
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={jobseekerData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />
            </div>
            <div>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={jobseekerData.email}
                disabled
              />
            </div>
            <div>
              <label>Profile Picture</label>
              <input
                type="file"
                name="profilePicture"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            <div>
              <label>Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={jobseekerData.dob}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={jobseekerData.address}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={jobseekerData.phoneNumber}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="save-changes-btn">
              Save Changes
            </button>
            <button type="button" onClick={() => setEditing(false)} className="cancel-btn">
              Cancel
            </button>
          </form>
        )}
      </div>

      <div className="jobs-section">
        <h3>Available Jobs</h3>
        <ul className="jobs-list">
          {jobs.map((job) => (
            <li key={job._id} className="job-card">
              <strong>{job.title}</strong> - {job.location}
              <p>{job.description}</p>
              <p>Salary: ${job.salary}</p>
              
              {jobseekerData.applications.includes(job._id) ? (
                <div>
                  <button className="applied-btn" disabled>Applied</button>
                  <button
                    onClick={() => handleCancelApplication(job._id)}
                    className="cancel-btn">
                    Cancel Application
                  </button>
                </div>
              ) : (
                <button onClick={() => handleApplyJob(job._id)} className="apply-btn">
                  Apply Now
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {applyingJobId && (
        <div className="application-form">
          <h3>Apply for Job</h3>
          <form onSubmit={handleApplicationSubmit}>
            <input
              type="text"
              placeholder="Name"
              value={applicationDetails.name}
              onChange={(e) => setApplicationDetails({ ...applicationDetails, name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={applicationDetails.phoneNumber}
              onChange={(e) => setApplicationDetails({ ...applicationDetails, phoneNumber: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Education"
              value={applicationDetails.education}
              onChange={(e) => setApplicationDetails({ ...applicationDetails, education: e.target.value })}
              required
            />
            <button type="submit" className="apply-submit-btn">
              Submit Application
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default JobseekerDashboard;
