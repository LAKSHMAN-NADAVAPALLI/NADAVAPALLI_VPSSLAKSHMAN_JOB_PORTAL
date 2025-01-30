import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Fixed import
import "./EmployerDashboard.css";

const EmployerDashboard = () => {
  const [employerData, setEmployerData] = useState({
    name: "",
    email: "",
    profilePicture: "",
    dob: "",
    address: "",
    phoneNumber: "",
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [jobs, setJobs] = useState([]); // State to hold jobs data

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
      setEmployerData((prevState) => ({ ...prevState, email }));
      fetchEmployerProfile(email, token);
      fetchJobs(token); // Fetch jobs on component mount
    } catch (err) {
      console.error("Invalid token:", err);
      setError("Invalid or expired token.");
      setLoading(false);
    }
  }, []);

  const fetchEmployerProfile = async (email, token) => {
    try {
      const response = await axios.get(
        `http://localhost:5001/api/employer/profile?t=${new Date().getTime()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEmployerData(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching employer profile:", err);
      setError("Failed to load profile.");
      setLoading(false);
    }
  };

  const fetchJobs = async (token) => {
    try {
      const response = await axios.get(
        "http://localhost:5001/api/admin/jobs",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setJobs(response.data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load jobs.");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const formData = new FormData();
      formData.append("name", employerData.name);
      if (profilePicture) formData.append("profilePicture", profilePicture);
      if (editing) {
        formData.append("dob", employerData.dob);
        formData.append("address", employerData.address);
        formData.append("phoneNumber", employerData.phoneNumber);
      }

      const response = await axios.put(
        `http://localhost:5001/api/employer/profile?t=${new Date().getTime()}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Profile updated successfully!");
      setEmployerData(response.data);
      setEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployerData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="employerdashboard-container">
      <div className="employerprofile-picture-container">
        <img
          src={
            employerData.profilePicture
              ? `http://localhost:5001/${employerData.profilePicture}`
              : `http://localhost:5001/uploads/default-placeholder.webp`
          }
          alt="Profile"
          className="employerprofile-picture"
          onError={() => console.error("Error loading profile picture")}
        />
      </div>
      <h2>Employer Dashboard</h2>
      {!editing ? (
        <div>
          <h4>Welcome, {employerData.name || "Employer"}</h4>
          <p>Email: {employerData.email || "Not provided"}</p>
          <button onClick={() => setEditing(true)}>Edit Profile</button>
        </div>
      ) : (
        <form onSubmit={handleUpdateProfile}>
          <div>
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={employerData.name}
              onChange={handleChange}
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={employerData.email}
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
              value={employerData.dob}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={employerData.address}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              value={employerData.phoneNumber}
              onChange={handleChange}
            />
          </div>
          <button type="submit">Save Changes</button>
          <button type="button" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </form>
      )}
  
      <div>
        
        <h3> Jobs Monitoring</h3>
        {jobs.length > 0 ? (
          <ul className="employerjobs-list">
            {jobs.map((job) => (
              <li key={job._id} className="employerjob-card">
                <strong>{job.title}</strong> - {job.location}
                <p>{job.description}</p>
                <p>Salary: ${job.salary}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No jobs available.</p>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboard;
