import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import AppointmentCard from '../../components/AppointmentCard';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  Stethoscope,
  ArrowRight,
  FileText
} from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingAppointments: 0,
    acceptedAppointments: 0,
    totalPatients: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [patientsMap, setPatientsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDoctorData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // Doctor only sees appointments where doctorId matches user.id
      const [apptsRes, usersRes] = await Promise.all([
        api.get(`/appointments?doctorId=${user.id}`),
        api.get('/users?role=PATIENT'),
      ]);

      const myAppts = apptsRes.data || [];
      const patients = usersRes.data || [];

      const pMap = {};
      patients.forEach((p) => {
        pMap[p.id] = p;
        pMap[String(p.id)] = p;
      });
      setPatientsMap(pMap);

      // Today's date string in YYYY-MM-DD
      const todayStr = new Date().toISOString().split('T')[0];
      const todayAppts = myAppts.filter((a) => a.date === todayStr);
      const pendingAppts = myAppts.filter((a) => a.status === 'PENDING');
      const acceptedAppts = myAppts.filter((a) => a.status === 'ACCEPTED');

      // Distinct patients that have appointments with this doctor
      const distinctPatientIds = new Set(myAppts.map((a) => a.patientId));

      setStats({
        todayAppointments: todayAppts.length,
        pendingAppointments: pendingAppts.length,
        acceptedAppointments: acceptedAppts.length,
        totalPatients: distinctPatientIds.size,
      });

      // Show top upcoming appointments
      const upcoming = myAppts
        .filter((a) => a.status === 'PENDING' || a.status === 'ACCEPTED')
        .sort((a, b) => (a.date > b.date ? 1 : -1))
        .slice(0, 4);

      setUpcomingAppointments(upcoming);
    } catch (err) {
      console.error('Failed to load doctor dashboard:', err);
      setError('Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctorData();
  }, [user]);

  const handleAccept = async (appointment) => {
    try {
      await api.patch(`/appointments/${appointment.id}`, { status: 'ACCEPTED' });
      loadDoctorData();
    } catch (err) {
      alert('Failed to accept appointment.');
    }
  };

  const handleReject = async (appointment) => {
    const reason = window.prompt('Optional: provide a reason for rejecting this appointment:');
    try {
      await api.patch(`/appointments/${appointment.id}`, {
        status: 'REJECTED',
        rejectionReason: reason || 'Schedule conflict',
      });
      loadDoctorData();
    } catch (err) {
      alert('Failed to reject appointment.');
    }
  };

  if (loading) return <Loading message="Loading doctor dashboard..." />;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-2xl text-white p-6 sm:p-8 shadow-sm">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-600/50 backdrop-blur-xs text-teal-100 mb-3 border border-teal-500/40">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>{user?.specialization || 'Attending Physician'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome, Dr. {user?.name}
          </h1>
          <p className="text-sm text-teal-100/90 mt-1.5 leading-relaxed">
            Here is your daily medical consultation summary and patient appointment schedule.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Today's Appointments */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Today's Visits</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.todayAppointments}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 inline-block">Scheduled for today</span>
        </div>

        {/* Pending Appointments */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-900">{stats.pendingAppointments}</p>
          <Link to="/doctor/appointments" className="text-[11px] text-amber-800 hover:underline mt-0.5 inline-block font-medium">
            Requires your review →
          </Link>
        </div>

        {/* Accepted Appointments */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Accepted</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.acceptedAppointments}</p>
          <span className="text-[11px] text-emerald-600 font-medium mt-0.5 inline-block">Confirmed consultations</span>
        </div>

        {/* Total Patients */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Patients</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.totalPatients}</p>
          <Link to="/doctor/patients" className="text-[11px] text-teal-600 hover:underline mt-0.5 inline-block">
            View assigned patients →
          </Link>
        </div>
      </div>

      {/* Upcoming Appointments Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Upcoming Consultations</h2>
            <p className="text-xs text-slate-500">Appointments needing attention or scheduled next</p>
          </div>
          <Link
            to="/doctor/appointments"
            className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
          >
            <span>All Appointments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {upcomingAppointments.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No upcoming appointments"
            description="You do not have any pending or accepted appointments scheduled."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingAppointments.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                patient={patientsMap[appt.patientId]}
                role="DOCTOR"
                onAccept={handleAccept}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
