import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4">
      <div className="rounded-3xl border border-cyan-100 bg-white p-10 text-center shadow-soft">
        <h1 className="text-3xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-3 text-slate-600">The requested route does not exist.</p>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-brand-600 px-5 py-3 font-semibold text-white">
          Back to doctors
        </Link>
      </div>
    </main>
  );
};

export default NotFoundPage;
