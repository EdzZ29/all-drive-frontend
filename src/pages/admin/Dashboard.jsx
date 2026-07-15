import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  CheckCircle2,
  CalendarCheck,
  Wrench,
  Star,
  ArrowRight,
} from 'lucide-react';

import { vehiclesApi, bookingsApi, ApiError } from '../../api';

const STATUS_STYLES = {
  Pending: 'bg-amber-50 text-amber-700',
  Approved: 'bg-blue-50 text-blue-700',
  Returned: 'bg-purple-50 text-purple-700',
  Completed: 'bg-green-50 text-green-700',
  Declined: 'bg-red-50 text-red-700',
  Cancelled: 'bg-gray-100 text-gray-500',
};

const QUICK_LINKS = [
  { to: '/admin/vehicles', label: 'Manage vehicles', icon: Car },
  { to: '/admin/bookings', label: 'Manage bookings', icon: CalendarCheck },
  { to: '/admin/maintenance', label: 'Maintenance log', icon: Wrench },
  { to: '/admin/reviews', label: 'Client reviews', icon: Star },
];

const Dashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([vehiclesApi.list(), bookingsApi.listAll()])
      .then(([v, b]) => {
        if (!active) return;
        setVehicles(Array.isArray(v) ? v : []);
        setBookings(Array.isArray(b) ? b : []);
      })
      .catch(
        (err) =>
          active &&
          setError(
            err instanceof ApiError ? err.message : 'Failed to load dashboard',
          ),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // Vehicle counts by status (real backend data, no revenue).
  const stats = useMemo(() => {
    const by = (s) => vehicles.filter((v) => v.status === s).length;
    return {
      total: vehicles.length,
      available: by('Available'),
      booked: by('Booked'),
      maintenance: by('Maintenance'),
    };
  }, [vehicles]);

  const kpis = [
    { label: 'All vehicles', value: stats.total, icon: Car, tint: 'bg-blue-50 text-blue-700' },
    { label: 'Available', value: stats.available, icon: CheckCircle2, tint: 'bg-green-50 text-green-700' },
    { label: 'Booked', value: stats.booked, icon: CalendarCheck, tint: 'bg-amber-50 text-amber-700' },
    { label: 'Maintenance', value: stats.maintenance, icon: Wrench, tint: 'bg-purple-50 text-purple-700' },
  ];

  const recentBookings = useMemo(() => bookings.slice(0, 6), [bookings]);

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
          to="/admin/bookings"
          className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Manage bookings
          <ArrowRight size={16} />
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Vehicle KPI cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon, tint }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4">
            <span className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${tint}`}>
              <Icon size={18} />
            </span>
            <p className="text-2xl font-semibold text-gray-900">
              {loading ? '—' : value}
            </p>
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

          {loading ? (
            <p className="px-5 py-8 text-sm text-gray-500">Loading…</p>
          ) : recentBookings.length === 0 ? (
            <p className="px-5 py-8 text-sm text-gray-500">No bookings yet.</p>
          ) : (
            <div className="overflow-x-auto">
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
                  {recentBookings.map((b) => (
                    <tr key={b.id} className="border-t border-gray-100">
                      <td className="px-5 py-3 font-medium text-gray-900">
                        #{b.id}
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {b.client?.name || `Client #${b.clientId}`}
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {b.vehicle
                          ? `${b.vehicle.brand} ${b.vehicle.model}`
                          : `#${b.vehicleId}`}
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {b.startDate} → {b.endDate}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            STATUS_STYLES[b.status] ?? 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
