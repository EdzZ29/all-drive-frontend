import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, CalendarCheck, ArrowRight } from 'lucide-react';

import { useAuth } from '../../context/auth-context';
import { bookingsApi, ApiError } from '../../api';

const STATUS_STYLES = {
  Pending: 'bg-amber-50 text-amber-700',
  Approved: 'bg-blue-50 text-blue-700',
  Returned: 'bg-purple-50 text-purple-700',
  Completed: 'bg-green-50 text-green-700',
  Declined: 'bg-red-50 text-red-700',
  Cancelled: 'bg-gray-100 text-gray-500',
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    bookingsApi
      .listMine()
      .then((data) => active && setBookings(data))
      .catch(
        (err) =>
          active &&
          setError(err instanceof ApiError ? err.message : 'Failed to load bookings'),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const activeCount = bookings.filter(
    (b) => b.status === 'Pending' || b.status === 'Approved',
  ).length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Welcome, {user?.name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">Manage your rentals and bookings.</p>
        </div>
        <button
          onClick={logout}
          className="rounded-lg border border-gray-300 px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Log out
        </button>
      </div>

      {/* Summary cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <CalendarCheck size={18} />
          </span>
          <p className="text-2xl font-semibold text-gray-900">{activeCount}</p>
          <p className="mt-0.5 text-sm text-gray-500">Active bookings</p>
        </div>
        <Link
          to="/vehicles"
          className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 transition hover:border-blue-300 hover:bg-blue-50/40"
        >
          <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <Car size={18} />
          </span>
          <span className="flex items-center justify-between text-sm font-medium text-gray-900">
            Browse vehicles
            <ArrowRight size={16} className="text-gray-400" />
          </span>
        </Link>
      </div>

      {/* Bookings */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">My bookings</h2>
        </div>

        {loading ? (
          <p className="px-5 py-6 text-sm text-gray-500">Loading…</p>
        ) : error ? (
          <p className="px-5 py-6 text-sm text-red-600">{error}</p>
        ) : bookings.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-500">
            You have no bookings yet.{' '}
            <Link to="/vehicles" className="font-medium text-blue-600 hover:text-blue-700">
              Browse vehicles
            </Link>{' '}
            to get started.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-gray-400">
                <th className="px-5 py-2.5 font-medium">Vehicle</th>
                <th className="px-5 py-2.5 font-medium">Dates</th>
                <th className="px-5 py-2.5 font-medium">Total</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t border-gray-100">
                  <td className="px-5 py-3 font-medium text-gray-900">
                    {b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model}` : `#${b.vehicleId}`}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {b.startDate} → {b.endDate}
                  </td>
                  <td className="px-5 py-3 text-gray-600">₱{b.totalPrice}</td>
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
        )}
      </div>
    </div>
  );
};

export default Dashboard;
