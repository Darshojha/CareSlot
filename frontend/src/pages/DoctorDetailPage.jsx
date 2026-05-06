import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaArrowRight, FaCircleCheck } from 'react-icons/fa6';
import api from '../services/api';
import Loader from '../components/Loader';
import { dayLabel, formatDate } from '../utils/date';
import { useAuth } from '../context/AuthContext';

const DoctorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const loadDoctor = async () => {
    setLoading(true);
    try {
      const [doctorRes, slotRes] = await Promise.all([
        api.get(`/doctors/${id}`),
        api.get(`/doctors/${id}/slots`, { params: { date } })
      ]);
      setDoctor(doctorRes.data);
      setSlots(slotRes.data.slots || []);
      setSelectedSlot(slotRes.data.slots?.[0] || '');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load doctor profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (user?.email) {
      setConfirmationEmail((current) => current || user.email);
    }
  }, [user?.email]);

  useEffect(() => {
    const loadSlots = async () => {
      try {
        const { data } = await api.get(`/doctors/${id}/slots`, { params: { date } });
        setSlots(data.slots || []);
        setSelectedSlot(data.slots?.[0] || '');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load slots');
      }
    };

    if (id) loadSlots();
  }, [date, id]);

  const groupedAvailability = useMemo(() => {
    if (!doctor) return [];
    return doctor.availability || [];
  }, [doctor]);

  const bookAppointment = async () => {
    if (!user) {
      toast.info('Please login as a patient to book appointments');
      return;
    }

    if (!selectedSlot) {
      toast.error('Please select a slot');
      return;
    }

    if (!confirmationEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(confirmationEmail)) {
      toast.error('Please enter a valid confirmation email');
      return;
    }

    setBooking(true);
    try {
      const { data } = await api.post('/appointments', {
        doctorId: doctor._id,
        appointmentDate: date,
        slotTime: selectedSlot,
        reason,
        confirmationEmail
      });
      toast.success('Appointment booked successfully');
      sessionStorage.setItem('mediconnect:lastConfirmation', JSON.stringify(data));
      navigate('/appointments/confirmation', { state: { appointment: data } });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><Loader rows={2} /></main>;
  if (!doctor) return null;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-soft">
          <p className="text-sm font-semibold text-brand-700">Doctor profile</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{doctor.name}</h1>
          <p className="mt-2 text-base text-slate-600">{doctor.specialization}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-cyan-50 p-4">
              <p className="text-xs uppercase text-slate-500">Experience</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{doctor.experience} years</p>
            </div>
            <div className="rounded-2xl bg-cyan-50 p-4">
              <p className="text-xs uppercase text-slate-500">Consultation fee</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">Rs. {doctor.fee}</p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-7 text-slate-600">{doctor.about}</p>

          <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold text-slate-900">Weekly availability</h2>
            <div className="mt-3 grid gap-3">
              {groupedAvailability.length ? (
                groupedAvailability.map((item) => (
                  <div key={item.dayOfWeek} className="flex flex-wrap items-center gap-2 rounded-xl bg-white p-3">
                    <span className="w-16 text-sm font-medium text-slate-700">{dayLabel(item.dayOfWeek)}</span>
                    <div className="flex flex-wrap gap-2">
                      {item.slots.map((slot) => (
                        <span key={slot} className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
                          {slot}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No availability configured yet.</p>
              )}
            </div>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-900">Book appointment</h2>
          <p className="mt-1 text-sm text-slate-500">Choose a date and one of the open slots below.</p>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Appointment date</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-brand-300" />
            </label>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Available slots</span>
                <span className="text-xs text-slate-500">{formatDate(date)}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {slots.length ? (
                  slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        selectedSlot === slot ? 'bg-brand-600 text-white shadow-soft' : 'bg-cyan-50 text-cyan-800 hover:bg-cyan-100'
                      }`}
                    >
                      {slot}
                    </button>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">No open slots for this date.</div>
                )}
              </div>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Reason for visit</span>
              <textarea
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Brief note about the consultation"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-brand-300"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Confirmation email</span>
              <input
                type="email"
                value={confirmationEmail}
                onChange={(e) => setConfirmationEmail(e.target.value)}
                placeholder="patient@example.com"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-brand-300"
              />
            </label>

            <button
              onClick={bookAppointment}
              disabled={booking}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {booking ? 'Booking...' : 'Book appointment'}
              <FaArrowRight />
            </button>

            {user?.role !== 'patient' && (
              <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
                Login as a patient to complete booking. Doctors can view and manage appointments from their dashboard.
              </div>
            )}
            {user && user.role === 'patient' && (
              <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800 flex items-center gap-2">
                <FaCircleCheck />
                Appointment booking is available for signed-in patients.
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </main>
  );
};

export default DoctorDetailPage;
