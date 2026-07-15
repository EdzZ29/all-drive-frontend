import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Car, Pencil, Eye, X, Search } from 'lucide-react';

import { vehiclesApi, ApiError } from '../../api';
import Pagination from '../../components/Pagination';

const STATUS_STYLES = {
  Available: 'bg-green-50 text-green-700 ring-green-600/20',
  Booked: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  Maintenance: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Unlisted: 'bg-gray-100 text-gray-500 ring-gray-500/20',
};

const STATUSES = ['Available', 'Booked', 'Maintenance', 'Unlisted'];
const TRANSMISSIONS = ['Any', 'Automatic', 'Manual'];

// Statuses an admin can set directly. "Booked" is managed automatically by the
// booking workflow, so it's not offered here.
const MANAGE_STATUSES = [
  { value: 'Available', label: 'Available' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Unlisted', label: "Don't display" },
];

const EMPTY = {
  search: '',
  statuses: new Set(),
  brands: new Set(),
  bodyTypes: new Set(),
  fuelTypes: new Set(),
  transmission: 'Any',
  priceMin: '',
  priceMax: '',
};

const toggleIn = (set, value) => {
  const next = new Set(set);
  next.has(value) ? next.delete(value) : next.add(value);
  return next;
};

const FilterSection = ({ title, children }) => (
  <div className="border-t border-gray-100 py-4">
    <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
      {title}
    </p>
    {children}
  </div>
);

const CheckRow = ({ label, checked, onChange }) => (
  <label className="flex cursor-pointer items-center gap-2 py-1 text-sm text-gray-700">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
    />
    {label}
  </label>
);

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [f, setF] = useState(EMPTY);
  const [perPage, setPerPage] = useState(12);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    vehiclesApi
      .list()
      .then((data) => active && setVehicles(Array.isArray(data) ? data : []))
      .catch(
        (err) =>
          active &&
          setError(err instanceof ApiError ? err.message : 'Failed to load vehicles'),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vehicle? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await vehiclesApi.remove(id);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to delete vehicle');
    } finally {
      setDeletingId(null);
    }
  };

  // Quick status change: Available / Maintenance / Don't display (Unlisted).
  const handleStatusChange = async (id, status) => {
    setStatusUpdatingId(id);
    try {
      const updated = await vehiclesApi.update(id, { status });
      setVehicles((prev) => prev.map((v) => (v.id === id ? updated : v)));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to update status');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const opts = useMemo(() => {
    const uniq = (key) =>
      [...new Set(vehicles.map((v) => v[key]).filter(Boolean))].sort((a, b) =>
        String(a).localeCompare(String(b)),
      );
    return {
      brands: uniq('brand'),
      bodyTypes: uniq('vehicleType'),
      fuelTypes: uniq('fuelType'),
    };
  }, [vehicles]);

  const filtered = useMemo(() => {
    const q = f.search.trim().toLowerCase();
    const min = f.priceMin ? Number(f.priceMin) : null;
    const max = f.priceMax ? Number(f.priceMax) : null;
    return vehicles.filter((v) => {
      if (q) {
        const hay = [v.brand, v.model, v.vehicleType, v.color, v.year, v.plateNumber]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      const rate = Number(v.dailyRate);
      if (min != null && rate < min) return false;
      if (max != null && rate > max) return false;
      if (f.statuses.size && !f.statuses.has(v.status)) return false;
      if (f.brands.size && !f.brands.has(v.brand)) return false;
      if (f.bodyTypes.size && !f.bodyTypes.has(v.vehicleType)) return false;
      if (f.fuelTypes.size && !f.fuelTypes.has(v.fuelType)) return false;
      if (f.transmission !== 'Any' && v.transmission !== f.transmission) return false;
      return true;
    });
  }, [vehicles, f]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  const patch = (changes) => {
    setF((prev) => ({ ...prev, ...changes }));
    setPage(1);
  };
  const resetAll = () => {
    setF(EMPTY);
    setPage(1);
  };

  const activeCount =
    (f.search ? 1 : 0) +
    (f.priceMin || f.priceMax ? 1 : 0) +
    f.statuses.size +
    f.brands.size +
    f.bodyTypes.size +
    f.fuelTypes.size +
    (f.transmission !== 'Any' ? 1 : 0);

  return (
    <div className="mx-auto max-w-10xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Vehicles
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {loading ? 'Loading…' : `${filtered.length} vehicles in the fleet`}
          </p>
        </div>
        <Link
          to="/admin/vehicles/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={16} />
          Add Vehicle
        </Link>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Filter sidebar */}
        <aside className="w-full flex-shrink-0 lg:w-60">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 lg:sticky lg:top-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Filter by</h2>
              {activeCount > 0 && (
                <button
                  onClick={resetAll}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  <X size={13} /> Reset
                </button>
              )}
            </div>

            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={f.search}
                onChange={(e) => patch({ search: e.target.value })}
                placeholder="Search…"
                className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <FilterSection title="Status">
              {STATUSES.map((s) => (
                <CheckRow
                  key={s}
                  label={s}
                  checked={f.statuses.has(s)}
                  onChange={() => patch({ statuses: toggleIn(f.statuses, s) })}
                />
              ))}
            </FilterSection>

            

            {opts.brands.length > 0 && (
              <FilterSection title="Brand">
                <div className="max-h-40 space-y-0.5 overflow-y-auto pr-1">
                  {opts.brands.map((b) => (
                    <CheckRow
                      key={b}
                      label={b}
                      checked={f.brands.has(b)}
                      onChange={() => patch({ brands: toggleIn(f.brands, b) })}
                    />
                  ))}
                </div>
              </FilterSection>
            )}

            {opts.bodyTypes.length > 0 && (
              <FilterSection title="Body type">
                <div className="grid grid-cols-2 gap-x-3">
                  {opts.bodyTypes.map((t) => (
                    <CheckRow
                      key={t}
                      label={t}
                      checked={f.bodyTypes.has(t)}
                      onChange={() => patch({ bodyTypes: toggleIn(f.bodyTypes, t) })}
                    />
                  ))}
                </div>
              </FilterSection>
            )}

            <FilterSection title="Transmission">
              <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
                {TRANSMISSIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => patch({ transmission: t })}
                    className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition ${
                      f.transmission === t
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </FilterSection>

            {opts.fuelTypes.length > 0 && (
              <FilterSection title="Fuel type">
                <div className="grid grid-cols-2 gap-x-3">
                  {opts.fuelTypes.map((ft) => (
                    <CheckRow
                      key={ft}
                      label={ft}
                      checked={f.fuelTypes.has(ft)}
                      onChange={() => patch({ fuelTypes: toggleIn(f.fuelTypes, ft) })}
                    />
                  ))}
                </div>
              </FilterSection>
            )}
          </div>
        </aside>

        {/* Card grid */}
        <div className="min-w-0 flex-1">
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-72 animate-pulse rounded-2xl border border-gray-100 bg-white" />
              ))}
            </div>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : vehicles.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center">
              <Car size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500">
                No vehicles yet.{' '}
                <Link to="/admin/vehicles/new" className="font-medium text-blue-600 hover:text-blue-700">
                  Add your first vehicle
                </Link>
                .
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center">
              <Car size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500">
                No vehicles match your filters.{' '}
                <button onClick={resetAll} className="font-medium text-blue-600 hover:text-blue-700">
                  Reset filters
                </button>
                .
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((v) => (
                  <div
                    key={v.id}
                    className="flex flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                  >
                    {/* Image + status */}
                    <div className="relative mb-3 flex h-32 items-center justify-center overflow-hidden rounded-xl bg-gray-50">
                      <span
                        className={`absolute left-2 top-2 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${
                          STATUS_STYLES[v.status] ?? 'bg-gray-100 text-gray-700 ring-gray-300'
                        }`}
                      >
                        {v.status}
                      </span>
                      {v.image ? (
                        <img src={v.image} alt={v.model} className="h-full w-full object-contain" />
                      ) : (
                        <Car size={52} className="text-gray-300" strokeWidth={1.5} />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-gray-900">
                          {v.year} {v.brand} {v.model}
                        </h3>
                        <p className="truncate text-xs text-gray-500">
                          {v.vehicleType} · {v.transmission} · {v.seats} seats
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400">Plate {v.plateNumber}</p>
                      </div>
                      <div className="whitespace-nowrap text-right">
                        <span className="text-base font-bold text-blue-600">
                          ₱{Number(v.dailyRate).toLocaleString()}
                        </span>
                        <span className="block text-[11px] text-gray-400">/ day</span>
                      </div>
                    </div>

                    {/* Availability control */}
                    <div className="mt-3">
                      <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-gray-400">
                        Availability
                      </label>
                      <select
                        value={v.status}
                        disabled={statusUpdatingId === v.id}
                        onChange={(e) => handleStatusChange(v.id, e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                      >
                        {v.status === 'Booked' && <option value="Booked">Booked (auto)</option>}
                        {MANAGE_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Actions — at the bottom of the card */}
                    <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-3">
                      <Link
                        to={`/admin/vehicles/${v.id}`}
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-gray-300 px-2 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        <Eye size={14} />
                        View
                      </Link>
                      <Link
                        to={`/admin/vehicles/${v.id}/edit`}
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-blue-300 px-2 py-2 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                      >
                        <Pencil size={14} />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(v.id)}
                        disabled={deletingId === v.id}
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-300 px-2 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        {deletingId === v.id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-gray-200 bg-white">
                <Pagination
                  page={currentPage}
                  perPage={perPage}
                  totalItems={filtered.length}
                  onPageChange={setPage}
                  onPerPageChange={(n) => {
                    setPerPage(n);
                    setPage(1);
                  }}
                  options={[6, 12, 18, 24]}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleManagement;
