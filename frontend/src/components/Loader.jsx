const Loader = ({ rows = 6 }) => {
  return (
    <div className="grid gap-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-2xl border border-cyan-100 bg-white p-5 shadow-soft">
          <div className="h-4 w-32 rounded-full bg-cyan-100" />
          <div className="mt-4 h-3 w-full rounded-full bg-slate-100" />
          <div className="mt-2 h-3 w-5/6 rounded-full bg-slate-100" />
          <div className="mt-4 flex gap-3">
            <div className="h-8 w-24 rounded-full bg-cyan-100" />
            <div className="h-8 w-20 rounded-full bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Loader;
