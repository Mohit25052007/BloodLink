import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true, // Enables HTTP-only cookies in all requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to normalize error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred. Please try again.';

    if (error.response && error.response.data) {
      if (error.response.data.message) {
        message = error.response.data.message;
      } else if (error.response.data.errors && error.response.data.errors.length > 0) {
        message = error.response.data.errors.map((e) => e.message).join(', ');
      }
    } else if (error.message) {
      message = error.message;
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
