import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import {
  PlusCircle,
  Edit2,
  Trash2,
  Stethoscope,
  Phone,
  Mail,
  Award,
  DollarSign,
  AlertTriangle,
  X
} from 'lucide-react';
import DoctorService from '../../services/DoctorService';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await DoctorService.findAll();
      setDoctors(res.data || []);
    } catch (err) {
      console.error('Failed to load doctors:', err);
      setError('Failed to load doctors list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleDeleteDoctor = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await DoctorService.deleteDoctor(deleteTarget.id)
      setDoctors((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete doctor:', err?.message);
      alert('Failed to delete doctor record. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <Loading message="Loading doctors directory..." />;

  const defaultDoctorImage = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80";

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Doctors</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Directory of all registered medical specialists
          </p>
        </div>
        <Link
          to="/admin/doctors/create"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Doctor</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {doctors.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="No doctors registered"
          description="Get started by adding the first medical specialist to the clinic."
          actionLabel="Add Doctor"
          onAction={() => (window.location.href = '/admin/doctors/create')}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Doctor</th>
                  <th className="px-4 py-3">Specialization & Qual.</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Fee & Exp.</th>
                  <th className="px-4 py-3">Availability</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {doctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={doc.profileImage || defaultDoctorImage}
                          alt={doc.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 bg-slate-100 shrink-0"
                          onError={(e) => {
                            e.target.src = defaultDoctorImage;
                          }}
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{doc.name}</p>
                          <p className="text-xs text-slate-400 font-mono">ID #{doc.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-teal-50 text-teal-700">
                        {doc.specialization || 'General'}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{doc.qualification || 'MBBS'}</p>
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      {/* <div className="flex items-center gap-1.5 text-slate-700">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{doc.email}</span>
                      </div> */}
                      <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{doc.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-teal-600" />
                        <span>${doc.consultationFee || 50}</span>
                      </div>
                      <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                        <Award className="w-3.5 h-3.5 text-slate-400" />
                        <span>{doc.experience || 0} years</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">
                      {doc.availability || 'Mon-Fri'}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          to={`/admin/doctors/edit/${doc.id}`}
                          title="Edit Doctor"
                          className="p-1.5 text-slate-600 hover:text-teal-600 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(doc)}
                          title="Delete Doctor"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Confirm Doctor Deletion</h3>
            <p className="text-sm text-slate-600 mb-5">
              Are you sure you want to remove <span className="font-semibold text-slate-900">{deleteTarget.name}</span> from the system? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteDoctor}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Doctor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
