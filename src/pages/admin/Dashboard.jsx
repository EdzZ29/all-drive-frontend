import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  CheckCircle2,
  CalendarCheck,
  Wrench,
  ChevronLeft,
  ChevronRight,
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

const PERIODS = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Weekly' },
  { key: 'month', label: 'Monthly' },
  { key: 'all', label: 'All' },
];

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const Dashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('all');

  const [cal, setCal] = useState(() => {
    const n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() };
  });

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
          setError(err instanceof ApiError ? err.message : 'Failed to load dashboard'),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const by = (s) => vehicles.filter((v) => v.status === s).length;
    return {
      total: vehicles.length,
      available: by('Available'),
      booked: by('Booked'),
      maintenance: by('Maintenance'),
      bookings: bookings.length,
      pending: bookings.filter((b) => b.status === 'Pending').length,
    };
  }, [vehicles, bookings]);

  const kpis = [
    { label: 'All vehicles', value: stats.total, sub: `${stats.available} available`, icon: Car, tint: 'bg-blue-50 text-blue-700' },
    { label: 'Available', value: stats.available, sub: 'Ready to rent', icon: CheckCircle2, tint: 'bg-green-50 text-green-700' },
    { label: 'Booked', value: stats.booked, sub: 'Currently out', icon: CalendarCheck, tint: 'bg-amber-50 text-amber-700' },
    { label: 'Maintenance', value: stats.maintenance, sub: 'Under service', icon: Wrench, tint: 'bg-purple-50 text-purple-700' },
  ];

  // Recent bookings filtered by the selected period (on createdAt).
  const recent = useMemo(() => {
    if (period === 'all') return bookings.slice(0, 8);
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (period === 'week') start.setDate(start.getDate() - 6);
    else if (period === 'month') start.setMonth(start.getMonth(), 1);
    return bookings
      .filter((b) => b.createdAt && new Date(b.createdAt) >= start)
      .slice(0, 8);
  }, [bookings, period]);

  // Days in the calendar month that have a booking starting on them.
  const bookedDays = useMemo(() => {
    const set = new Set();
    for (const b of bookings) {
      if (!b.startDate) continue;
      const [y, m, d] = String(b.startDate).split('-').map(Number);
      if (y === cal.y && m - 1 === cal.m) set.add(d);
    }
    return set;
  }, [bookings, cal]);

  const today = new Date();
  const firstDay = new Date(cal.y, cal.m, 1).getDay();
  const daysInMonth = new Date(cal.y, cal.m + 1, 0).getDate();
  const monthLabel = new Date(cal.y, cal.m, 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const shiftMonth = (delta) =>
    setCal(({ y, m }) => {
      const nm = m + delta;
      if (nm < 0) return { y: y - 1, m: 11 };
      if (nm > 11) return { y: y + 1, m: 0 };
      return { y, m: nm };
    });
  const isToday = (d) =>
    d &&
    today.getFullYear() === cal.y &&
    today.getMonth() === cal.m &&
    today.getDate() === d;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's what's happening across AllDrive today.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* KPI cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map(({ label, value, sub, icon: Icon, tint }) => (
          <div key={label} className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
            <span className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${tint}`}>
              <Icon size={20} />
            </span>
            <p className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {loading ? '—' : value}
            </p>
            <p className="mt-0.5 text-sm font-medium text-gray-700">{label}</p>
            <p className="text-xs text-gray-400">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent bookings */}
        <div className="rounded-2xl border border-gray-200 bg-white lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">Recent bookings</h2>
            <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
              {PERIODS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p.key)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                    period === p.key
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="px-5 py-8 text-sm text-gray-500">Loading…</p>
          ) : recent.length === 0 ? (
            <p className="px-5 py-8 text-sm text-gray-500">No bookings in this period.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-gray-400">
                    <th className="px-5 py-2.5 font-medium">Client</th>
                    <th className="px-5 py-2.5 font-medium">Vehicle</th>
                    <th className="px-5 py-2.5 font-medium">Dates</th>
                    <th className="px-5 py-2.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((b) => (
                    <tr key={b.id} className="border-t border-gray-100">
                      <td className="px-5 py-3 font-medium text-gray-900">
                        {b.client?.name || `Client #${b.clientId}`}
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model}` : `#${b.vehicleId}`}
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
          <div className="border-t border-gray-100 px-5 py-3 text-right">
            <Link to="/admin/bookings" className="text-xs font-medium text-blue-600 hover:text-blue-700">
              Manage all bookings →
            </Link>
          </div>
        </div>

        {/* Calendar */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Calendar</h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => shiftMonth(-1)}
                className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                aria-label="Previous month"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="min-w-[7.5rem] text-center text-sm font-medium text-gray-700">
                {monthLabel}
              </span>
              <button
                onClick={() => shiftMonth(1)}
                className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                aria-label="Next month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((d, i) => (
              <div key={i} className="py-1 text-xs font-medium text-gray-400">
                {d}
              </div>
            ))}
            {cells.map((d, i) => (
              <div key={i} className="flex items-center justify-center">
                {d ? (
                  <div
                    className={`relative flex h-9 w-9 items-center justify-center rounded-full text-sm ${
                      isToday(d)
                        ? 'bg-blue-600 font-semibold text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {d}
                    {bookedDays.has(d) && !isToday(d) && (
                      <span className="absolute bottom-1 h-1 w-1 rounded-full bg-blue-500" />
                    )}
                  </div>
                ) : (
                  <span />
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3 text-xs text-gray-500">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Booking start date
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
