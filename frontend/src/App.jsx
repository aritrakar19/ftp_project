import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import GalleryPage from './pages/GalleryPage';
import Dashboard from './pages/Dashboard';
import GalleriesPage from './pages/GalleriesPage';
import GalleryDetailPage from './pages/GalleryDetailPage';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const RootRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') return <Navigate to="/dashboard" replace />;
  return <Navigate to="/galleries" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-app">
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              {/* Redirect based on role */}
              <Route path="/" element={<RootRedirect />} />

              {/* Gallery hub (sidebar + card grid) */}
              <Route path="/galleries" element={<GalleriesPage />} />

              {/* Individual gallery detail */}
              <Route path="/galleries/:id" element={<GalleryDetailPage />} />

              {/* Old flat image browsing page (kept for backwards compat) */}
              <Route path="/browse" element={<GalleryPage />} />

              <Route path="/login"  element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
