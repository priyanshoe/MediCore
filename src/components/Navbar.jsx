import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resetMockData } from '../api/api';
import {
  HeartPulse,
  LogOut,
  Menu,
  X,
  User,
  RotateCcw,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';

export default function Navbar({ onToggleSidebar, isSidebarOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo data (users, appointments, prescriptions) to default initial state?')) {
      resetMockData();
      window.location.reload();
    }
  };

  const getRoleBadge = (role) => {
    if (role === 'ADMIN') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800">
          <ShieldCheck className="w-3 h-3" />
          ADMIN
        </span>
      );
    }
    if (role === 'DOCTOR') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
          <Stethoscope className="w-3 h-3" />
          DOCTOR
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-teal-100 text-teal-800">
        <User className="w-3 h-3" />
        PATIENT
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Logo */}
        <div className="flex items-center gap-3">
          {user && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle navigation sidebar"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight">MediCare</span>
              <span className="hidden sm:inline-block text-xs text-teal-600 font-medium ml-1.5 px-1.5 py-0.2 bg-teal-50 rounded">
                Learning App
              </span>
            </div>
          </Link>
        </div>

        {/* Right: User Status & Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {user ? (
            <>
              {/* Reset seed data button */}
              <button
                type="button"
                onClick={handleResetData}
                title="Reset local demo database to initial state"
                className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Data</span>
              </button>

              {/* User profile capsule */}
              <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[140px]">
                    {user.name}
                  </p>
                  <div className="mt-0.5">{getRoleBadge(user.role)}</div>
                </div>

                <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-teal-700 text-sm overflow-hidden shrink-0">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user?.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.email.charAt(0).toUpperCase()
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors"
              >
                Register as Patient
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
