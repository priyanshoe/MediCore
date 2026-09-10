import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { getStatusBadge } from '../../components/AppointmentCard';
import {
  Stethoscope,
  Users,
  ShieldCheck,
  Calendar,
  Clock,
  PlusCircle,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalUsers: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const [usersRes, appointmentsRes] = await Promise.all([
          api.get('/users'),
          api.get('/appointments'),
        ]);

        const users = usersRes.data || [];
        const appointments = appointmentsRes.data || [];

        // Build users map by id for quick lookup
        const uMap = {};
        users.forEach((u) => {
          uMap[u.id] = u;
        });
        setUsersMap(uMap);

        const doctors = users.filter((u) => u.role === 'DOCTOR');
        const patients = users.filter((u) => u.role === 'PATIENT');
        const pending = appointments.filter((a) => a.status === 'PENDING');

        setStats({
          totalDoctors: doctors.length,
          totalPatients: patients.length,
          totalUsers: users.length,
          totalAppointments: appointments.length,
          pendingAppointments: pending.length,
        });

        // Sort appointments by id descending for recent ones
        const sortedAppointments = [...appointments].sort((a, b) => b.id - a.id).slice(0, 5);
        setRecentAppointments(sortedAppointments);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) return <Loading message="Loading administrator dashboard..." />;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            System overview and medical portal metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/doctors/create"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Doctor</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* 5 Stats Cards as required */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Doctors */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Doctors</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.totalDoctors}</p>
          <Link to="/admin/doctors" className="text-[11px] text-teal-600 hover:underline mt-1 inline-block">
            Manage doctors →
          </Link>
        </div>

        {/* Total Patients */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Patients</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.totalPatients}</p>
          <Link to="/admin/patients" className="text-[11px] text-teal-600 hover:underline mt-1 inline-block">
            View patient registry →
          </Link>
        </div>

        {/* Total Users */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Users</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
          <Link to="/admin/users" className="text-[11px] text-teal-600 hover:underline mt-1 inline-block">
            View all accounts →
          </Link>
        </div>

        {/* Total Appointments */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Appointments</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.totalAppointments}</p>
          <Link to="/admin/appointments" className="text-[11px] text-teal-600 hover:underline mt-1 inline-block">
            View appointments →
          </Link>
        </div>

        {/* Pending Appointments */}
        <div className="col-span-2 lg:col-span-1 bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-900">{stats.pendingAppointments}</p>
          <span className="text-[11px] text-amber-700 font-medium mt-1 inline-block">
            Awaiting doctor review
          </span>
        </div>
      </div>

      {/* Recent Appointments Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Recent Appointments</h2>
            <p className="text-xs text-slate-500 mt-0.5">Most recent appointment bookings</p>
          </div>
          <Link
            to="/admin/appointments"
            className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentAppointments.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No appointments yet" description="No appointment records found in the database." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Doctor</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentAppointments.map((appt) => {
                  const patient = usersMap[appt.patientId];
                  const doctor = usersMap[appt.doctorId];

                  return (
                    <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-500 font-semibold">
                        #{appt.id}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-900">
                        {patient?.name || `Patient #${appt.patientId}`}
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">
                        {doctor?.name || `Doctor #${appt.doctorId}`}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600">
                        {appt.date} at {appt.time}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-500 max-w-xs truncate">
                        {appt.reason}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {getStatusBadge(appt.status)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
