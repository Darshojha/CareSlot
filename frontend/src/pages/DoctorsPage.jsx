import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../services/api';
import DoctorFilters from '../components/DoctorFilters';
import DoctorCard from '../components/DoctorCard';
import Loader from '../components/Loader';

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ search: '', specialization: '', availableDate: '' });

  const fetchDoctors = async (currentFilters = filters) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/doctors', { params: currentFilters });
      setDoctors(data);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load doctors';
      setError(message);
      setDoctors([]);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = (updates) => {
    if (updates.reset) {
      const next = { search: '', specialization: '', availableDate: '' };
      setFilters(next);
      fetchDoctors(next);
      return;
    }

    const next = { ...filters, ...updates };
    setFilters(next);
    fetchDoctors(next);
  };

  const specialtySummary = useMemo(() => {
    const counts = doctors.reduce((acc, doctor) => {
      acc[doctor.specialization] = (acc[doctor.specialization] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).slice(0, 4);
  }, [doctors]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">MediConnect</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">Find doctors, check availability, and book appointments online.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Search verified doctors, view open slots, and manage patient appointments without phone calls or manual follow-ups.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {specialtySummary.map(([label, count]) => (
              <span key={label} className="rounded-full bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-800">
                {label}: {count}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-slate-900">How it works</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <li>1. Search a specialty or doctor name.</li>
            <li>2. Check a date to see available slots.</li>
            <li>3. Book, reschedule, cancel, or update appointment status from dashboards.</li>
          </ul>
        </div>
      </motion.section>

      <div className="mt-6">
        <DoctorFilters {...filters} onChange={applyFilters} />
      </div>

      <section className="mt-6">
        {loading ? (
          <Loader rows={4} />
        ) : error ? (
          <div className="rounded-2xl border border-rose-100 bg-white p-10 text-center shadow-soft">
            <p className="text-lg font-semibold text-slate-900">Could not load doctors</p>
            <p className="mt-2 text-sm text-slate-600">{error}</p>
            <button onClick={() => fetchDoctors(filters)} className="mt-5 rounded-full bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700">
              Retry
            </button>
          </div>
        ) : doctors.length ? (
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor._id} doctor={doctor} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-cyan-200 bg-white p-10 text-center text-slate-500 shadow-soft">
            No doctors found for the selected filters.
          </div>
        )}
      </section>
    </main>
  );
};

export default DoctorsPage;
