import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import DoctorCard from '../../components/DoctorCard';
import { Stethoscope, Search, Filter } from 'lucide-react';
import DoctorService from '../../services/DoctorService';

export default function PatientDoctors() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('ALL');

  useEffect(() => {
    async function loadDoctors() {
      try {
        setLoading(true);
        const res = await DoctorService.findAll();
        setDoctors(res.data || []);
      } catch (err) {
        console.error('Failed to load doctors:', err);
        setError('Failed to fetch available doctors directory.');
      } finally {
        setLoading(false);
      }
    }

    loadDoctors();
  }, []);

  const specializations = [
    'ALL',
    'Cardiology',
    'Pediatrics',
    'Neurology',
    'Dermatology',
    'Orthopedics',
    'General Medicine',
  ];

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      (doc.name && doc.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.specialization && doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSpec =
      selectedSpecialization === 'ALL' ||
      (doc.specialization &&
        doc.specialization.toLowerCase() === selectedSpecialization.toLowerCase());

    return matchesSearch && matchesSpec;
  });

  const handleBook = (doctor) => {
    navigate(`/patient/book-appointment?doctorId=${doctor.id}`);
  };

  if (loading) return <Loading message="Loading available doctors..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Available Doctors</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Find certified specialists and schedule your consultation visit
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Controls: Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search doctor or specialty..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 shadow-2xs"
          />
        </div>

        {/* Specialization Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {specializations.map((spec) => (
            <button
              key={spec}
              type="button"
              onClick={() => setSelectedSpecialization(spec)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${selectedSpecialization === spec
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors Grid */}
      {filteredDoctors.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="No doctors found"
          description={
            searchTerm || selectedSpecialization !== 'ALL'
              ? 'No doctors match the selected search criteria.'
              : 'No doctors are currently available in the clinic.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDoctors.map((doc) => (
            <DoctorCard key={doc.id} doctor={doc} onBook={handleBook} />
          ))}
        </div>
      )}
    </div>
  );
}
