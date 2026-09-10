import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import Loading from '../../components/Loading';
import {
  Stethoscope,
  Award,
  DollarSign,
  Clock,
  Phone,
  Mail,
  Calendar,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import DoctorService from '../../services/DoctorService';

export default function PatientDoctorProfile() {
  const { doctorId, id } = useParams();
  const currentDoctorId = doctorId || id;
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const defaultDoctorImage =
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80';

  useEffect(() => {
    async function fetchDoctor() {
      if (!currentDoctorId) {
        setError('No doctor ID provided.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const res = await DoctorService.findById(currentDoctorId);
        if (res.success && res.data) {
          setDoctor(res.data);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Failed to load doctor profile:', err);
        setError('Failed to load doctor profile details.');
      } finally {
        setLoading(false);
      }
    }

    fetchDoctor();
  }, [currentDoctorId]);

  if (loading) {
    return <Loading message="Loading doctor profile..." />;
  }

  if (error || !doctor) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Link
          to="/patient/doctors"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Doctors</span>
        </Link>
        <div className="p-6 bg-white rounded-xl border border-rose-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Profile Unavailable</h2>
          <p className="text-sm text-slate-500">{error || 'The requested doctor could not be found.'}</p>
          <div className="pt-2">
            <Link
              to="/patient/doctors"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
            >
              Browse All Doctors
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          to="/patient/doctors"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Available Doctors</span>
        </Link>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <img
              src={doctor.profileImage || defaultDoctorImage}
              alt={doctor.name}
              referrerPolicy="no-referrer"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-slate-100 bg-slate-100 shadow-xs shrink-0"
              onError={(e) => {
                e.target.src = defaultDoctorImage;
              }}
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/60">
                  <Stethoscope className="w-3 h-3" />
                  {doctor.specialization || 'General Medicine'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Specialist
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {doctor.name}
              </h1>

              <p className="text-sm text-slate-500 font-medium">
                {doctor.qualification || 'MBBS, MD'}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-slate-400" />
                  <span>{doctor.experience ? `${doctor.experience} years experience` : 'Experienced'}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1 font-semibold text-slate-900">
                  <DollarSign className="w-4 h-4 text-teal-600" />
                  <span>${doctor.consultationFee || 50} per visit</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5">
            <Link
              to={`/patient/doctors/${doctor.id}/book`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid of Details & Clinic Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Availability Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
          <div className="flex items-center gap-2 text-teal-700 font-semibold text-xs uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Consultation Hours</span>
          </div>
          <p className="text-base font-bold text-slate-900">
            {doctor.availability || 'Monday - Friday (09:00 - 17:00)'}
          </p>
          <p className="text-xs text-slate-500">
            Appointments can be scheduled during standard practice hours.
          </p>
        </div>

        {/* Consultation Fee Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
          <div className="flex items-center gap-2 text-teal-700 font-semibold text-xs uppercase tracking-wider">
            <DollarSign className="w-4 h-4" />
            <span>Standard Fee</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            ${doctor.consultationFee || 50}
          </p>
          <p className="text-xs text-slate-500">
            Covers comprehensive consultation, diagnostics review, and prescription notes.
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
          <div className="flex items-center gap-2 text-teal-700 font-semibold text-xs uppercase tracking-wider">
            <Phone className="w-4 h-4" />
            <span>Contact & Clinic</span>
          </div>
          <div className="space-y-1 text-xs text-slate-700">
            <p className="flex items-center gap-1.5 truncate">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{doctor.phone || 'Clinic line available upon booking'}</span>
            </p>
            <p className="flex items-center gap-1.5 truncate">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{doctor.email || 'doctor@example.com'}</span>
            </p>
          </div>
          <p className="text-xs text-slate-500 pt-1">
            Status: <span className="font-semibold text-emerald-600">{doctor.status || 'Active'}</span>
          </p>
        </div>
      </div>

      {/* Clinical Overview & Qualifications */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900">Professional Background & Specialty</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          {doctor.name} is a certified specialist in {doctor.specialization || 'General Medicine'} with{' '}
          {doctor.experience ? `${doctor.experience} years` : 'extensive'} of clinical practice experience.
          Holding qualifications in {doctor.qualification || 'MBBS, MD'}, Dr. {doctor.name.replace(/^Dr\.\s*/i, '')} provides dedicated diagnostic evaluations, treatment plans, and continuous patient care.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 text-xs text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Personalized Consultations</p>
              <p className="text-slate-500">Comprehensive review of symptoms and medical history.</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 text-xs text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Digital Prescriptions</p>
              <p className="text-slate-500">Instant access to medical notes, dosages, and follow-up plans.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ready to Book CTA Card */}
      <div className="p-6 bg-teal-50/70 border border-teal-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-teal-950">Ready to consult with {doctor.name}?</h3>
          <p className="text-xs text-teal-700 mt-0.5">
            Select your preferred consultation date and available time slot in just a few clicks.
          </p>
        </div>
        <Link
          to={`/patient/doctors/${doctor.id}/book`}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Calendar className="w-4 h-4" />
          <span>Book Appointment Now</span>
        </Link>
      </div>
    </div>
  );
}
