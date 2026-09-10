import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { Users, Phone, Mail, Calendar, User, Clock, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DoctorPatients() {
  const { user } = useAuth();
  const [relevantPatients, setRelevantPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDoctorPatients() {
      if (!user) return;
      try {
        setLoading(true);
        // 1. Fetch appointments for this doctor only
        const apptsRes = await api.get(`/appointments?doctorId=${user.id}`);
        const doctorAppts = apptsRes.data || [];

        // 2. Extract unique patient IDs (normalized to string for safe comparison)
        const patientIds = Array.from(new Set(doctorAppts.map((a) => String(a.patientId))));

        if (patientIds.length === 0) {
          setRelevantPatients([]);
          setLoading(false);
          return;
        }

        // 3. Fetch all patients and filter only those with appointments with this doctor
        const patientsRes = await api.get('/users?role=PATIENT');
        const allPatients = patientsRes.data || [];

        const filtered = allPatients
          .filter((p) => patientIds.includes(String(p.id)))
          .map((patient) => {
            // Find patient's appointments with this doctor
            const myPatientAppts = doctorAppts
              .filter((a) => String(a.patientId) === String(patient.id))
              .sort((a, b) => (b.date > a.date ? 1 : -1));

            const lastAppointment = myPatientAppts[0];

            // Compute age if DOB is present
            let age = 'N/A';
            if (patient.dateOfBirth) {
              const birthYear = new Date(patient.dateOfBirth).getFullYear();
              const currentYear = new Date().getFullYear();
              age = `${currentYear - birthYear} yrs`;
            }

            return {
              ...patient,
              age,
              lastAppointmentDate: lastAppointment ? `${lastAppointment.date} (${lastAppointment.time})` : 'N/A',
              lastAppointmentStatus: lastAppointment ? lastAppointment.status : 'N/A',
              totalVisits: myPatientAppts.length,
            };
          });

        setRelevantPatients(filtered);
      } catch (err) {
        console.error('Failed to load doctor patients:', err);
        setError('Failed to fetch assigned patient directory.');
      } finally {
        setLoading(false);
      }
    }

    loadDoctorPatients();
  }, [user]);

  if (loading) return <Loading message="Loading your patients..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Patients</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Patients who have consulted or scheduled an appointment with you
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {relevantPatients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No patients assigned yet"
          description="Patients who book appointments with you will appear here automatically."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Patient Name</th>
                  <th className="px-4 py-3">Age</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Last Appointment</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {relevantPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Link
                            to={`/doctor/patients/${p.id}`}
                            className="font-semibold text-slate-900 hover:text-teal-600 transition-colors"
                          >
                            {p.name}
                          </Link>
                          <p className="text-xs text-slate-400">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-700 font-medium">
                      {p.age}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                        {p.gender || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{p.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{p.lastAppointmentDate}</span>
                      </div>
                      <span className="text-[11px] text-teal-600 font-medium mt-0.5 block">
                        {p.totalVisits} {p.totalVisits === 1 ? 'consultation' : 'consultations'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <Link
                        to={`/doctor/patients/${p.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        to={`/doctor/prescription?patientId=${p.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Medical Note</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
