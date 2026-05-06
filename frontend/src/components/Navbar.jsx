import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaCalendarCheck, FaArrowRightFromBracket, FaUserDoctor, FaHouse } from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext';

const linkClass = ({ isActive }) =>
  `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
    isActive ? 'bg-brand-600 text-white shadow-soft' : 'text-slate-600 hover:bg-cyan-50 hover:text-brand-700'
  }`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-cyan-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 font-semibold text-slate-900">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-soft">
            <FaCalendarCheck />
          </span>
          <span>
            MediConnect
            <span className="block text-xs font-normal text-slate-500">Healthcare appointments online</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <NavLink to="/" className={linkClass}>
            <FaHouse />
            Doctors
          </NavLink>
          {user?.role === 'patient' && (
            <NavLink to="/patient-dashboard" className={linkClass}>
              <FaCalendarCheck />
              Patient dashboard
            </NavLink>
          )}
          {user?.role === 'doctor' && (
            <NavLink to="/doctor-dashboard" className={linkClass}>
              <FaUserDoctor />
              Doctor dashboard
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:bg-cyan-50"
              >
                <FaArrowRightFromBracket />
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-cyan-50">
                Login
              </Link>
              <Link to="/register" className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
