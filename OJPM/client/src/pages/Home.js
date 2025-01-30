import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'; // Import Navbar
import Footer from '../components/Footer'; // Import Footer
import './home.css'; // Home-specific CSS

const Home = () => {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  // Update page title and body class
  useEffect(() => {
    document.title = 'Home-Job Portal';
    document.body.className = 'home-page';
    return () => {
      document.body.className = ''; // Cleanup body class on unmount
    };
  }, []);

  const handleRoleChange = (role) => {
    setRole(role);
    if (role === 'admin') {
      navigate('/admin/login');
    } else if (role === 'employer') {
      navigate('/employer/login');
    } else if (role === 'jobseeker') {
      navigate('/jobseeker/login');
    }
  };

  return (
    <>
      <Navbar/>
      <div className="home-container">
        {/* Hero Section */}
        <section className="hero-section">
          <h1>Welcome to the Job Portal Home Page</h1>
          <p>Find Your Dream Job Today!</p>
          <div className="role-buttons">
            <button
              className="role-button admin"
              onClick={() => handleRoleChange('admin')}
            >
              Admin
            </button>
            <button
              className="role-button employer"
              onClick={() => handleRoleChange('employer')}
            >
              Employer
            </button>
            <button
              className="role-button jobseeker"
              onClick={() => handleRoleChange('jobseeker')}
            >
              Job Seeker
            </button>
          </div>
        </section>
      </div>
      <Footer/>
    </>
  );
};

export default Home;
