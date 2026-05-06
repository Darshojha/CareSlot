import { dayLabel } from '../utils/date';

const days = Array.from({ length: 7 }, (_, index) => ({ value: index, label: dayLabel(index) }));

const normalizeSlots = (value) =>
  String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const AvailabilityEditor = ({ availability, setAvailability, onSave, saving }) => {
  const updateDay = (dayOfWeek, slots) => {
    setAvailability((current) => {
      const exists = current.find((item) => Number(item.dayOfWeek) === dayOfWeek);
      if (exists) {
        return current.map((item) => (Number(item.dayOfWeek) === dayOfWeek ? { ...item, slots } : item));
      }
      return [...current, { dayOfWeek, slots }];
    });
  };

  return (
    <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Availability manager</h3>
          <p className="text-sm text-slate-500">Set weekday slots in a simple comma-separated format.</p>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save availability'}
        </button>
      </div>

      <div className="mt-4 grid gap-3">
        {days.map((day) => {
          const current = availability.find((item) => Number(item.dayOfWeek) === day.value)?.slots || [];
          return (
            <div key={day.value} className="grid gap-2 rounded-xl bg-slate-50 p-4 md:grid-cols-[90px_1fr] md:items-center">
              <div className="font-medium text-slate-700">{day.label}</div>
              <input
                value={current.join(', ')}
                onChange={(e) => updateDay(day.value, normalizeSlots(e.target.value))}
                placeholder="09:00 AM, 10:00 AM, 11:00 AM"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-300"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AvailabilityEditor;
