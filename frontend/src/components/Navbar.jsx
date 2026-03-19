import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera, LogOut, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-indigo-600 p-2 rounded-lg group-hover:bg-indigo-700 transition-colors">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900">
                Gallery<span className="text-indigo-600">Pro</span>
              </span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link 
                    to="/dashboard" 
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                )}
                <div className="h-8 w-px bg-gray-200 mx-2"></div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                    {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors focus:outline-none"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <Link 
                to="/login" 
                className="text-sm font-medium px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
