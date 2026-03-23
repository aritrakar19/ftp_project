import { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  updateProfile
} from "firebase/auth";
import { app } from '../firebase'; // initialized in firebase.js
import api from '../api/axios';

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          // Call backend to sync user details and get JWT
          const { data: backendUser } = await api.post('/auth/sync', { token });
          
          localStorage.setItem('token', backendUser.token);
          localStorage.setItem('userInfo', JSON.stringify(backendUser));
          
          setUser({ ...currentUser, ...backendUser });
        } catch (error) {
          console.error("Failed to sync user with backend:", error);
          setUser(currentUser);
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Update display name
      await updateProfile(result.user, { displayName: name });
      // To propagate the updated name into the current session state natively
      setUser({ ...result.user, displayName: name });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const googleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, googleSignIn, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
