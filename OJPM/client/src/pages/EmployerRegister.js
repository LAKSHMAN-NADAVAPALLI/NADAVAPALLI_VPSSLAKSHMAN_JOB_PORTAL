import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './EmployerRegister.css'; // Import the CSS file

const EmployerRegister = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // For success messages
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5001/api/employer/register', { name, email, password });

      // Show success message
      setSuccess('Registration successful! Redirecting to employer login...');
      setError('');

      // Store token if provided
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      // Redirect to login page after a short delay
      setTimeout(() => navigate('/employer/login'), 2000);
    } catch (err) {
      console.error('Registration error:', err.response || err);
      if (err.response) {
        setError(err.response.data.message || 'Registration failed');
      } else {
        setError('Server error or network issue');
      }
      setSuccess('');
    }
  };

  return (
    <div className="employerregister-container">
      <form className="employerregister-form" onSubmit={handleRegister}>
        <h2>Employer Registration</h2>
        <input 
          type="text" 
          placeholder="Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Confirm Password" 
          value={confirmPassword} 
          onChange={(e) => setConfirmPassword(e.target.value)} 
        />
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default EmployerRegister;
