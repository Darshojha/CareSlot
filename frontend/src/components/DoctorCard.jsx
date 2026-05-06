import { motion } from 'framer-motion';
import { FaRegStar, FaStethoscope } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

const DoctorCard = ({ doctor }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-soft transition-shadow hover:shadow-hover"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{doctor.name}</h3>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
            <FaStethoscope className="text-brand-600" />
            {doctor.specialization}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-cyan-50 px-3 py-1 text-sm font-medium text-cyan-700">
          <FaRegStar className="text-amber-500" />
          {doctor.ratings?.toFixed?.(1) || doctor.ratings || 0}
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">{doctor.about}</p>

      <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
        <span className="rounded-full bg-sky-50 px-3 py-1">Experience {doctor.experience} years</span>
        <span className="rounded-full bg-sky-50 px-3 py-1">Fee Rs. {doctor.fee}</span>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm text-slate-500">View slots and book online</p>
        <Link
          to={`/doctors/${doctor._id}`}
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          View profile
        </Link>
      </div>
    </motion.div>
  );
};

export default DoctorCard;
