import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Car, Pencil, Eye, X } from 'lucide-react';

import { vehiclesApi, ApiError } from '../../api';

const STATUS_STYLES = {
  Available: 'bg-green-50 text-green-700',
  Booked: 'bg-blue-50 text-blue-700',
  Maintenance: 'bg-amber-50 text-amber-700',
};

const STATUSES = ['Available', 'Booked', 'Maintenance'];
const TRANSMISSIONS = ['Automatic', 'Manual'];
const VEHICLE_TYPES = ['Sedan', 'SUV', 'Pickup', 'Van', 'Hatchback', 'MPV'];

const EMPTY_FILTERS = { vehicleType: '', brand: '', status: '', transmission: '' };

const selectCls =
  'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  useEffect(() => {
    let active = true;
    vehiclesApi
      .list()
      .then((data) => active && setVehicles(data))
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

  // Brands come from the actual data since they vary per fleet;
  // the rest are fixed option sets.
  const brandOptions = useMemo(
    () => [...new Set(vehicles.map((v) => v.brand).filter(Boolean))].sort(),
    [vehicles],
  );

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (filters.vehicleType && v.vehicleType !== filters.vehicleType) return false;
      if (filters.brand && v.brand !== filters.brand) return false;
      if (filters.status && v.status !== filters.status) return false;
      if (filters.transmission && v.transmission !== filters.transmission) return false;
      return true;
    });
  }, [vehicles, filters]);

  const updateFilter = (key) => (e) =>
    setFilters((prev) => ({ ...prev, [key]: e.target.value }));

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div className="mx-auto max-w-10xl px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Vehicles
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your fleet. Added vehicles show up on the Browse Fleet page.
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

      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <select
          value={filters.vehicleType}
          onChange={updateFilter('vehicleType')}
          className={selectCls}
        >
          <option value="">All types</option>
          {VEHICLE_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select value={filters.brand} onChange={updateFilter('brand')} className={selectCls}>
          <option value="">All brands</option>
          {brandOptions.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        <select value={filters.status} onChange={updateFilter('status')} className={selectCls}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={filters.transmission}
          onChange={updateFilter('transmission')}
          className={selectCls}
        >
          <option value="">All transmissions</option>
          {TRANSMISSIONS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={14} />
            Clear
          </button>
        )}

        {!loading && !error && (
          <span className="ml-auto text-sm text-gray-400">
            {filteredVehicles.length} of {vehicles.length} vehicles
          </span>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <p className="px-5 py-6 text-sm text-gray-500">Loading…</p>
        ) : error ? (
          <p className="px-5 py-6 text-sm text-red-600">{error}</p>
        ) : vehicles.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Car size={36} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-500">
              No vehicles yet.{' '}
              <Link to="/admin/vehicles/new" className="font-medium text-blue-600 hover:text-blue-700">
                Add your first vehicle
              </Link>
              .
            </p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Car size={36} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-500">
              No vehicles match these filters.{' '}
              <button
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </button>
              .
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-400">
                <th className="px-5 py-3 font-medium">Vehicle</th>
                <th className="px-5 py-3 font-medium">Plate</th>
                <th className="px-5 py-3 font-medium">Rate/day</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((v) => (
                <tr key={v.id} className="border-t border-gray-100">
                  <td className="px-5 py-3">
                    <Link to={`/admin/vehicles/${v.id}`} className="group flex items-center gap-3">
                      <div className="flex h-10 w-14 items-center justify-center overflow-hidden rounded-md bg-gray-50">
                        {v.image ? (
                          <img src={v.image} alt={v.model} className="h-full w-full object-contain" />
                        ) : (
                          <Car size={18} className="text-gray-300" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 group-hover:text-blue-600">
                          {v.year} {v.brand} {v.model}
                        </p>
                        <p className="text-xs text-gray-400">
                          {v.transmission} · {v.fuelType} · {v.seats} seats
                        </p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{v.plateNumber}</td>
                  <td className="px-5 py-3 text-gray-600">
                    ₱{Number(v.dailyRate).toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUS_STYLES[v.status] ?? 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/admin/vehicles/${v.id}`}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100"
                      >
                        <Eye size={14} />
                        View
                      </Link>

                      <Link
                        to={`/admin/vehicles/${v.id}/edit`}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                      >
                        <Pencil size={14} />
                        Edit...
                      </Link>

                      <button
                        onClick={() => handleDelete(v.id)}
                        disabled={deletingId === v.id}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        {deletingId === v.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
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

export default VehicleManagement;