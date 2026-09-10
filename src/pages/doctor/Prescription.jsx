import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import {
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  User,
  Pill,
  ChevronDown
} from 'lucide-react';

export default function DoctorPrescription() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const preselectedApptId = searchParams.get('appointmentId');
  const preselectedPatientId = searchParams.get('patientId');

  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    patientId: preselectedPatientId || '',
    appointmentId: preselectedApptId || '',
    diagnosis: '',
    instructions: '',
    notes: '',
    followUpDate: '',
    medicines: [{ name: '', dosage: '', frequency: '' }],
  });

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [prescRes, apptsRes, patientsRes] = await Promise.all([
        api.get(`/prescriptions?doctorId=${user.id}`),
        api.get(`/appointments?doctorId=${user.id}`),
        api.get('/users?role=PATIENT'),
      ]);

      const myPrescriptions = prescRes.data || [];
      const myAppts = apptsRes.data || [];
      const allPatients = patientsRes.data || [];

      setPrescriptions(myPrescriptions);
      setAppointments(myAppts);
      setPatients(allPatients);

      // If preselected appointment exists in DB
      if (preselectedApptId) {
        const targetAppt = myAppts.find((a) => String(a.id) === String(preselectedApptId));
        if (targetAppt) {
          setFormData((prev) => ({
            ...prev,
            appointmentId: targetAppt.id,
            patientId: targetAppt.patientId,
          }));

          // Check if prescription already exists for this appointment
          const existingPresc = myPrescriptions.find(
            (p) => String(p.appointmentId) === String(targetAppt.id)
          );
          if (existingPresc) {
            setFormData({
              patientId: existingPresc.patientId,
              appointmentId: existingPresc.appointmentId,
              diagnosis: existingPresc.diagnosis || '',
              instructions: existingPresc.instructions || '',
              notes: existingPresc.notes || '',
              followUpDate: existingPresc.followUpDate || '',
              medicines:
                existingPresc.medicines && existingPresc.medicines.length > 0
                  ? existingPresc.medicines
                  : [{ name: '', dosage: '', frequency: '' }],
            });
          }
        }
      }
    } catch (err) {
      console.error('Failed to load prescriptions data:', err);
      setError('Failed to fetch prescriptions and appointment details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Medicine list row operations
  const handleAddMedicineRow = () => {
    setFormData((prev) => ({
      ...prev,
      medicines: [...prev.medicines, { name: '', dosage: '', frequency: '' }],
    }));
  };

  const handleRemoveMedicineRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index),
    }));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...formData.medicines];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, medicines: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.patientId) {
      setError('Please select a patient.');
      return;
    }
    if (!formData.diagnosis.trim()) {
      setError('Please specify a diagnosis or consultation reason.');
      return;
    }

    try {
      setIsSubmitting(true);
      // Clean empty medicine rows
      const validMedicines = formData.medicines.filter((m) => m.name.trim() !== '');

      const payload = {
        doctorId: Number(user.id),
        patientId: Number(formData.patientId),
        appointmentId: formData.appointmentId ? Number(formData.appointmentId) : null,
        diagnosis: formData.diagnosis,
        medicines: validMedicines,
        instructions: formData.instructions,
        notes: formData.notes,
        followUpDate: formData.followUpDate,
      };

      // Check if prescription already exists for this appointment
      const existing = prescriptions.find(
        (p) => String(p.appointmentId) === String(formData.appointmentId)
      );

      if (existing) {
        await api.patch(`/prescriptions/${existing.id}`, payload);
        setSuccessMsg('Prescription and medical notes updated successfully!');
      } else {
        await api.post('/prescriptions', payload);
        setSuccessMsg('New prescription and medical notes saved successfully!');
      }

      // Automatically mark appointment as COMPLETED if it was ACCEPTED
      if (formData.appointmentId) {
        await api.patch(`/appointments/${formData.appointmentId}`, {
          status: 'COMPLETED',
        });
      }

      // Refresh list
      fetchData();
    } catch (err) {
      console.error('Failed to save prescription:', err);
      setError('Failed to save prescription. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loading message="Loading prescription workspace..." />;

  const getPatientName = (patientId) => {
    const p = patients.find((pat) => String(pat.id) === String(patientId));
    return p ? p.name : `Patient #${patientId}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Prescriptions & Medical Notes</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Author post-consultation diagnoses, medication instructions, and clinical follow-up advice
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Prescription Form Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-teal-600" />
          <span>Issue Medical Prescription</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Patient *
              </label>
              <select
                required
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              >
                <option value="">-- Choose Patient --</option>
                {patients.map((pat) => (
                  <option key={pat.id} value={pat.id}>
                    {pat.name} ({pat.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Related Appointment (Optional)
              </label>
              <select
                value={formData.appointmentId}
                onChange={(e) => {
                  const apptId = e.target.value;
                  const appt = appointments.find((a) => String(a.id) === String(apptId));
                  setFormData((prev) => ({
                    ...prev,
                    appointmentId: apptId,
                    patientId: appt ? appt.patientId : prev.patientId,
                  }));
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              >
                <option value="">-- None / General Consultation --</option>
                {appointments.map((a) => (
                  <option key={a.id} value={a.id}>
                    Appt #{a.id} - {a.date} ({a.reason}) [{a.status}]
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Diagnosis / Clinical Impression *
            </label>
            <input
              type="text"
              required
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              placeholder="e.g. Mild Hypertension, Common Cold, Seasonal Rhinitis"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          {/* Medicines Dynamic Table */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-teal-600" />
                <span>Prescribed Medicines</span>
              </label>
              <button
                type="button"
                onClick={handleAddMedicineRow}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-md border border-teal-200 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add Medicine</span>
              </button>
            </div>

            <div className="space-y-2">
              {formData.medicines.map((med, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 items-center"
                >
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      placeholder="Medicine name (e.g. Amoxicillin)"
                      value={med.name}
                      onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="Dosage (e.g. 500mg)"
                      value={med.dosage}
                      onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="Frequency (e.g. 2x a day)"
                      value={med.frequency}
                      onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900"
                    />
                  </div>
                  <div className="sm:col-span-1 text-right">
                    {formData.medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicineRow(index)}
                        title="Remove medicine"
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Intake Instructions
              </label>
              <textarea
                rows="2"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="e.g. Take after food with a glass of water. Avoid alcohol."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Clinical Notes / Advice
              </label>
              <textarea
                rows="2"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Maintain light cardio, log morning blood pressure readings."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>

          <div className="sm:w-1/2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Follow-up Consultation Date
            </label>
            <input
              type="date"
              value={formData.followUpDate}
              onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Prescription & Notes'}
            </button>
          </div>
        </form>
      </div>

      {/* List of Issued Prescriptions */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Recently Issued Prescriptions</h2>

        {prescriptions.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No prescriptions written"
            description="Prescriptions authored by you will be listed here."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prescriptions.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-teal-50 text-teal-700 rounded">
                      Prescription #{p.id}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {p.diagnosis}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Patient</p>
                    <p className="text-sm font-semibold text-slate-900">{getPatientName(p.patientId)}</p>
                  </div>
                </div>

                {/* Medicines List */}
                <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Prescribed Medication:
                  </p>
                  {p.medicines && p.medicines.length > 0 ? (
                    <ul className="space-y-1 text-xs text-slate-700">
                      {p.medicines.map((m, idx) => (
                        <li key={idx} className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800">{m.name}</span>
                          <span className="text-slate-500">
                            {m.dosage} • {m.frequency}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No specific medications listed.</p>
                  )}
                </div>

                {p.instructions && (
                  <p className="text-xs text-slate-600 mt-3">
                    <span className="font-semibold text-slate-900">Instructions: </span>
                    {p.instructions}
                  </p>
                )}

                {p.notes && (
                  <p className="text-xs text-slate-600 mt-1">
                    <span className="font-semibold text-slate-900">Clinical Notes: </span>
                    {p.notes}
                  </p>
                )}

                {p.followUpDate && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-teal-700 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Follow-up recommended:
                    </span>
                    <span className="font-semibold">{p.followUpDate}</span>
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
