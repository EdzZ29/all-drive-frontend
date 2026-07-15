import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';

import { bookingsApi, ApiError } from '../../api';
import Pagination from '../../components/Pagination';

// Bookings that are no longer active — the "history".
const HISTORY_STATUSES = ['Completed', 'Returned', 'Cancelled', 'Declined'];

const STATUS_STYLES = {
  Returned: 'bg-purple-50 text-purple-700',
  Completed: 'bg-green-50 text-green-700',
  Declined: 'bg-red-50 text-red-700',
  Cancelled: 'bg-gray-100 text-gray-500',
};

const PAYMENT_STATUS_STYLES = {
  Unpaid: 'bg-gray-100 text-gray-500',
  'Down Payment': 'bg-amber-50 text-amber-700',
  'Fully Paid': 'bg-green-50 text-green-700',
};

const TABS = ['All', ...HISTORY_STATUSES];

const fmtDate = (d) => (d ? String(d).split('T')[0] : '—');

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('All');
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    bookingsApi
      .listAll()
      .then(
        (data) =>
          active &&
          setBookings(
            Array.isArray(data)
              ? data.filter((b) => HISTORY_STATUSES.includes(b.status))
              : [],
          ),
      )
      .catch(
        (err) =>
          active &&
          setError(err instanceof ApiError ? err.message : 'Failed to load history'),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const counts = useMemo(() => {
    const c = { All: bookings.length };
    for (const b of bookings) c[b.status] = (c[b.status] || 0) + 1;
    return c;
  }, [bookings]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings.filter((b) => {
      if (tab !== 'All' && b.status !== tab) return false;
      if (q) {
        const hay = [
          b.client?.name,
          b.client?.email,
          b.vehicle?.brand,
          b.vehicle?.model,
          b.driveType,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [bookings, tab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Booking History
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Completed, returned, cancelled and declined bookings.
        </p>
      </div>

      {/* Tabs + search */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setPage(1);
              }}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                tab === t
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t}
              {counts[t] ? (
                <span className={tab === t ? 'text-gray-300' : 'text-gray-400'}>
                  {' '}· {counts[t]}
                </span>
              ) : null}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search history…"
            className="rounded-xl border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {loading ? (
          <p className="px-5 py-8 text-sm text-gray-500">Loading…</p>
        ) : error ? (
          <p className="px-5 py-8 text-sm text-red-600">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-gray-500">
            No past bookings in this view.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-400">
                    <th className="px-5 py-3 font-medium">Client</th>
                    <th className="px-5 py-3 font-medium">Vehicle</th>
                    <th className="px-5 py-3 font-medium">Dates</th>
                    <th className="px-5 py-3 font-medium">Drive type</th>
                    <th className="px-5 py-3 font-medium">Payment</th>
                    <th className="px-5 py-3 font-medium">Total</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((b) => (
                    <tr key={b.id} className="border-t border-gray-100">
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900">
                          {b.client?.name || `Client #${b.clientId}`}
                        </p>
                        {b.client?.email && (
                          <p className="text-xs text-gray-400">{b.client.email}</p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {b.vehicle
                          ? `${b.vehicle.brand} ${b.vehicle.model}`
                          : `#${b.vehicleId}`}
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {b.startDate} → {b.endDate}
                      </td>
                      <td className="px-5 py-3 text-gray-600">{b.driveType}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            PAYMENT_STATUS_STYLES[b.paymentStatus] ??
                            'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {b.paymentStatus || 'Unpaid'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        ₱{Number(b.totalPrice).toLocaleString()}
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
                      <td className="px-5 py-3 text-gray-500">
                        {fmtDate(b.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={currentPage}
              perPage={perPage}
              totalItems={filtered.length}
              onPageChange={setPage}
              onPerPageChange={(n) => {
                setPerPage(n);
                setPage(1);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
