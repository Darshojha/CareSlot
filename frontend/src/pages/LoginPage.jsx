import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form);
      toast.success('Welcome back');
      navigate(data.role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    user ? (
      <Navigate to={user.role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard'} replace />
    ) : (
      <main className="mx-auto flex min-h-[calc(100vh-72px)] max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-3xl border border-cyan-100 bg-white p-8 shadow-soft">
            <p className="text-sm font-semibold text-brand-700">Welcome back</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Login to MediConnect</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Patients manage bookings. Doctors review appointments and availability from one place.
            </p>

            <form onSubmit={submit} className="mt-6 grid gap-4">
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
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </form>

            <p className="mt-5 text-sm text-slate-600">
              New here? <Link to="/register" className="font-semibold text-brand-700">Create patient account</Link>
            </p>
          </section>

          <section className="rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-white p-8 shadow-soft">
            <h2 className="text-2xl font-semibold text-slate-900">Demo accounts</h2>
            <div className="mt-5 grid gap-4 text-sm text-slate-700">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="font-semibold">Patient</p>
                <p className="mt-1">patient@mediconnect.com</p>
                <p>Password123!</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="font-semibold">Doctor</p>
                <p className="mt-1">aanya@mediconnect.com</p>
                <p>Password123!</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    )
  );
};

export default LoginPage;
