import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, DollarSign, Award, Stethoscope, ChevronRight } from 'lucide-react';

export default function DoctorCard({ doctor, onBook }) {
  const defaultImage = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      <div className="p-5 flex items-start gap-4">
        <img
          src={doctor.profileImage || defaultImage}
          alt={doctor.name}
          referrerPolicy="no-referrer"
          className="w-18 h-18 rounded-lg object-cover border border-slate-100 shrink-0 bg-slate-100"
          onError={(e) => {
            e.target.src = defaultImage;
          }}
        />
        <div className="min-w-0 flex-1">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 mb-1">
            <Stethoscope className="w-3 h-3" />
            <span>{doctor.specialization || 'General Practitioner'}</span>
          </div>
          <h3 className="text-base font-semibold text-slate-900 truncate">
            {doctor.name}
          </h3>
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {doctor.qualification || 'MBBS'}
          </p>
        </div>
      </div>

      <div className="px-5 py-3 bg-slate-50/70 border-y border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
        <div className="flex items-center gap-1.5 truncate">
          <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{doctor.experience ? `${doctor.experience} yrs exp` : 'Experienced'}</span>
        </div>
        <div className="flex items-center gap-1.5 truncate font-medium text-slate-800">
          <DollarSign className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span>${doctor.consultationFee || 50} fee</span>
        </div>
        <div className="col-span-2 flex items-center gap-1.5 truncate text-slate-500">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{doctor.availability || 'Mon-Fri'}</span>
        </div>
      </div>

      <div className="p-4 mt-auto flex items-center gap-2">
        <Link
          to={`/patient/doctors/${doctor.id}`}
          className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          View Profile
        </Link>
        <Link
          to={`/patient/doctors/${doctor.id}/book`}
          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors shadow-xs"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Book</span>
        </Link>
      </div>
    </div>
  );
}
