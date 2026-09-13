import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { Users, Mail, Phone, Calendar, MapPin, User, Search } from 'lucide-react';
import PatientService from '../../services/PatientService';
import AppointmentService from '../../services/AppointmentService';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [patientsRes, apptsRes] = await Promise.all([
          PatientService.findAll(),
          AppointmentService.findAll(),
        ]);
        setPatients(patientsRes.data || []);
        setAppointments(apptsRes.data || []);
      } catch (err) {
        console.error('Failed to load patients:', err);
        setError('Failed to fetch patient directory.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredPatients = patients.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.phone && p.phone.toLowerCase().includes(q))
    );
  });

  if (loading) return <Loading message="Loading patient records..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Directory</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Registered patient records, demographics, and visit counts
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patients..."
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 shadow-2xs"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {filteredPatients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No patients found"
          description={search ? 'No patient matched your search query.' : 'No registered patients found.'}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Patient Name</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Date of Birth & Age</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3 text-right">Appointments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPatients.map((patient) => {
                  const patientAppts = appointments.filter((a) => a.patientId === patient.patientId);
                  // Calculate rough age if DOB exists
                  let age = null;
                  if (patient.dateOfBirth) {
                    const birthYear = new Date(patient.dateOfBirth).getFullYear();
                    const currentYear = new Date().getFullYear();
                    age = currentYear - birthYear;
                  }

                  return (
                    <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs shrink-0">
                            {patient.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{patient.name}</p>
                            <p className="text-xs text-slate-400 font-mono">ID #{patient.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        {/* <div className="flex items-center gap-1.5 text-slate-700">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{patient.email}</span>
                        </div> */}
                        <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{patient.phone || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{patient.dateOfBirth || 'Not provided'}</span>
                        </div>
                        {age && <p className="text-slate-400 mt-0.5">{age} years old</p>}
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                          {patient.gender || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600 max-w-xs truncate">
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{patient.address || 'Not specified'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700">
                          {patientAppts.length} {patientAppts.length === 1 ? 'visit' : 'visits'}
                        </span>
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
