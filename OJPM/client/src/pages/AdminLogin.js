import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminLogin.css';

const AdminLogin = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    document.body.className = 'admin-login-page';
    return () => {
      document.body.className = '';
    };
  }, []);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5001/api/admin/login-password', { emailOrPhone, password });
      alert(response.data.message || 'Login successful');
      navigate('/admin-dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adminlogin-containerad">
      <header className="header">
        <h1>Admin Login</h1>
      </header>

      <div className="form-containerad">
        <h2>Welcome to Admin Login</h2>

        <form className="login-formad" onSubmit={handlePasswordLogin}>
          <label htmlFor="emailOrPhone" className="input-label">
            
          </label>
          <input
            id="emailOrPhone"
            className="input-field"
            type="text"
            placeholder="Enter Email or Phone"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            required
          />
          <label htmlFor="password" className="input-label">
            
          </label>
          <input
            id="password"
            className="input-field"
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="error-messagead">{error}</p>}
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
