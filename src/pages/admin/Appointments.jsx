import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { getStatusBadge } from '../../components/AppointmentCard';
import { Calendar, Filter, User, Stethoscope, Clock, FileText } from 'lucide-react';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    async function fetchAppointments() {
      try {
        setLoading(true);
        const [apptsRes, usersRes] = await Promise.all([
          api.get('/appointments'),
          api.get('/users'),
        ]);

        const appts = apptsRes.data || [];
        const users = usersRes.data || [];

        const uMap = {};
        users.forEach((u) => {
          uMap[u.id] = u;
        });
        setUsersMap(uMap);
        setAppointments(appts);
      } catch (err) {
        console.error('Failed to load appointments:', err);
        setError('Failed to fetch appointment logs.');
      } finally {
        setLoading(false);
      }
    }
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter((a) => {
    if (filterStatus === 'ALL') return true;
    return a.status === filterStatus;
  });

  if (loading) return <Loading message="Loading system appointments..." />;

  const statuses = ['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED', 'REJECTED', 'CANCELLED'];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Appointments</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Complete log of bookings across all clinics and departments
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {statuses.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterStatus === st
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {filteredAppointments.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No appointments found"
          description={
            filterStatus === 'ALL'
              ? 'No appointments currently booked in the system.'
              : `No appointments with status "${filterStatus}" found.`
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Doctor & Specialization</th>
                  <th className="px-4 py-3">Schedule Date & Time</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredAppointments.map((appt) => {
                  const patient = usersMap[appt.patientId];
                  const doctor = usersMap[appt.doctorId];

                  return (
                    <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs font-semibold text-slate-500">
                        #{appt.id}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-900">
                            {patient?.name || `Patient #${appt.patientId}`}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 pl-5.5">{patient?.phone || patient?.email}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                          <span className="font-medium text-slate-800">
                            {doctor?.name || `Doctor #${appt.doctorId}`}
                          </span>
                        </div>
                        <p className="text-[11px] text-teal-600 pl-5.5">
                          {doctor?.specialization || 'Medical Specialist'}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        <div className="font-medium text-slate-800">{appt.date}</div>
                        <div className="text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{appt.time}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600 max-w-xs truncate">
                        {appt.reason || 'General checkup'}
                        {appt.rejectionReason && (
                          <span className="block text-rose-500 text-[11px] truncate">
                            Note: {appt.rejectionReason}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-400">
                        {appt.createdAt || 'N/A'}
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
        </div>
      )}
    </div>
  );
}
