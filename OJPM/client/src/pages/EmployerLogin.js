import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EmployerLogin.css';

const EmployerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.body.className = 'employer-login-page'; // Optional: Add a class to style the body for this page
    return () => {
      document.body.className = ''; // Reset the body class when leaving the page
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5001/api/employer/login', { email, password });

      if (response.data && response.data.message === 'Login successful') {
        alert('Login successful!');
        localStorage.setItem('token', response.data.token);
        sessionStorage.setItem('employerProfile', JSON.stringify(response.data.employer));
        navigate('/employer-dashboard');
      } else {
        setError('Invalid credentials or account issue.');
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Your account has been blocked by the admin. Please contact support.');
      } else if (err.response?.status === 400) {
        setError('Invalid credentials. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    }
  };

  return (
    <div className="employer-login-wrapper">
      <div className="employer-login-container">
        <header className="employer-login-header">
          <h1>Employer Login</h1>
        </header>
        <div className="employer-login-form-container">
          <form onSubmit={handleLogin} className="employer-login-form">
            <label htmlFor="email" className="input-label">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
            <label htmlFor="password" className="input-label">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="login-button">Login</button>
          </form>
          <div className="register-link">
            <p>
              Don't have an account?{' '}
              <span
                onClick={() => navigate('/employer/register')}
                className="register-link-text"
              >
                Register here
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerLogin;
