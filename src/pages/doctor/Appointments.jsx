import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import AppointmentCard from '../../components/AppointmentCard';
import { Calendar, Filter, X, CheckCircle2, AlertCircle } from 'lucide-react';
import PatientService from '../../services/PatientService';
import PrescriptionService from '../../services/PrescriptionService';
import AppointmentService from '../../services/AppointmentService';

export default function DoctorAppointments() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [patientsMap, setPatientsMap] = useState({});
  const [prescriptionsMap, setPrescriptionsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Reject modal state
  const [rejectingAppt, setRejectingAppt] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchDoctorAppointments = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [apptsRes, patientsRes, prescriptionsRes] = await Promise.all([
        AppointmentService.findByDoctortId(user.doctorId),
        PatientService.findAll(),
        PrescriptionService.findAll(),
        // api.get(`/prescriptions?doctorId=${user.id}`),
      ]);

      const appts = apptsRes.data || [];
      const patients = patientsRes.data || [];
      const prescriptions = prescriptionsRes.data || [];

      const pMap = {};
      patients.forEach((p) => {
        pMap[p.patientId] = p;
        pMap[String(p.patientId)] = p;
      });
      setPatientsMap(pMap);

      const prescMap = {};
      prescriptions.forEach((pr) => {
        prescMap[pr.appointmentId] = pr;
      });
      setPrescriptionsMap(prescMap);

      setAppointments(appts);
    } catch (err) {
      console.error('Failed to load appointments:', err);
      setError('Failed to fetch assigned appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorAppointments();
  }, [user]);

  const handleAccept = async (appointment) => {
    try {
      await AppointmentService.updateStatus(appointment.id, 'ACCEPTED');
      fetchDoctorAppointments();
    } catch (err) {
      alert('Failed to accept appointment.');
    }
  };

  const handleOpenRejectModal = (appointment) => {
    setRejectingAppt(appointment);
    setRejectionReason('');
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectingAppt) return;
    try {
      await AppointmentService.updateStatus(rejectingAppt.id, 'REJECTED');
      setRejectingAppt(null);
      fetchDoctorAppointments();
    } catch (err) {
      alert('Failed to reject appointment.');
    }
  };

  const handleAddPrescription = (appointment) => {
    navigate(`/doctor/prescription?appointmentId=${appointment.id}&patientId=${appointment.patientId}`);
  };

  const filtered = appointments.filter((a) => {
    if (statusFilter === 'ALL') return true;
    return a.status === statusFilter;
  });

  if (loading) return <Loading message="Loading your appointments..." />;

  const filterTabs = ['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED', 'REJECTED', 'CANCELLED'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Consultations</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your patient appointments, review requests, and log visit notes
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
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
              ? 'No appointments currently assigned to you.'
              : `No appointments with status "${statusFilter}".`
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              patient={patientsMap[appt.patientId]}
              role="DOCTOR"
              hasPrescription={!!prescriptionsMap[appt.id]}
              onAccept={handleAccept}
              onReject={handleOpenRejectModal}
              onAddPrescription={handleAddPrescription}
              onViewPrescription={handleAddPrescription}
            />
          ))}
        </div>
      )}

      {/* Rejection Note Modal */}
      {rejectingAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-slate-900">Reject Appointment #{rejectingAppt.id}</h3>
              <button
                type="button"
                onClick={() => setRejectingAppt(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Patient: <span className="font-semibold text-slate-800">{patientsMap[rejectingAppt.patientId]?.name}</span>
              <br />
              Requested on: {rejectingAppt.date} at {rejectingAppt.time}
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reason for Rejection (Optional)
                </label>
                <textarea
                  rows="3"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Schedule emergency, out of clinic during requested time slot, etc."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingAppt(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
