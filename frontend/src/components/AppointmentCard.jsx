import { motion } from 'framer-motion';
import { FaClock, FaUserDoctor, FaUser } from 'react-icons/fa6';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/date';

const AppointmentCard = ({ appointment, actions = null, focus = 'doctor' }) => {
  const doctor = appointment.doctorId;
  const patient = appointment.patientId;
  const primary = focus === 'patient' ? patient : doctor;
  const secondary = focus === 'patient' ? doctor : patient;

  return (
    <motion.div layout className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-900">
            {focus === 'patient' ? <FaUser className="text-brand-600" /> : <FaUserDoctor className="text-brand-600" />}
            <h3 className="font-semibold">{primary?.name || 'Appointment'}</h3>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {focus === 'patient'
              ? secondary?.specialization || secondary?.email || 'Doctor'
              : secondary?.name || secondary?.email || 'Patient'}
          </p>
        </div>
        <StatusBadge status={appointment.status} />
      </div>

      <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Date</p>
          <p className="mt-1 font-medium text-slate-900">{formatDate(appointment.appointmentDate)}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Slot</p>
          <p className="mt-1 font-medium text-slate-900 flex items-center gap-2"><FaClock />{appointment.slotTime}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Fee</p>
          <p className="mt-1 font-medium text-slate-900">Rs. {doctor?.fee || '-'}</p>
        </div>
      </div>

      {appointment.reason && <p className="mt-4 text-sm text-slate-600">Reason: {appointment.reason}</p>}

      {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
    </motion.div>
  );
};

export default AppointmentCard;
