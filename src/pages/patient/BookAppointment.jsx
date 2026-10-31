import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/Loading';
import {
  Calendar,
  Clock,
  Stethoscope,
  ArrowLeft,
  DollarSign,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import DoctorService from '../../services/DoctorService';
import AppointmentService from '../../services/AppointmentService';

export default function BookAppointment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { doctorId: routeDoctorId, id: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const preselectedDoctorId = routeDoctorId || routeId || searchParams.get('doctorId');

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevent selecting past dates
  const todayDateStr = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toISOString().split('T')[1].split(".")[0];
  


  // Form State
  const [formData, setFormData] = useState({
    userId: preselectedDoctorId || '',
    date: todayDateStr,
    time: '10:30',
    reason: '',
  });

  const timeSlots = [    
  { label: '09:00 AM', value: '09:00' },
  { label: '09:45 AM', value: '09:45' },
  { label: '10:30 AM', value: '10:30' },
  { label: '11:15 AM', value: '11:15' },
  { label: '02:00 PM', value: '14:00' },
  { label: '02:45 PM', value: '14:45' },
  { label: '03:30 PM', value: '15:30' },
  { label: '04:15 PM', value: '16:15' },
  { label: '05:00 PM', value: '17:00' },
  { label: '05:15 PM', value: '17:15' },
  { label: '05:30 PM', value: '17:30' },
  { label: '05:45 PM', value: '17:45' },
  { label: '06:00 PM', value: '18:00' },
  { label: '06:15 PM', value: '18:15' },
  { label: '06:30 PM', value: '18:30' },
  { label: '06:45 PM', value: '18:45' },
  { label: '07:00 PM', value: '19:00' },
  { label: '07:15 PM', value: '19:15' },
  { label: '07:30 PM', value: '19:30' },
  { label: '07:45 PM', value: '19:45' },
  { label: '08:00 PM', value: '20:00' },
  { label: '08:15 PM', value: '20:15' },
  { label: '08:30 PM', value: '20:30' },
  { label: '08:45 PM', value: '20:45' },
  ];

  useEffect(() => {
    async function loadDoctors() {
      try {
        setLoading(true);
        const res = await DoctorService.findAll();
        const docs = res.data || [];
        setDoctors(docs);

        if (preselectedDoctorId) {
          const matched = docs.find((d) => String(d.userId) === String(preselectedDoctorId));
          if (matched) {
            setSelectedDoctor(matched);
            setFormData((prev) => ({ ...prev, userId: matched.userId }));
          }
        }
      } catch (err) {
        console.error('Failed to load doctors list:', err);
        setError('Failed to fetch medical staff for booking.');
      } finally {
        setLoading(false);
      }
    }

    loadDoctors();
  }, [preselectedDoctorId]);

  const handleDoctorChange = (userId) => {
    const doc = doctors.find((d) => String(d.userId) === String(userId));
    setSelectedDoctor(doc || null);
    setFormData((prev) => ({ ...prev, userId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.userId) {
      setError('Please select a doctor for your appointment.');
      return;
    }
    if (!formData.date) {
      setError('Please select an appointment date.');
      return;
    }
    if (!formData.reason.trim()) {
      setError('Please provide a brief reason for your consultation.');
      return;
    }

    try {
      setIsSubmitting(true);
      const appointmentPayload = {
        doctorId: !isNaN(Number(formData.userId)) ? Number(formData.userId) : formData.userId,
        date: formData.date,
        time: formData.time,
        reason: formData.reason.trim(),
      };

      await AppointmentService.save(appointmentPayload);
      navigate('/patient/appointments');
    } catch (err) {
      console.error('Failed to book appointment:', err);
      setError( err.error || 'Failed to submit appointment request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loading message="Loading booking form..." />;

  const defaultDoctorImage = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          to="/patient/doctors"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Doctors</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Book an Appointment</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Select a specialist, choose a convenient date and time, and describe your symptoms
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
        {/* Doctor Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Select Medical Specialist *
          </label>
          <select
            required
            value={formData.userId}
            onChange={(e) => handleDoctorChange(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
          >
            <option value="">-- Choose a Doctor --</option>
            {doctors.map((doc) => (
              <option key={doc.userId} value={doc.userId}>
                {doc.name} — {doc.specialization} (${doc.consultationFee || 50})
              </option>
            ))}
          </select>
        </div>

        {/* Doctor Preview Highlight Card */}
        {selectedDoctor && (
          <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={selectedDoctor.profileImage || defaultDoctorImage}
                alt={selectedDoctor.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-lg object-cover border border-teal-200 bg-white shrink-0"
                onError={(e) => {
                  e.target.src = defaultDoctorImage;
                }}
              />
              <div>
                <p className="text-sm font-bold text-teal-950">{selectedDoctor.name}</p>
                <p className="text-xs text-teal-700 font-medium">{selectedDoctor.specialization}</p>
                <p className="text-[11px] text-teal-600 mt-0.5">{selectedDoctor.availability || 'Mon-Fri'}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[11px] uppercase tracking-wider text-teal-700 block">Consultation Fee</span>
              <span className="text-base font-bold text-teal-900">${selectedDoctor.consultationFee || 50}</span>
            </div>
          </div>
        )}

        {/* Date and Time Slot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Appointment Date *
            </label>
            <div className="relative">
              <input
                type="date"
                required
                min={todayDateStr}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Preferred Time Slot *
            </label>
            <select
              required
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            >
              {timeSlots.map((slot) => (
                // slot.value > currentTime &&
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reason for Appointment */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Reason for Consultation *
          </label>
          <textarea
            required
            rows="3"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="Describe your current symptoms, health concerns, or checkup needs..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
          />
        </div>

        {/* Action buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link
            to="/patient/appointments"
            className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Requesting...' : 'Confirm Appointment Request'}
          </button>
        </div>
      </form>
    </div>
  );
}
