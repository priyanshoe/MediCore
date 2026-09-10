import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import AppointmentCard from '../../components/AppointmentCard';
import {
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  PlusCircle,
  Stethoscope,
  ArrowRight
} from 'lucide-react';
import DoctorService from '../../services/DoctorService';
import AppointmentService from '../../services/AppointmentService';
import PrescriptionService from '../../services/PrescriptionService';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    totalPrescriptions: 0,
  });
  const [upcomingList, setUpcomingList] = useState([]);
  const [doctorsMap, setDoctorsMap] = useState({});
  const [prescriptionsMap, setPrescriptionsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPatientData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [apptsRes, doctorsRes, prescRes] = await Promise.all([
        AppointmentService.findByPatientId(user.id),
        DoctorService.findAll(),
        PrescriptionService.findByPatientId(user.id)
      ]);

      const myAppts = apptsRes.data || [];
      const doctors = doctorsRes.data || [];
      const myPrescriptions = prescRes.data || [];

      const dMap = {};
      doctors.forEach((d) => {
        dMap[d.id] = d;
        dMap[String(d.id)] = d;
      });
      setDoctorsMap(dMap);

      const prMap = {};
      myPrescriptions.forEach((pr) => {
        prMap[pr.appointmentId] = pr;
        prMap[String(pr.appointmentId)] = pr;
      });
      setPrescriptionsMap(prMap);

      const upcoming = myAppts.filter(
        (a) => a.status === 'PENDING' || a.status === 'ACCEPTED'
      );
      const completed = myAppts.filter((a) => a.status === 'COMPLETED');

      setStats({
        totalAppointments: myAppts.length,
        upcomingAppointments: upcoming.length,
        completedAppointments: completed.length,
        totalPrescriptions: myPrescriptions.length,
      });

      // Sort upcoming by date
      setUpcomingList(
        upcoming
          .sort((a, b) => (a.date > b.date ? 1 : -1))
          .slice(0, 4)
      );
    } catch (err) {
      console.error('Failed to load patient dashboard:', err);
      setError('Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatientData();
  }, [user]);

  const handleCancelAppointment = async (appointment) => {
    const confirmed = window.confirm('Are you sure you want to cancel this appointment?');
    if (!confirmed) return;
    try {
      await AppointmentService.updateStatus(appointment.id, 'CANCELLED');
      loadPatientData();
    } catch (err) {
      alert('Failed to cancel appointment.');
    }
  };

  if (loading) return <Loading message="Loading patient dashboard..." />;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-2xl text-white p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="max-w-xl">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-teal-200 mb-1">
            Patient Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome, {user?.name}
          </h1>
          <p className="text-sm text-teal-100/90 mt-1 leading-relaxed">
            Manage your medical checkups, view prescriptions, and schedule appointments with top specialists.
          </p>
        </div>

        <Link
          to="/patient/book-appointment"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-teal-900 font-semibold text-xs shadow-sm hover:bg-teal-50 transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-teal-600" />
          <span>Book Appointment</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Appointments</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.totalAppointments}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 inline-block">Total bookings</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Upcoming</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.upcomingAppointments}</p>
          <span className="text-[11px] text-amber-600 font-medium mt-0.5 inline-block">Pending or accepted</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.completedAppointments}</p>
          <span className="text-[11px] text-emerald-600 font-medium mt-0.5 inline-block">Past visits</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Prescriptions</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.totalPrescriptions}</p>
          <Link to="/patient/prescriptions" className="text-[11px] text-teal-600 hover:underline mt-0.5 inline-block font-medium">
            View medical notes →
          </Link>
        </div>
      </div>

      {/* Upcoming Appointments Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Upcoming Appointments</h2>
            <p className="text-xs text-slate-500">Your scheduled visits and pending consultation requests</p>
          </div>
          <Link
            to="/patient/appointments"
            className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {upcomingList.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No upcoming appointments"
            description="You have no consultations lined up. Select a doctor to book a visit."
            actionLabel="Browse Doctors"
            onAction={() => (window.location.href = '/patient/doctors')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingList.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                doctor={doctorsMap[appt.doctorId]}
                role="PATIENT"
                hasPrescription={!!prescriptionsMap[appt.id]}
                onCancel={handleCancelAppointment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
