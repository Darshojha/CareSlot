import { FaMagnifyingGlass } from 'react-icons/fa6';

const specializations = ['All', 'Cardiology', 'Dermatology', 'Pediatrics', 'Orthopedics', 'Neurology', 'General Medicine'];

const DoctorFilters = ({ search, specialization, availableDate, onChange }) => {
  return (
    <div className="grid gap-3 rounded-2xl border border-cyan-100 bg-white p-4 shadow-soft md:grid-cols-4">
      <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
        <FaMagnifyingGlass className="text-slate-400" />
        <input
          value={search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Search doctors"
          className="w-full bg-transparent text-sm outline-none"
        />
      </label>

      <select
        value={specialization}
        onChange={(e) => onChange({ specialization: e.target.value })}
        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none"
      >
        {specializations.map((item) => (
          <option key={item} value={item === 'All' ? '' : item}>
            {item}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={availableDate}
        onChange={(e) => onChange({ availableDate: e.target.value })}
        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none"
      />

      <button
        type="button"
        onClick={() => onChange({ reset: true })}
        className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
      >
        Reset filters
      </button>
    </div>
  );
};

export default DoctorFilters;
