import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { app } from '../firebase';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Request interceptor for adding the bearer token directly from Firebase
api.interceptors.request.use(
  async (config) => {
    const auth = getAuth(app);
    const user = auth.currentUser;
    
    if (user) {
      // Gets the Firebase ID Token
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
