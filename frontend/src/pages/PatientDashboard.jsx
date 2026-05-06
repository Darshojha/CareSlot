import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaTrash, FaArrowRotateRight } from 'react-icons/fa6';
import api from '../services/api';
import Loader from '../components/Loader';
import AppointmentCard from '../components/AppointmentCard';
import { useAuth } from '../context/AuthContext';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rescheduleId, setRescheduleId] = useState(null);
  const [reschedule, setReschedule] = useState({ appointmentDate: '', slotTime: '' });

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/appointments/me');
      setAppointments(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const upcoming = useMemo(() => appointments.filter((item) => item.status === 'scheduled'), [appointments]);
  const history = useMemo(() => appointments.filter((item) => item.status !== 'scheduled'), [appointments]);
  const reminders = upcoming.slice(0, 3);

  const cancelAppointment = async (id) => {
    try {
      await api.delete(`/appointments/${id}`);
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cancel failed');
    }
  };

  const saveReschedule = async (id) => {
    try {
      await api.patch(`/appointments/${id}`, reschedule);
      toast.success('Appointment updated');
      setRescheduleId(null);
      setReschedule({ appointmentDate: '', slotTime: '' });
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reschedule failed');
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold text-brand-700">Patient dashboard</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Welcome, {user?.name}</h1>
        <p className="mt-2 text-sm text-slate-600">Manage upcoming visits, appointment history, and reminders.</p>
      </motion.section>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-soft">
          <p className="text-sm text-slate-500">Upcoming appointments</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{upcoming.length}</p>
        </div>
        <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-soft">
          <p className="text-sm text-slate-500">Completed / cancelled</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{history.length}</p>
        </div>
        <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-soft">
          <p className="text-sm text-slate-500">Quick reminder</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Review the next appointment before the slot time and keep the reason note updated.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Upcoming appointments</h2>
          {loading ? (
            <Loader rows={3} />
          ) : upcoming.length ? (
            upcoming.map((appointment) => (
              <AppointmentCard
                key={appointment._id}
                appointment={appointment}
                focus="doctor"
                actions={
                  <>
                    <button
                      onClick={() => {
                        setRescheduleId(appointment._id);
                        setReschedule({ appointmentDate: new Date(appointment.appointmentDate).toISOString().slice(0, 10), slotTime: appointment.slotTime });
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100"
                    >
                      <FaArrowRotateRight />
                      Reschedule
                    </button>
                    <button
                      onClick={() => cancelAppointment(appointment._id)}
                      className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800 transition hover:bg-rose-100"
                    >
                      <FaTrash />
                      Cancel
                    </button>
                  </>
                }
              />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-cyan-200 bg-white p-10 text-center text-slate-500 shadow-soft">
              No upcoming appointments.
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Appointment reminders</h2>
          {reminders.length ? (
            reminders.map((appointment) => (
              <div key={appointment._id} className="rounded-2xl border border-cyan-100 bg-cyan-50 p-5 shadow-soft">
                <p className="text-sm font-semibold text-cyan-800">Scheduled reminder</p>
                <p className="mt-2 text-sm text-slate-700">{appointment.doctorId?.name}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(appointment.appointmentDate))} at {appointment.slotTime}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-cyan-200 bg-white p-10 text-center text-slate-500 shadow-soft">
              No reminders yet.
            </div>
          )}
        </section>
      </div>

      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Appointment history</h2>
        {history.length ? (
          history.map((appointment) => <AppointmentCard key={appointment._id} appointment={appointment} focus="doctor" />)
        ) : (
          <div className="rounded-2xl border border-dashed border-cyan-200 bg-white p-10 text-center text-slate-500 shadow-soft">
            No past appointments yet.
          </div>
        )}
      </section>

      {rescheduleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-hover">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Reschedule appointment</h3>
              <button onClick={() => setRescheduleId(null)} className="text-sm text-slate-500">Close</button>
            </div>
            <div className="mt-4 grid gap-4">
              <input type="date" value={reschedule.appointmentDate} onChange={(e) => setReschedule({ ...reschedule, appointmentDate: e.target.value })} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none" />
              <input value={reschedule.slotTime} onChange={(e) => setReschedule({ ...reschedule, slotTime: e.target.value })} placeholder="10:00 AM" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none" />
              <button onClick={() => saveReschedule(rescheduleId)} className="rounded-full bg-brand-600 px-5 py-3 font-semibold text-white">Update appointment</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default PatientDashboard;
