import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { FileText, Stethoscope, Calendar, Pill, Clock, AlertCircle } from 'lucide-react';

export default function PatientPrescriptions() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [doctorsMap, setDoctorsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPrescriptions() {
      if (!user) return;
      try {
        setLoading(true);
        const [prescRes, doctorsRes] = await Promise.all([
          api.get(`/prescriptions?patientId=${user.id}`),
          api.get('/users?role=DOCTOR'),
        ]);

        const prescList = prescRes.data || [];
        const docList = doctorsRes.data || [];

        const dMap = {};
        docList.forEach((d) => {
          dMap[d.id] = d;
        });
        setDoctorsMap(dMap);

        setPrescriptions(prescList);
      } catch (err) {
        console.error('Failed to load prescriptions:', err);
        setError('Failed to fetch your medical prescriptions.');
      } finally {
        setLoading(false);
      }
    }

    loadPrescriptions();
  }, [user]);

  if (loading) return <Loading message="Loading your prescriptions..." />;

  const defaultDoctorImage = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Prescriptions</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Medical notes, recommended medications, and intake instructions from your doctors
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {prescriptions.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No prescriptions yet"
          description="Prescriptions authored by your doctors after appointments will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {prescriptions.map((p) => {
            const doctor = doctorsMap[p.doctorId];

            return (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  {/* Doctor Info Header */}
                  <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <img
                        src={doctor?.profileImage || defaultDoctorImage}
                        alt={doctor?.name || 'Doctor'}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-lg object-cover border border-slate-200 bg-slate-100 shrink-0"
                        onError={(e) => {
                          e.target.src = defaultDoctorImage;
                        }}
                      />
                      <div>
                        <h3 className="font-bold text-slate-900">
                          {doctor?.name || `Dr. Specialist #${p.doctorId}`}
                        </h3>
                        <p className="text-xs text-teal-600 font-medium">
                          {doctor?.specialization || 'Medical Specialist'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      Rx #{p.id}
                    </span>
                  </div>

                  {/* Diagnosis */}
                  <div className="mt-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                      Diagnosis / Condition
                    </span>
                    <p className="text-sm font-bold text-slate-900 bg-teal-50/50 p-2.5 rounded-lg border border-teal-100">
                      {p.diagnosis}
                    </p>
                  </div>

                  {/* Medicines */}
                  <div className="mt-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-2">
                      <Pill className="w-3.5 h-3.5 text-teal-600" />
                      Prescribed Medications
                    </span>

                    {p.medicines && p.medicines.length > 0 ? (
                      <div className="bg-slate-50 rounded-lg border border-slate-200 divide-y divide-slate-200/60 overflow-hidden text-xs">
                        {p.medicines.map((med, idx) => (
                          <div key={idx} className="p-2.5 flex items-center justify-between">
                            <div>
                              <span className="font-bold text-slate-800">{med.name}</span>
                              <span className="text-slate-500 text-[11px] ml-2">({med.dosage})</span>
                            </div>
                            <span className="font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                              {med.frequency}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No specific medications prescribed.</p>
                    )}
                  </div>

                  {/* Instructions & Notes */}
                  {p.instructions && (
                    <div className="mt-4 text-xs text-slate-700">
                      <span className="font-semibold text-slate-900 block mb-0.5">
                        Instructions:
                      </span>
                      <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-600">
                        {p.instructions}
                      </p>
                    </div>
                  )}

                  {p.notes && (
                    <div className="mt-3 text-xs text-slate-700">
                      <span className="font-semibold text-slate-900 block mb-0.5">
                        Doctor's Advice / Notes:
                      </span>
                      <p className="text-slate-600">{p.notes}</p>
                    </div>
                  )}
                </div>

                {/* Follow up date */}
                {p.followUpDate && (
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-teal-800">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-4 h-4 text-teal-600" />
                      Next Follow-up Consultation:
                    </span>
                    <span className="font-bold">{p.followUpDate}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
