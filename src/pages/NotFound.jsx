import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, Home } from 'lucide-react';

export default function NotFound() {
  const { user } = useAuth();

  let homeUrl = '/login';
  if (user) {
    if (user.role === 'ADMIN') homeUrl = '/admin/dashboard';
    else if (user.role === 'DOCTOR') homeUrl = '/doctor/dashboard';
    else if (user.role === 'PATIENT') homeUrl = '/patient/dashboard';
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-teal-100">
          <Stethoscope className="w-7 h-7" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">404</h1>
        <h2 className="text-lg font-bold text-slate-800 mb-2">Page Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">
          The medical management portal page you requested does not exist or has been moved.
        </p>
        <Link
          to={homeUrl}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs"
        >
          <Home className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
