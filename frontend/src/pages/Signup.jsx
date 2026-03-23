import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Camera, AlertCircle, CheckCircle } from 'lucide-react';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const SpinnerWhite = () => (
  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const Signup = () => {
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [isLoading, setIsLoading]             = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signup, googleSignIn } = useAuth();
  const navigate = useNavigate();

  const handleValidations = () => {
    if (!name || !email || !password) { setError('All fields are required'); return false; }
    if (!/^\S+@\S+\.\S+$/.test(email))     { setError('Please enter a valid email format'); return false; }
    if (password.length < 6)               { setError('Password must be at least 6 characters'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!handleValidations()) return;
    setIsLoading(true);
    const res = await signup(name, email, password);
    if (res.success) {
      setSuccess('Account created! Redirecting…');
      setTimeout(() => navigate('/'), 1200);
    } else { setError(res.message); }
    setIsLoading(false);
  };

  const handleGoogleAuth = async () => {
    setError(''); setSuccess('');
    setIsGoogleLoading(true);
    const res = await googleSignIn();
    if (res.success) {
      setSuccess('Google Sign Up successful! Redirecting…');
      setTimeout(() => navigate('/'), 1200);
    } else { setError(res.message); }
    setIsGoogleLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh] px-4">
      {/* Glow blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle,#8b5cf6,transparent)' }} />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle,#6366f1,transparent)' }} />
      </div>

      <div
        className="relative w-full max-w-md rounded-2xl p-8 glass-strong"
        style={{ boxShadow: '0 25px 60px rgb(0 0 0 / 0.5)' }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 rotate-6"
            style={{
              background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)',
              boxShadow: '0 0 30px rgb(139 92 246 / 0.5)',
            }}
          >
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Create account</h1>
          <p className="mt-1 text-sm" style={{ color: 'rgb(148 150 180)' }}>
            Join us and start managing your gallery
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium"
            style={{ background: 'rgb(239 68 68 / 0.1)', border: '1px solid rgb(239 68 68 / 0.25)', color: '#f87171' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-5 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium"
            style={{ background: 'rgb(16 185 129 / 0.1)', border: '1px solid rgb(16 185 129 / 0.25)', color: '#34d399' }}>
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: 'signup-name',     label: 'Full Name',      icon: User, type: 'text',     val: name,     set: setName,     ph: 'John Doe' },
            { id: 'signup-email',    label: 'Email Address',  icon: Mail, type: 'email',    val: email,    set: setEmail,    ph: 'you@example.com' },
            { id: 'signup-password', label: 'Password',       icon: Lock, type: 'password', val: password, set: setPassword, ph: '••••••••' },
          ].map(({ id, label, icon: Icon, type, val, set, ph }) => (
            <div key={id}>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                style={{ color: 'rgb(148 150 180)' }}>
                {label}
              </label>
              <div className="relative">
                <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'rgb(148 150 180)' }} />
                <input
                  id={id}
                  type={type}
                  className="field pl-10"
                  placeholder={ph}
                  value={val}
                  onChange={e => set(e.target.value)}
                />
              </div>
            </div>
          ))}

          <button
            id="signup-submit"
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="btn-primary w-full mt-2 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? <SpinnerWhite /> : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <hr className="flex-1" style={{ borderColor: 'rgb(255 255 255 / 0.08)' }} />
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(148 150 180)' }}>or</span>
          <hr className="flex-1" style={{ borderColor: 'rgb(255 255 255 / 0.08)' }} />
        </div>

        {/* Google */}
        <button
          id="signup-google"
          onClick={handleGoogleAuth}
          disabled={isLoading || isGoogleLoading}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-60"
          style={{
            background: 'rgb(255 255 255 / 0.05)',
            border: '1px solid rgb(255 255 255 / 0.1)',
            color: 'rgb(248 248 255)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgb(255 255 255 / 0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgb(255 255 255 / 0.05)'; }}
        >
          {isGoogleLoading ? <SpinnerWhite /> : <><GoogleIcon /> Sign up with Google</>}
        </button>

        <p className="mt-6 text-center text-sm" style={{ color: 'rgb(148 150 180)' }}>
          Already have an account?{' '}
          <Link to="/login"
            className="font-semibold transition-colors"
            style={{ color: '#a78bfa' }}
            onMouseEnter={e => e.currentTarget.style.color = '#c4b5fd'}
            onMouseLeave={e => e.currentTarget.style.color = '#a78bfa'}
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
