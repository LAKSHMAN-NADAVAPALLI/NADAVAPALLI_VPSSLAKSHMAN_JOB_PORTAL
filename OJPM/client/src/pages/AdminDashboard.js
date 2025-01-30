import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';
import { useNavigate } from 'react-router-dom';  // Import useNavigate from React Router

const AdminDashboard = () => {
  const [employers, setEmployers] = useState([]);
  const [jobSeekers, setJobSeekers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const navigate = useNavigate();  // Initialize useNavigate hook

  useEffect(() => {
    document.documentElement.className = 'admin-dashboard-page';
    fetchUsers();
    return () => {
      document.documentElement.className = '';
    };
  }, []);

  // Fetch Employers and Job Seekers
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [employersResponse, jobSeekersResponse] = await Promise.all([
        axios.get('http://localhost:5001/api/admin/employers'),
        axios.get('http://localhost:5001/api/admin/jobseekers'),
      ]);
      setEmployers(employersResponse.data);
      setJobSeekers(jobSeekersResponse.data);
    } catch (error) {
      console.error('Error fetching users:', error.message);
      alert('Failed to fetch user data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Block/Unblock User
  const handleBlockUser = async (email, role, isBlocked) => {
    const action = isBlocked ? 'unblock' : 'block';
    if (window.confirm(`Are you sure you want to ${action} this ${role}?`)) {
      try {
        const endpoint =
          role === 'Employer'
            ? `http://localhost:5001/api/admin/employer/${email}/${action}`
            : `http://localhost:5001/api/admin/jobseeker/${email}/${action}`;
        setLoading(true);
        const response = await axios.patch(endpoint);
        if (response.status === 200) {
          alert(`${role} ${action}ed successfully.`);
          if (role === 'Employer') {
            setEmployers((prev) =>
              prev.map((emp) =>
                emp.email === email ? { ...emp, isBlocked: !isBlocked } : emp
              )
            );
          } else {
            setJobSeekers((prev) =>
              prev.map((seeker) =>
                seeker.email === email ? { ...seeker, isBlocked: !isBlocked } : seeker
              )
            );
          }
        } else {
          alert(`Failed to ${action} the ${role}. Please try again.`);
        }
      } catch (error) {
        console.error(`Error ${action}ing user:`, error.message);
        alert(`Failed to ${action} the ${role}. Please try again.`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Open Change Password Modal
  const openPasswordModal = (user, role) => {
    setSelectedUser({ ...user, role });
    setShowPasswordModal(true);
  };

  // Handle Change Password
  const handleChangePassword = async () => {
    if (!newPassword) {
      alert('Please enter a new password.');
      return;
    }
    try {
      const endpoint =
        selectedUser.role === 'Employer'
          ? `http://localhost:5001/api/admin/employer/${selectedUser.email}/password`
          : `http://localhost:5001/api/admin/jobseeker/${selectedUser.email}/password`;
      setLoading(true);
      const response = await axios.put(endpoint, { newPassword });
      if (response.status === 200) {
        alert('Password changed successfully.');
        setShowPasswordModal(false);
        setNewPassword('');
      } else {
        alert('Failed to change the password. Please try again.');
      }
    } catch (error) {
      console.error('Error changing password:', error.message);
      alert('Failed to change the password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployers = employers.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedRole === 'All' || selectedRole === 'Employer')
  );

  const filteredJobSeekers = jobSeekers.filter(
    (seeker) =>
      seeker.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedRole === 'All' || selectedRole === 'Job Seeker')
  );

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Dashboard</h2>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          style={{ padding: '5px' }}
        >
          <option value="All">All Users</option>
          <option value="Employer">Employers</option>
          <option value="Job Seeker">Job Seekers</option>
        </select>

        {/* Job Management Button */}
        <button
          onClick={() => navigate('/adminjobs')}  // Redirect to /adminjobs page
          style={{
            padding: '5px 10px',
            backgroundColor: '#007BFF',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Job Management
        </button>
      </div>

      <input
        type="text"
        placeholder="Search Users by Name"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: '20px', padding: '5px', width: '100%' }}
      />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <div>
            <h3>Employers</h3>
            {filteredEmployers.length > 0 ? (
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployers.map((emp) => (
                    <tr key={emp._id}>
                      <td>{emp.email}</td>
                      <td>{emp.name}</td>
                      <td>{emp.isBlocked ? 'Blocked' : 'Active'}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() =>
                              handleBlockUser(emp.email, 'Employer', emp.isBlocked)
                            }
                            disabled={loading}
                            className="action-btn"
                          >
                            {emp.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                          <button
                            onClick={() => openPasswordModal(emp, 'Employer')}
                            className="action-btn"
                          >
                            Change Password
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No employers found.</p>
            )}
          </div>

          <div>
            <h3>Job Seekers</h3>
            {filteredJobSeekers.length > 0 ? (
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobSeekers.map((seeker) => (
                    <tr key={seeker._id}>
                      <td>{seeker.email}</td>
                      <td>{seeker.name}</td>
                      <td>{seeker.isBlocked ? 'Blocked' : 'Active'}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() =>
                              handleBlockUser(seeker.email, 'Job Seeker', seeker.isBlocked)
                            }
                            disabled={loading}
                            className="action-btn"
                          >
                            {seeker.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                          <button
                            onClick={() => openPasswordModal(seeker, 'Job Seeker')}
                            className="action-btn"
                          >
                            Change Password
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No job seekers found.</p>
            )}
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div style={{ marginTop: '20px' }}>
          <h4>Change Password for {selectedUser.role}</h4>
          <p>Email: {selectedUser.email}</p>
          <input
            type="password"
            placeholder="Enter New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ padding: '5px', marginBottom: '10px' }}
          />
          <button onClick={handleChangePassword} disabled={loading}>
            Save Password
          </button>
          <button onClick={() => setShowPasswordModal(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
