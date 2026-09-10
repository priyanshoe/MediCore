import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Context
import { useAuth } from '../context/AuthContext';

// Layout & Route Protection
import Layout from '../components/Layout';
import ProtectedRoute from './ProtectedRoute';

// Public Pages
import Login from '../pages/Login';
import Register from '../pages/Register';
import NotFound from '../pages/NotFound';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminDoctors from '../pages/admin/Doctors';
import AddDoctor from '../pages/admin/AddDoctor';
import EditDoctor from '../pages/admin/EditDoctor';
import AdminPatients from '../pages/admin/Patients';
import AdminAppointments from '../pages/admin/Appointments';
import AdminUsers from '../pages/admin/Users';

// Doctor Pages
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import DoctorAppointments from '../pages/doctor/Appointments';
import DoctorPatients from '../pages/doctor/Patients';
import DoctorPatientProfile from '../pages/doctor/PatientProfile';
import DoctorPrescription from '../pages/doctor/Prescription';
import DoctorProfile from '../pages/doctor/Profile';

// Patient Pages
import PatientDashboard from '../pages/patient/PatientDashboard';
import PatientDoctors from '../pages/patient/Doctors';
import PatientDoctorProfile from '../pages/patient/DoctorProfile';
import BookAppointment from '../pages/patient/BookAppointment';
import PatientAppointments from '../pages/patient/Appointments';
import PatientPrescriptions from '../pages/patient/Prescriptions';
import PatientProfile from '../pages/patient/Profile';

const el = React.createElement;

// Home redirect based on role or login
function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return el(Navigate, { to: '/login', replace: true });
  }

  if (user.role === 'ADMIN') {
    return el(Navigate, { to: '/admin/dashboard', replace: true });
  }
  if (user.role === 'DOCTOR') {
    return el(Navigate, { to: '/doctor/dashboard', replace: true });
  }
  if (user.role === 'PATIENT') {
    return el(Navigate, { to: '/patient/dashboard', replace: true });
  }

  return el(Navigate, { to: '/login', replace: true });
}

export const router = createBrowserRouter([
  // Public Routes
  {
    path: '/',
    element: el(HomeRedirect),
  },
  {
    path: '/login',
    element: el(Login),
  },
  {
    path: '/register',
    element: el(Register),
  },

  // Admin Routes (Protected)
  {
    path: '/admin',
    element: el(ProtectedRoute, { allowedRoles: ['ADMIN'] }, el(Layout)),
    children: [
      {
        path: '',
        element: el(Navigate, { to: '/admin/dashboard', replace: true }),
      },
      {
        path: 'dashboard',
        element: el(AdminDashboard),
      },
      {
        path: 'doctors',
        element: el(AdminDoctors),
      },
      {
        path: 'doctors/create',
        element: el(AddDoctor),
      },
      {
        path: 'doctors/edit/:id',
        element: el(EditDoctor),
      },
      {
        path: 'patients',
        element: el(AdminPatients),
      },
      {
        path: 'appointments',
        element: el(AdminAppointments),
      },
      {
        path: 'users',
        element: el(AdminUsers),
      },
    ],
  },

  // Doctor Routes (Protected)
  {
    path: '/doctor',
    element: el(ProtectedRoute, { allowedRoles: ['DOCTOR'] }, el(Layout)),
    children: [
      {
        path: '',
        element: el(Navigate, { to: '/doctor/dashboard', replace: true }),
      },
      {
        path: 'dashboard',
        element: el(DoctorDashboard),
      },
      {
        path: 'appointments',
        element: el(DoctorAppointments),
      },
      {
        path: 'patients',
        element: el(DoctorPatients),
      },
      {
        path: 'patients/:patientId',
        element: el(DoctorPatientProfile),
      },
      {
        path: 'prescription',
        element: el(DoctorPrescription),
      },
      {
        path: 'profile',
        element: el(DoctorProfile),
      },
    ],
  },

  // Patient Routes (Protected)
  {
    path: '/patient',
    element: el(ProtectedRoute, { allowedRoles: ['PATIENT'] }, el(Layout)),
    children: [
      {
        path: '',
        element: el(Navigate, { to: '/patient/dashboard', replace: true }),
      },
      {
        path: 'dashboard',
        element: el(PatientDashboard),
      },
      {
        path: 'doctors',
        element: el(PatientDoctors),
      },
      {
        path: 'doctors/:doctorId',
        element: el(PatientDoctorProfile),
      },
      {
        path: 'doctors/:doctorId/book',
        element: el(BookAppointment),
      },
      {
        path: 'book-appointment',
        element: el(BookAppointment),
      },
      {
        path: 'appointments',
        element: el(PatientAppointments),
      },
      {
        path: 'prescriptions',
        element: el(PatientPrescriptions),
      },
      {
        path: 'profile',
        element: el(PatientProfile),
      },
    ],
  },

  // Catch-all
  {
    path: '*',
    element: el(NotFound),
  },
]);

export default router;
