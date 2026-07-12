import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  CalendarCheck,
  Users,
  IdCard,
  Wallet,
  Wrench,
  Tag,
  Star,
  BarChart3,
  ScrollText,
  Settings,
  Moon,
  LogOut,
} from 'lucide-react';

import { useAuth } from '../../context/auth-context';
import alldriveLogo from '../../assets/images/all-drive.png';

// Nav items map to the admin modules. Some target routes are not built yet
// and will 404 until their pages/routes are added.
const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/vehicles', label: 'Vehicles', icon: Car },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/admin/clients', label: 'Clients', icon: Users },
  { to: '/admin/drivers', label: 'Drivers', icon: IdCard },
  { to: '/admin/payments', label: 'Payments', icon: Wallet },
  { to: '/admin/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/admin/promos', label: 'Promos', icon: Tag },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

const AdminSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(
    () => localStorage.getItem('theme') === 'dark',
  );

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center">
          <img src={alldriveLogo} alt="AllDrive" className="h-14 w-14 object-contain" />
        </span>
        <span className="text-lg font-semibold tracking-tight text-gray-700">
          AllDrive
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={19}
                      className={isActive ? 'text-blue-600' : 'text-gray-400'}
                    />
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer: dark mode + logout */}
      <div className="space-y-2 border-t border-gray-200 px-3 py-4">
        <div className="flex items-center justify-between rounded-xl px-3 py-2.5">
          <span className="flex items-center gap-3 text-sm font-medium text-gray-600">
            <Moon size={19} className="text-gray-400" />
            Dark Mode
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={dark}
            onClick={() => setDark((d) => !d)}
            className={`relative h-6 w-11 rounded-full transition ${
              dark ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                dark ? 'left-[22px]' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl bg-slate-500 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-600"
        >
          <LogOut size={19} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
