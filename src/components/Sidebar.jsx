import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  FileText,
  UserCircle,
  Stethoscope,
  LogOut,
  ShieldCheck,
  Building2,
  Heart
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onClose) onClose();
  };

  // Define navigation items per role strictly matching requirements
  let navItems = [];

  if (user.role === 'ADMIN') {
    navItems = [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Doctors', path: '/admin/doctors', icon: Stethoscope },
      { name: 'Patients', path: '/admin/patients', icon: Users },
      { name: 'Appointments', path: '/admin/appointments', icon: Calendar },
      { name: 'Users', path: '/admin/users', icon: ShieldCheck },
    ];
  } else if (user.role === 'DOCTOR') {
    navItems = [
      { name: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
      { name: 'Appointments', path: '/doctor/appointments', icon: Calendar },
      { name: 'Patients', path: '/doctor/patients', icon: Users },
      { name: 'Prescriptions', path: '/doctor/prescription', icon: FileText },
      { name: 'Profile', path: '/doctor/profile', icon: UserCircle },
    ];
  } else if (user.role === 'PATIENT') {
    navItems = [
      { name: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
      { name: 'Doctors', path: '/patient/doctors', icon: Stethoscope },
      { name: 'Appointments', path: '/patient/appointments', icon: Calendar },
      { name: 'Prescriptions', path: '/patient/prescriptions', icon: FileText },
      { name: 'Profile', path: '/patient/profile', icon: UserCircle },
    ];
  }

  const roleLabel = {
    ADMIN: 'Administrator Portal',
    DOCTOR: 'Physician Portal',
    PATIENT: 'Patient Portal',
  }[user.role] || 'Medical Portal';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Navigation
          </p>
          <p className="text-xs font-medium text-teal-700 mt-0.5">
            {roleLabel}
          </p>
        </div>

        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User Card & Logout in Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/60">
          <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 truncate">{user.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
