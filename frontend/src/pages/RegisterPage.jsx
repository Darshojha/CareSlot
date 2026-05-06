import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created');
      navigate('/patient-dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return <Navigate to={user.role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard'} replace />;
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-72px)] max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-cyan-100 bg-white p-8 shadow-soft">
          <p className="text-sm font-semibold text-brand-700">Create account</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Patient registration</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">Register once, then book appointments and track their status online.</p>

          <form onSubmit={submit} className="mt-6 grid gap-4">
            <input
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-300"
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-300"
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-300"
            />
            <button disabled={loading} className="rounded-full bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60">
              {loading ? 'Creating...' : 'Register'}
            </button>
          </form>

          <p className="mt-5 text-sm text-slate-600">
            Already have an account? <Link to="/login" className="font-semibold text-brand-700">Login</Link>
          </p>
        </section>

        <section className="rounded-3xl border border-cyan-100 bg-gradient-to-br from-white to-cyan-50 p-8 shadow-soft">
          <h2 className="text-2xl font-semibold text-slate-900">What patients can do</h2>
          <div className="mt-5 space-y-3 text-sm text-slate-600">
            <p>View doctors and availability.</p>
            <p>Book, reschedule, or cancel appointments.</p>
            <p>Track upcoming appointments and history.</p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default RegisterPage;
