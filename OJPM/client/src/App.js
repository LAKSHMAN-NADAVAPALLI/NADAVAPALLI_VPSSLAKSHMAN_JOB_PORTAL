import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Importing pages
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import EmployerRegister from './pages/EmployerRegister';
import EmployerLogin from './pages/EmployerLogin';
import JobseekerRegister from './pages/JobseekerRegister';
import JobseekerLogin from './pages/JobseekerLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminJobManagement from './pages/AdminJobManagement';
import EmployerDashboard from './pages/EmployerDashboard';
import JobseekerDashboard from './pages/JobseekerDashboard';

// Importing components
import ChatWindow from './components/ChatWindow';

import './App.css';

function App() {
  return (
    <Router>
      <div>
        {/* Chat window will be always present */}
        <ChatWindow />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/employer/register" element={<EmployerRegister />} />
          <Route path="/jobseeker/register" element={<JobseekerRegister />} />
          <Route path="/jobseeker/login" element={<JobseekerLogin />} />
          <Route path="/employer/login" element={<EmployerLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/adminjobs" element={<AdminJobManagement />} />
          <Route path="/employer-dashboard" element={<EmployerDashboard />} />
          <Route path="/jobseeker-dashboard" element={<JobseekerDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
