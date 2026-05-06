import { useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaClipboardCheck, FaArrowLeft } from 'react-icons/fa6';

const AppointmentConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const appointment = useMemo(() => {
    const fromState = location.state?.appointment;
    if (fromState) return fromState;

    try {
      const stored = sessionStorage.getItem('mediconnect:lastConfirmation');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      return null;
    }
  }, [location.state]);

  if (!appointment) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-cyan-100 bg-white p-8 shadow-soft">
          <p className="text-sm font-semibold text-brand-700">Appointment confirmation</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">No recent booking found</h1>
          <p className="mt-3 text-sm text-slate-600">Book an appointment first, then this page will show the confirmation and email draft.</p>
          <div className="mt-6 flex gap-3">
            <button onClick={() => navigate('/')} className="rounded-full bg-brand-600 px-5 py-3 font-semibold text-white">
              Browse doctors
            </button>
            <Link to="/patient-dashboard" className="rounded-full border border-cyan-200 bg-white px-5 py-3 font-semibold text-cyan-800">
              Open dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const emailPreview = appointment.emailPreview || {
    to: appointment.confirmationEmail,
    subject: `MediConnect appointment confirmation`,
    body: 'Your appointment has been confirmed.'
  };

  const mailto = `mailto:${emailPreview.to}?subject=${encodeURIComponent(emailPreview.subject)}&body=${encodeURIComponent(emailPreview.body)}`;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-cyan-100 bg-white p-8 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
            <FaClipboardCheck className="text-xl" />
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-700">Appointment confirmed</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">Your booking is ready</h1>
            <p className="mt-2 text-sm text-slate-600">
              A confirmation email draft is prepared with the appointment details below.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 rounded-2xl bg-cyan-50 p-5 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Doctor</p>
            <p className="mt-1 font-semibold text-slate-900">{appointment.doctorId?.name || 'Doctor'}</p>
            <p className="text-sm text-slate-600">{appointment.doctorId?.specialization || 'Specialist care'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Confirmation email</p>
            <p className="mt-1 font-semibold text-slate-900">{appointment.confirmationEmail}</p>
            <p className="text-sm text-slate-600">A draft email is ready to send from your email client.</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Date</p>
            <p className="mt-1 font-semibold text-slate-900">
              {new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(appointment.appointmentDate))}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Time</p>
            <p className="mt-1 font-semibold text-slate-900">{appointment.slotTime}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-cyan-100 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-900">Email preview</p>
          <pre className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{emailPreview.body}</pre>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a href={mailto} className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700">
            <FaEnvelope />
            Open email draft
          </a>
          <Link to="/patient-dashboard" className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white px-5 py-3 font-semibold text-cyan-800 transition hover:bg-cyan-50">
            View dashboard
          </Link>
          <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-5 py-3 font-semibold text-cyan-800 transition hover:bg-cyan-100">
            <FaArrowLeft />
            Back to doctors
          </button>
        </div>
      </motion.section>
    </main>
  );
};

export default AppointmentConfirmationPage;
