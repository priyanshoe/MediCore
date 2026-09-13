import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, Stethoscope, AlertCircle, CheckCircle2, XCircle, Ban, FileText, Eye } from 'lucide-react';

export function getStatusBadge(status) {
  switch (status) {
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
          <AlertCircle className="w-3 h-3 text-amber-600" />
          Pending
        </span>
      );
    case 'ACCEPTED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Accepted
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
          <XCircle className="w-3 h-3 text-rose-600" />
          Rejected
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          <Ban className="w-3 h-3 text-slate-500" />
          Cancelled
        </span>
      );
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/60">
          <CheckCircle2 className="w-3 h-3 text-teal-600" />
          Completed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          {status}
        </span>
      );
  }
}

export default function AppointmentCard({
  appointment,
  doctor,
  patient,
  role,
  onAccept,
  onReject,
  onCancel,
  onAddPrescription,
  onViewPrescription,
  hasPrescription,
}) {
  const canCancel = appointment.status === 'PENDING' || appointment.status === 'ACCEPTED';
  const isDoctor = role === 'DOCTOR';
  const isPatient = role === 'PATIENT';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 hover:border-slate-300 transition-colors">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
            #{appointment.id}
          </span>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              {appointment.date}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              {appointment.time}
            </span>
          </div>
        </div>
        <div>{getStatusBadge(appointment.status)}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2 border-t border-slate-100 text-sm">
        {/* Patient view: Doctor details */}
        {isPatient && doctor && (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 font-semibold shrink-0">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Doctor</p>
              <p className="font-medium text-slate-900 truncate">{doctor.name}</p>
              <p className="text-xs text-teal-600 truncate">{doctor.specialization}</p>
            </div>
          </div>
        )}

        {/* Doctor view: Patient details */}
        {isDoctor && (
          <div className="flex items-center justify-between gap-7">
            <div className="flex items-center gap-2.5 min-w-fit">
              <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 font-semibold shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-400">Patient</p>
                <Link
                  to={`/doctor/patients/${appointment.patientId}`}
                  className="font-semibold text-slate-900 hover:text-teal-600 transition-colors truncate block"
                  title="Click to view patient profile"
                >
                  {patient?.name || `Patient #${appointment.patientId}`}
                </Link>
                <p className="text-xs text-slate-500 truncate">{patient?.phone || patient?.email || 'No contact specified'}</p>
              </div>
            </div>
            <Link
              to={`/doctor/patients/${appointment.patientId}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors shrink-0"
              title="Inspect patient profile before deciding"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Patient</span>
            </Link>
          </div>
        )}

        {/* Admin view: shows both */}
        {role === 'ADMIN' && (
          <>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-500">Patient:</span>
              <span className="font-medium text-slate-800 truncate">{patient?.name || `ID #${appointment.patientId}`}</span>
            </div>
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span className="text-xs text-slate-500">Doctor:</span>
              <span className="font-medium text-slate-800 truncate">{doctor?.name || `ID #${appointment.doctorId}`}</span>
            </div>
          </>
        )}
      </div>

      <div className="mt-3 p-3 bg-slate-50 rounded-lg text-xs text-slate-700">
        <span className="font-semibold text-slate-900">Reason: </span>
        <span>{appointment.reason || 'Regular checkup'}</span>
        {appointment.rejectionReason && (
          <div className="mt-1 pt-1 border-t border-slate-200 text-rose-600">
            <span className="font-semibold">Rejection Note: </span>
            {appointment.rejectionReason}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
        {/* Doctor controls: Accept / Reject */}
        {isDoctor && appointment.status === 'PENDING' && (
          <>
            <Link
              to={`/doctor/patients/${appointment.patientId}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>View Patient</span>
            </Link>
            <button
              type="button"
              onClick={() => onReject && onReject(appointment)}
              className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={() => onAccept && onAccept(appointment)}
              className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-xs"
            >
              Accept Appointment
            </button>
          </>
        )}

        {/* Doctor prescription trigger: when accepted or completed */}
        {isDoctor && (appointment.status === 'ACCEPTED' || appointment.status === 'COMPLETED') && (
          <button
            type="button"
            onClick={() => onAddPrescription && onAddPrescription(appointment)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            {hasPrescription ? 'Update Prescription' : 'Write Prescription'}
          </button>
        )}

        {/* Patient cancel button */}
        {isPatient && canCancel && (
          <button
            type="button"
            onClick={() => onCancel && onCancel(appointment)}
            className="px-3 py-1.5 text-xs font-medium text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors"
          >
            Cancel Appointment
          </button>
        )}

        {/* View prescription button */}
        {onViewPrescription && hasPrescription && (
          <button
            type="button"
            onClick={() => onViewPrescription(appointment)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-teal-600" />
            View Prescription
          </button>
        )}
      </div>
    </div>
  );
}
