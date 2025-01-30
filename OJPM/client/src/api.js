import axios from 'axios';

// Create an Axios instance for making API requests
const api = axios.create({
  baseURL: 'http://localhost:5000',  // Your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to set the Authorization header with the token
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;
