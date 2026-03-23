import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera, LogOut, LayoutDashboard, Grid3X3, Images } from 'lucide-react';

const NAV_LINKS = [
  { to: '/galleries', label: 'Galleries', icon: Grid3X3 },
  { to: '/browse',    label: 'Browse',    icon: Images },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user
    ? (user.displayName || user.email || '?')[0].toUpperCase()
    : null;

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{
        background: 'rgb(15 15 25 / 0.82)',
        backdropFilter: 'blur(20px)',
        borderColor: 'rgb(255 255 255 / 0.07)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* ── Brand ── */}
          <Link to="/galleries" className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-105"
              style={{
                background: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
                boxShadow: '0 0 16px rgb(139 92 246 / 0.5)',
              }}
            >
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              Gallery<span className="gradient-text">Pro</span>
            </span>
          </Link>

          {/* ── Right side ── */}
          <div className="flex items-center gap-1">
            {user ? (
              <>
                {/* Nav links — desktop */}
                <div className="hidden sm:flex items-center gap-1 mr-2">
                  {NAV_LINKS.map(({ to, label, icon: Icon }) => {
                    const active = pathname === to || (to !== '/galleries' && pathname.startsWith(to));
                    return (
                      <Link
                        key={to}
                        to={to}
                        className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-200"
                        style={{
                          color: active ? '#a78bfa' : 'rgb(148 150 180)',
                          background: active ? 'rgb(139 92 246 / 0.12)' : 'transparent',
                        }}
                        onMouseEnter={e => {
                          if (!active) e.currentTarget.style.color = 'rgb(248 248 255)';
                        }}
                        onMouseLeave={e => {
                          if (!active) e.currentTarget.style.color = 'rgb(148 150 180)';
                        }}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </Link>
                    );
                  })}
                </div>

                {/* divider */}
                <div className="hidden sm:block w-px h-6 mx-1" style={{ background: 'rgb(255 255 255 / 0.1)' }} />

                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white select-none"
                  style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)' }}
                  title={user.displayName || user.email}
                >
                  {initials}
                </div>

                <button
                  onClick={handleLogout}
                  id="nav-logout-btn"
                  title="Logout"
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
                  style={{ color: 'rgb(148 150 180)', border: '1px solid rgb(255 255 255 / 0.08)' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#f87171';
                    e.currentTarget.style.background = 'rgb(239 68 68 / 0.1)';
                    e.currentTarget.style.borderColor = 'rgb(239 68 68 / 0.25)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'rgb(148 150 180)';
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'rgb(255 255 255 / 0.08)';
                  }}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
                <Link to="/signup" className="btn-primary text-sm ml-1">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
