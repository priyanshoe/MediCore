import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import AppointmentCard from '../../components/AppointmentCard';
import { Calendar, PlusCircle, Filter } from 'lucide-react';
import AppointmentService from '../../services/AppointmentService';
import DoctorService from '../../services/DoctorService';
import PrescriptionService from '../../services/PrescriptionService';

export default function PatientAppointments() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [doctorsMap, setDoctorsMap] = useState({});
  const [prescriptionsMap, setPrescriptionsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchPatientAppointments = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [apptsRes, doctorsRes, prescRes] = await Promise.all([
        AppointmentService.findByPatientId(user.id),
        DoctorService.findAll(),
        PrescriptionService.findAll()
      ]);

      const appts = apptsRes.data || [];
      const doctors = doctorsRes.data || [];
      const prescriptions = prescRes.data || [];

      const dMap = {};
      doctors.forEach((d) => {
        dMap[d.id] = d;
        dMap[String(d.id)] = d;
      });
      setDoctorsMap(dMap);

      const prMap = {};
      prescriptions.forEach((pr) => {
        prMap[pr.appointmentId] = pr;
        prMap[String(pr.appointmentId)] = pr;
      });
      setPrescriptionsMap(prMap);

      setAppointments(appts);
    } catch (err) {
      console.error('Failed to load appointments:', err);
      setError('Failed to fetch your appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientAppointments();
  }, [user]);

  const handleCancel = async (appointment) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel your appointment with ${doctorsMap[appointment.doctorId]?.name || 'the doctor'
      }?`
    );
    if (!confirmed) return;

    try {
      await AppointmentService.updateStatus(appointment.id, 'CANCELLED')
      fetchPatientAppointments();
    } catch (err) {
      alert('Failed to cancel appointment.');
    }
  };

  const handleViewPrescription = () => {
    navigate('/patient/prescriptions');
  };

  const filtered = appointments.filter((a) => {
    if (statusFilter === 'ALL') return true;
    return a.status === statusFilter;
  });

  if (loading) return <Loading message="Loading your appointments..." />;

  const filterTabs = ['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED', 'REJECTED'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Appointments</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track consultation bookings, scheduled times, and doctor confirmations
          </p>
        </div>

        <Link
          to="/patient/book-appointment"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Appointment</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${statusFilter === tab
              ? 'bg-teal-600 text-white shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No appointments found"
          description={
            statusFilter === 'ALL'
              ? 'You have not scheduled any doctor appointments yet.'
              : `No appointments with status "${statusFilter}".`
          }
          actionLabel={statusFilter === 'ALL' ? 'Book Appointment' : undefined}
          onAction={statusFilter === 'ALL' ? () => navigate('/patient/book-appointment') : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              doctor={doctorsMap[appt.doctorId]}
              role="PATIENT"
              hasPrescription={!!prescriptionsMap[appt.id]}
              onCancel={handleCancel}
              onViewPrescription={handleViewPrescription}
            />
          ))}
        </div>
      )}
    </div>
  );
}
