import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaCheck, FaXmark } from 'react-icons/fa6';
import api from '../services/api';
import Loader from '../components/Loader';
import AppointmentCard from '../components/AppointmentCard';
import AvailabilityEditor from '../components/AvailabilityEditor';
import { useAuth } from '../context/AuthContext';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availability, setAvailability] = useState([]);

  const doctorId = user?.doctorId;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appointmentsRes, doctorRes] = await Promise.all([
        api.get('/appointments/me'),
        doctorId ? api.get(`/doctors/${doctorId}`) : Promise.resolve({ data: null })
      ]);
      setAppointments(appointmentsRes.data);
      setDoctor(doctorRes.data);
      setAvailability(doctorRes.data?.availability || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const booked = useMemo(() => appointments.filter((item) => item.status === 'scheduled'), [appointments]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}`, { status });
      toast.success(`Appointment marked as ${status}`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Status update failed');
    }
  };

  const saveAvailability = async () => {
    if (!doctorId) return;
    setSaving(true);
    try {
      await api.patch(`/doctors/${doctorId}/slots`, { availability });
      toast.success('Availability updated');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Availability update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold text-brand-700">Doctor dashboard</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Welcome, {user?.name}</h1>
        <p className="mt-2 text-sm text-slate-600">Track patient bookings, update status, and manage availability slots.</p>
      </motion.section>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-soft">
          <p className="text-sm text-slate-500">Booked appointments</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{booked.length}</p>
        </div>
        <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-soft">
          <p className="text-sm text-slate-500">Availability days</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{availability.length}</p>
        </div>
        <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-soft">
          <p className="text-sm text-slate-500">Profile</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{doctor?.specialization}</p>
          <p className="text-sm text-slate-500">Rs. {doctor?.fee} consultation</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6">
        {loading ? (
          <Loader rows={2} />
        ) : (
          <>
            <AvailabilityEditor availability={availability} setAvailability={setAvailability} onSave={saveAvailability} saving={saving} />

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">Booked appointments</h2>
              {appointments.length ? (
                appointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment._id}
                    appointment={appointment}
                    focus="patient"
                    actions={
                      appointment.status === 'scheduled' ? (
                        <>
                          <button
                            onClick={() => updateStatus(appointment._id, 'completed')}
                            className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
                          >
                            <FaCheck />
                            Completed
                          </button>
                          <button
                            onClick={() => updateStatus(appointment._id, 'cancelled')}
                            className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800 transition hover:bg-rose-100"
                          >
                            <FaXmark />
                            Cancel
                          </button>
                        </>
                      ) : null
                    }
                  />
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-cyan-200 bg-white p-10 text-center text-slate-500 shadow-soft">
                  No appointments booked yet.
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
};

export default DoctorDashboard;
