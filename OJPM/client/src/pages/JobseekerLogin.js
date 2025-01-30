import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './JobseekerLogin.css';  // Import CSS here

const JobseekerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:5001/api/jobseeker/login', { email, password });

      // Save token to localStorage
      localStorage.setItem('token', response.data.token);

      alert(response.data.message);
      // Redirect to jobseeker dashboard
      navigate('/jobseeker-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Job Seeker Login</h2>
        <form onSubmit={handleLogin} className="login-form">
  <div className="input-container">
    <input 
      type="email" 
      className="login-input"
      placeholder=" " 
      value={email} 
      onChange={(e) => setEmail(e.target.value)} 
    />
    <label className="input-label">Enter Email</label>
  </div>

  <div className="input-container">
    <input 
      type="password" 
      className="login-input"
      placeholder=" " 
      value={password} 
      onChange={(e) => setPassword(e.target.value)} 
    />
    <label className="input-label">Enter Password</label>
  </div>

  {error && <p className="error-message">{error}</p>}
  
  <button type="submit" className="login-button">Login</button>
</form>
        <div className="register-link">
          <p>Don't have an account? <span onClick={() => navigate('/jobseeker/register')}>Register here</span></p>
        </div>
      </div>
    </div>
  );
};

export default JobseekerLogin;
