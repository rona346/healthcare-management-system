import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';
import Notifications from './Notifications';

export default function Navbar() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const getLogoDestination = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'doctor') return '/doctor/dashboard';
    if (user.role === 'patient') return '/patient/dashboard';
    return '/';
  };

  return (
    <nav className="h-20 border-b border-stone-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-8 flex items-center justify-between">
      <Link to={getLogoDestination()} className="flex items-center gap-3">
        <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center text-white shadow-md">
          <span className="text-xl font-semibold">H</span>
        </div>
        <span className="text-xl font-serif tracking-tight text-stone-900">
          HealthCare <span className="italic">OS</span>
        </span>
      </Link>

      <div className="flex items-center gap-8">
        {user ? (
          <>
            <Notifications />
            <div className="flex items-center gap-4 pl-8 border-l border-stone-100">
              <Link
                to={user.role === 'admin' ? '/admin/profile' : user.role === 'doctor' ? '/doctor/profile' : '/patient/profile'}
                className="flex items-center gap-4 hover:opacity-80 transition-all duration-300 cursor-pointer group"
              >
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-stone-900 group-hover:text-stone-700 transition-colors">{user.displayName}</p>
                  <p className="text-[10px] uppercase tracking-widest text-stone-400">{user.role}</p>
                </div>
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-10 h-10 rounded-full border border-stone-100 group-hover:border-stone-200 transition-colors"
                  referrerPolicy="no-referrer"
                />
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={login}
            className="px-6 py-2 bg-stone-900 text-white rounded-full hover:bg-stone-800 transition-colors flex items-center gap-2 text-sm font-sans"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
