import { useApp } from '../../context/AppContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FolderHeart, Shield, LogOut, LayoutDashboard, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) {
    return (
      <header id="landing-navbar" className="fixed top-0 left-0 right-0 z-40 bg-[#FAFAF8]/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#264653] flex items-center justify-center shadow-lg shadow-gray-200/50 group-hover:scale-105 transition-transform duration-300">
              <FolderHeart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#264653] font-serif">
              3D Notes
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link 
              to="/auth" 
              state={{ mode: 'login' }}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/auth" 
              state={{ mode: 'register' }}
              className="px-5 py-2.5 text-sm font-medium bg-[#264653] text-white hover:bg-[#1a303a] rounded-xl transition-all duration-300 shadow-md shadow-gray-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <nav id="app-navbar" className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#264653] flex items-center justify-center">
            <FolderHeart className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-gray-900 font-serif">
            3D Notes
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link 
            to="/dashboard" 
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              location.pathname === '/dashboard' 
                ? 'text-[#264653] bg-gray-50' 
                : 'text-gray-600 hover:text-gray-950'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Workspace
          </Link>

          {user.role === 'admin' && (
            <Link 
              to="/admin" 
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                location.pathname.startsWith('/admin') 
                  ? 'text-amber-700 bg-amber-50/50' 
                  : 'text-gray-600 hover:text-gray-950'
              }`}
            >
              <Shield className="w-4 h-4 text-amber-600" />
              Admin Panel
            </Link>
          )}

          <div className="h-4 w-[1px] bg-gray-200" />

          <div className="flex items-center gap-3">
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-xs font-semibold text-gray-900">{user.name}</span>
              <span className="text-[10px] text-gray-500 capitalize">{user.role}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 text-gray-700">
              <User className="w-4 h-4" />
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-gray-700 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
