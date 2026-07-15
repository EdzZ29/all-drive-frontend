import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  ChevronDown,
  ChevronsLeft,
  X,
} from 'lucide-react';

import { useAuth } from '../../context/auth-context';
import alldriveLogo from '../../assets/images/all-drive.png';

// Nav items map to the admin modules. An item with `children` renders as an
// expandable group.
const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/vehicles', label: 'Vehicles', icon: Car },
  {
    label: 'Bookings',
    icon: CalendarCheck,
    base: '/admin/bookings',
    children: [
      { to: '/admin/bookings', label: 'Manage Bookings', end: true },
      { to: '/admin/bookings/history', label: 'Booking History' },
    ],
  },
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

// A collapsible parent item with sub-links (e.g. Bookings → Booking History).
const NavGroup = ({ item, collapsed, onNavigate }) => {
  const { pathname } = useLocation();
  const isInside = pathname.startsWith(item.base);
  const [expanded, setExpanded] = useState(false);
  const open = isInside || expanded;
  const Icon = item.icon;

  // When collapsed to icons only, the group behaves as a direct link to its base.
  if (collapsed) {
    return (
      <li>
        <NavLink
          to={item.base}
          onClick={onNavigate}
          title={item.label}
          className={`flex items-center justify-center rounded-xl p-2.5 transition ${
            isInside ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Icon size={20} />
        </NavLink>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={() => setExpanded((o) => !o)}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
          isInside ? 'text-blue-600' : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <Icon size={19} className={isInside ? 'text-blue-600' : 'text-gray-400'} />
        {item.label}
        <ChevronDown
          size={16}
          className={`ml-auto text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul className="mt-1 space-y-1 pl-9">
          {item.children.map((child) => (
            <li key={child.to}>
              <NavLink
                to={child.to}
                end={child.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`
                }
              >
                {child.label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

const AdminSidebar = ({ collapsed = false, onToggleCollapse, onNavigate, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  // Keep the <html> theme class and stored preference in sync with the toggle.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleDark = () => setDark((d) => !d);

  return (
    <aside
      className={`flex h-screen flex-col border-r border-gray-200 bg-white transition-[width] duration-200 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand + toggle */}
      <div
        className={`flex items-center py-5 ${collapsed ? 'justify-center px-2' : 'justify-between px-5'}`}
      >
        <div className="flex items-center gap-2.5">
          <img src={alldriveLogo} alt="AllDrive" className="h-10 w-10 object-contain" />
          {!collapsed && (
            <span className="text-lg font-semibold tracking-tight text-gray-700">
              AllDrive
            </span>
          )}
        </div>

        {/* Desktop collapse toggle */}
        {onToggleCollapse && !collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Collapse sidebar"
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <ChevronsLeft size={18} />
          </button>
        )}

        {/* Mobile close */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 lg:hidden"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {onToggleCollapse && collapsed && (
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label="Expand sidebar"
          className="mx-auto mb-2 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
        >
          <ChevronsLeft size={18} className="rotate-180" />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) =>
            item.children ? (
              <NavGroup
                key={item.label}
                item={item}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            ) : (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={onNavigate}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `flex items-center rounded-xl text-sm font-medium transition ${
                      collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
                    } ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        size={collapsed ? 20 : 19}
                        className={isActive ? 'text-blue-600' : 'text-gray-400'}
                      />
                      {!collapsed && item.label}
                    </>
                  )}
                </NavLink>
              </li>
            ),
          )}
        </ul>
      </nav>

      {/* Footer: dark mode + logout */}
      <div className="space-y-2 border-t border-gray-200 px-3 py-4">
        {!collapsed && (
          <div className="flex items-center justify-between rounded-xl px-3 py-2.5">
            <span className="flex items-center gap-3 text-sm font-medium text-gray-600">
              <Moon size={19} className="text-gray-400" />
              Dark Mode
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={dark}
              onClick={toggleDark}
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
        )}

        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`flex w-full items-center rounded-xl bg-slate-500 text-sm font-semibold text-white transition hover:bg-slate-600 ${
            collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
          }`}
        >
          <LogOut size={19} />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
