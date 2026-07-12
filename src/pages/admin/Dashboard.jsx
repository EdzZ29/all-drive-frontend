import {
  CalendarCheck,
  Car,
  Users,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Wrench,
  Star,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data — swap these for real queries (e.g. react-query hooks hitting your API).
const KPIS = [
  { label: 'Active bookings', value: '128', delta: '+8.2%', up: true, icon: CalendarCheck },
  { label: 'Fleet utilization', value: '76%', delta: '+3.1%', up: true, icon: Car },
  { label: 'New clients (30d)', value: '54', delta: '-2.4%', up: false, icon: Users },
  { label: 'Revenue (30d)', value: '₱482,300', delta: '+12.6%', up: true, icon: Wallet },
];

const RECENT_BOOKINGS = [
  { id: 'BK-1042', client: 'Maria Santos', vehicle: 'Toyota Vios', dates: 'Jul 12 – Jul 15', status: 'Confirmed' },
  { id: 'BK-1041', client: 'Jerome Uy', vehicle: 'Mitsubishi Xpander', dates: 'Jul 11 – Jul 13', status: 'Ongoing' },
  { id: 'BK-1040', client: 'Ana Reyes', vehicle: 'Honda City', dates: 'Jul 10 – Jul 12', status: 'Completed' },
  { id: 'BK-1039', client: 'Carlo Dizon', vehicle: 'Ford Ranger', dates: 'Jul 9 – Jul 14', status: 'Confirmed' },
  { id: 'BK-1038', client: 'Liza Manalo', vehicle: 'Toyota Vios', dates: 'Jul 8 – Jul 9', status: 'Cancelled' },
];

const STATUS_STYLES = {
  Confirmed: 'bg-blue-50 text-blue-700',
  Ongoing: 'bg-amber-50 text-amber-700',
  Completed: 'bg-green-50 text-green-700',
  Cancelled: 'bg-red-50 text-red-700',
};

const QUICK_LINKS = [
  { to: '/admin/vehicles', label: 'Manage vehicles', icon: Car },
  { to: '/admin/maintenance', label: 'Maintenance log', icon: Wrench },
  { to: '/admin/reviews', label: 'Client reviews', icon: Star },
  { to: '/admin/users', label: 'Manage users', icon: Users },
];

const Dashboard = () => {
  return (
    <div className="mx-auto max-w-10xl px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening across AllDrive today.
          </p>
        </div>
        <Link
          to="/admin/reports"
          className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          View reports
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* KPI cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPIS.map(({ label, value, delta, up, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <Icon size={18} />
              </span>
              <span
                className={`flex items-center gap-0.5 text-xs font-medium ${
                  up ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {delta}
              </span>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            <p className="mt-0.5 text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent bookings */}
        <div className="rounded-xl border border-gray-200 bg-white lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">Recent bookings</h2>
            <Link
              to="/admin/bookings"
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-gray-400">
                <th className="px-5 py-2.5 font-medium">Booking</th>
                <th className="px-5 py-2.5 font-medium">Client</th>
                <th className="px-5 py-2.5 font-medium">Vehicle</th>
                <th className="px-5 py-2.5 font-medium">Dates</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_BOOKINGS.map((b) => (
                <tr key={b.id} className="border-t border-gray-100">
                  <td className="px-5 py-3 font-medium text-gray-900">{b.id}</td>
                  <td className="px-5 py-3 text-gray-600">{b.client}</td>
                  <td className="px-5 py-3 text-gray-600">{b.vehicle}</td>
                  <td className="px-5 py-3 text-gray-600">{b.dates}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[b.status]}`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick links into other modules */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Quick links</h2>
          <ul className="space-y-1">
            {QUICK_LINKS.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="flex items-center justify-between rounded-lg px-2.5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={17} className="text-gray-400" />
                    {label}
                  </span>
                  <ArrowRight size={15} className="text-gray-300" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;