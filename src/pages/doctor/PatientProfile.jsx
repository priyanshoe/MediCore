import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import Loading from '../../components/Loading';
import { getStatusBadge } from '../../components/AppointmentCard';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  ShieldAlert
} from 'lucide-react';

export default function DoctorPatientProfile() {
  const { patientId, id } = useParams();
  const currentPatientId = patientId || id;
  const { user } = useAuth();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchPatientData = async () => {
    if (!currentPatientId) {
      setError('Patient ID is missing.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // 1. Fetch patient record
      let foundPatient = null;
      try {
        const res = await api.get(`/users/${currentPatientId}`);
        if (res.data && res.data.role === 'PATIENT') {
          foundPatient = res.data;
        }
      } catch (err) {
        // Fallback to searching all patients
      }

      if (!foundPatient) {
        const listRes = await api.get('/users?role=PATIENT');
        const patients = listRes.data || [];
        foundPatient = patients.find((p) => String(p.id) === String(currentPatientId));
      }

      if (!foundPatient) {
        setError('Patient record could not be found.');
        setLoading(false);
        return;
      }

      setPatient(foundPatient);

      // 2. Fetch appointments between this doctor and this patient
      if (user) {
        const apptsRes = await api.get(`/appointments?doctorId=${user.id}`);
        const allAppts = apptsRes.data || [];
        const filtered = allAppts
          .filter((a) => String(a.patientId) === String(currentPatientId))
          .sort((a, b) => (b.date > a.date ? 1 : -1));
        setPatientAppointments(filtered);
      }
    } catch (err) {
      console.error('Failed to load patient profile:', err);
      setError('Failed to fetch patient profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, [currentPatientId, user]);

  const handleAcceptAppointment = async (appointmentId) => {
    try {
      await api.patch(`/appointments/${appointmentId}`, { status: 'ACCEPTED' });
      setActionSuccess('Appointment marked as accepted successfully.');
      setTimeout(() => setActionSuccess(''), 4000);
      fetchPatientData();
    } catch (err) {
      alert('Failed to accept appointment.');
    }
  };

  const handleRejectAppointment = async (appointmentId) => {
    const reason = prompt('Please enter a brief note for rejection:');
    if (reason === null) return;

    try {
      await api.patch(`/appointments/${appointmentId}`, {
        status: 'REJECTED',
        rejectionReason: reason.trim() || 'Unavailable during requested time slot',
      });
      setActionSuccess('Appointment rejected.');
      setTimeout(() => setActionSuccess(''), 4000);
      fetchPatientData();
    } catch (err) {
      alert('Failed to reject appointment.');
    }
  };

  if (loading) {
    return <Loading message="Loading patient profile..." />;
  }

  if (error || !patient) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Link
          to="/doctor/appointments"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Consultations</span>
        </Link>
        <div className="p-6 bg-white rounded-xl border border-rose-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Patient Profile Unavailable</h2>
          <p className="text-sm text-slate-500">{error || 'The requested patient profile does not exist.'}</p>
          <div className="pt-2">
            <Link
              to="/doctor/appointments"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
            >
              Return to Appointments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate age if dateOfBirth is present
  let age = 'Not specified';
  if (patient.dateOfBirth) {
    const birthYear = new Date(patient.dateOfBirth).getFullYear();
    const currentYear = new Date().getFullYear();
    age = `${currentYear - birthYear} years old`;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/doctor/appointments"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Consultations</span>
        </Link>
        <span className="text-xs font-medium text-slate-400">Patient ID #{patient.id}</span>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Patient Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {patient.profileImage ? (
              <img
                src={patient.profileImage}
                alt={patient.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-2xl object-cover border border-slate-200 bg-slate-100 shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-teal-600 text-white font-bold text-2xl flex items-center justify-center shadow-xs shrink-0">
                {patient.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{patient.name}</h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  {patient.status || 'Active'}
                </span>
              </div>
              <p className="text-xs text-slate-500">Registered Patient Record</p>
              <div className="flex items-center gap-3 text-xs text-slate-600 pt-0.5">
                <span>{patient.gender || 'Gender not specified'}</span>
                <span>•</span>
                <span>{age}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/doctor/prescription?patientId=${patient.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Write Medical Note</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Patient Demographic & Contact Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Date of Birth & Age */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            <span>Date of Birth</span>
          </div>
          <p className="text-sm font-bold text-slate-900">{patient.dateOfBirth || 'Not provided'}</p>
          <p className="text-xs text-slate-500">{age}</p>
        </div>

        {/* Gender */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <User className="w-3.5 h-3.5 text-teal-600" />
            <span>Gender</span>
          </div>
          <p className="text-sm font-bold text-slate-900">{patient.gender || 'Not specified'}</p>
          <p className="text-xs text-slate-500">Patient identification</p>
        </div>

        {/* Phone Contact */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Phone className="w-3.5 h-3.5 text-teal-600" />
            <span>Phone Number</span>
          </div>
          <p className="text-sm font-bold text-slate-900 truncate">{patient.phone || 'Not provided'}</p>
          <p className="text-xs text-slate-500">Direct contact</p>
        </div>

        {/* Email Address */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Mail className="w-3.5 h-3.5 text-teal-600" />
            <span>Email Address</span>
          </div>
          <p className="text-sm font-bold text-slate-900 truncate" title={patient.email}>
            {patient.email}
          </p>
          <p className="text-xs text-slate-500">Account login</p>
        </div>
      </div>

      {/* Residential Address */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
          <MapPin className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Residential Address</p>
          <p className="text-sm font-medium text-slate-900">
            {patient.address || 'No residential address recorded.'}
          </p>
        </div>
      </div>

      {/* Appointments With This Doctor */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Consultation History With You</h2>
            <p className="text-xs text-slate-500">
              Past and pending appointments scheduled with your clinic
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
            {patientAppointments.length} {patientAppointments.length === 1 ? 'visit' : 'visits'}
          </span>
        </div>

        {patientAppointments.length === 0 ? (
          <p className="text-xs text-slate-500 py-3 italic">
            No previous consultation records logged with this patient.
          </p>
        ) : (
          <div className="space-y-3">
            {patientAppointments.map((appt) => (
              <div
                key={appt.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium text-slate-500">#{appt.id}</span>
                    <span className="text-xs font-semibold text-slate-900">
                      {appt.date} at {appt.time}
                    </span>
                    {getStatusBadge(appt.status)}
                  </div>
                  <p className="text-xs text-slate-600">
                    <span className="font-medium text-slate-700">Reason: </span>
                    {appt.reason}
                  </p>
                  {appt.rejectionReason && (
                    <p className="text-xs text-rose-600 font-medium">
                      Note: {appt.rejectionReason}
                    </p>
                  )}
                </div>

                {/* Quick actions if pending */}
                {appt.status === 'PENDING' && (
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => handleRejectAppointment(appt.id)}
                      className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAcceptAppointment(appt.id)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-xs"
                    >
                      Accept
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
