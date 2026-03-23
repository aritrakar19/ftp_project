import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { app } from '../firebase';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Request interceptor for adding the bearer token
api.interceptors.request.use(
  async (config) => {
    // 1. Check for token in localStorage (Custom backend auth)
    const localUser = localStorage.getItem('userInfo');
    if (localUser) {
      try {
        const parsedUser = JSON.parse(localUser);
        if (parsedUser.token) {
          config.headers.Authorization = `Bearer ${parsedUser.token}`;
          return config; // Use local token
        }
      } catch (e) {
        // Ignored
      }
    }

    const localToken = localStorage.getItem('token');
    if (localToken) {
      config.headers.Authorization = `Bearer ${localToken}`;
      return config; // Use local token
    }

    // 2. Fallback to Firebase Auth
    try {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        console.log('Using Firebase Auth token:', token.substring(0, 15) + '...');
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Ignored
    }

    if (!config.headers.Authorization) {
      console.log('No auth token found to send in headers.');
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
