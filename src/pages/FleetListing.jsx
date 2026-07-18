import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, Car, X } from 'lucide-react';
import SiteFooter from '../components/SiteFooter';

import { vehiclesApi, ApiError } from '../api';
import SiteHeader from '../components/SiteHeader';
import Pagination from '../components/Pagination';

const TRANSMISSIONS = ['Any', 'Automatic', 'Manual'];
const SORTS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'year-desc', label: 'Newest first' },
];

const toggleIn = (set, value) => {
  const next = new Set(set);
  next.has(value) ? next.delete(value) : next.add(value);
  return next;
};

// Small labelled section in the filter sidebar.
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

// One vehicle card in the grid.
const FleetCard = ({ vehicle, }) => {
  const rating = (4.5 + ((vehicle.id % 5) * 0.1)).toFixed(1);
  const reviews = 8 + ((vehicle.id * 7) % 40);
  const spec = [vehicle.year, vehicle.vehicleType, vehicle.transmission]
    .filter(Boolean)
    .join(' · ');

  return (
    <Link
      to={`/vehicles/${vehicle.id}`}
      className="group flex flex-col rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition hover:shadow-md"
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600">
          <Star size={13} className="fill-amber-400 text-amber-400" />
          {rating}
          <span className="text-gray-400">({reviews})</span>
        </span>
        
      </div>

      <div className="mb-3 flex h-32 items-center justify-center overflow-hidden rounded-xl bg-gray-50">
        {vehicle.image ? (
          <img
            src={vehicle.image}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="h-full w-full object-contain transition group-hover:scale-105"
          />
        ) : (
          <Car size={56} className="text-gray-300" strokeWidth={1.5} />
        )}
      </div>

      <div className="flex items-end justify-between gap-2 px-1">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-gray-900">
            {vehicle.brand} {vehicle.model}
          </h3>
          <p className="truncate text-xs text-gray-500">{spec}</p>
        </div>
        <div className="whitespace-nowrap text-right">
          <span className="text-base font-bold text-blue-600">
            ₱{Number(vehicle.dailyRate).toLocaleString()}
          </span>
          <span className="block text-[11px] text-gray-400">/ day</span>
        </div>
      </div>
    </Link>
  );
};

const EMPTY = {
  search: '',
  priceMin: '',
  priceMax: '',
  brands: new Set(),
  bodyTypes: new Set(),
  fuelTypes: new Set(),
  transmission: 'Any',
  availableOnly: false,
};

const FleetListing = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [f, setF] = useState(EMPTY);
  const [sort, setSort] = useState('recommended');
  const [favs, setFavs] = useState(new Set());
  const [perPage, setPerPage] = useState(12);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    vehiclesApi
      .list()
      // Booked and admin-hidden (Unlisted) vehicles are excluded.
      .then(
        (data) =>
          active &&
          setVehicles(
            Array.isArray(data)
              ? data.filter(
                  (v) => v.status !== 'Booked' && v.status !== 'Unlisted',
                )
              : [],
          ),
      )
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

    let list = vehicles.filter((v) => {
      if (q) {
        const hay = [v.brand, v.model, v.vehicleType, v.color, v.year]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      const rate = Number(v.dailyRate);
      if (min != null && rate < min) return false;
      if (max != null && rate > max) return false;
      if (f.brands.size && !f.brands.has(v.brand)) return false;
      if (f.bodyTypes.size && !f.bodyTypes.has(v.vehicleType)) return false;
      if (f.fuelTypes.size && !f.fuelTypes.has(v.fuelType)) return false;
      if (f.transmission !== 'Any' && v.transmission !== f.transmission)
        return false;
      if (f.availableOnly && v.status !== 'Available') return false;
      return true;
    });

    if (sort === 'price-asc') list = [...list].sort((a, b) => a.dailyRate - b.dailyRate);
    else if (sort === 'price-desc') list = [...list].sort((a, b) => b.dailyRate - a.dailyRate);
    else if (sort === 'year-desc') list = [...list].sort((a, b) => b.year - a.year);
    return list;
  }, [vehicles, f, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  // Any filter change returns to page 1.
  const patch = (changes) => {
    setF((prev) => ({ ...prev, ...changes }));
    setPage(1);
  };
  const resetAll = () => {
    setF(EMPTY);
    setPage(1);
  };
  const toggleFav = (id) => setFavs((prev) => toggleIn(prev, id));

  const activeCount =
    (f.search ? 1 : 0) +
    (f.priceMin || f.priceMax ? 1 : 0) +
    f.brands.size +
    f.bodyTypes.size +
    f.fuelTypes.size +
    (f.transmission !== 'Any' ? 1 : 0) +
    (f.availableOnly ? 1 : 0);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 lg:flex-row">
        {/* Filter sidebar */}
        <aside className="w-full flex-shrink-0 lg:w-64">
          <div className="lg:sticky lg:top-24">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Filter by</h2>
              {activeCount > 0 && (
                <button
                  onClick={resetAll}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  <X size={13} /> Reset all
                </button>
              )}
            </div>

            {/* Search */}
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={f.search}
                onChange={(e) => patch({ search: e.target.value })}
                placeholder="Search vehicles…"
                className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Available only */}
            <FilterSection title="Availability">
              <label className="flex cursor-pointer items-center justify-between text-sm text-gray-700">
                Available now
                <button
                  type="button"
                  role="switch"
                  aria-checked={f.availableOnly}
                  onClick={() => patch({ availableOnly: !f.availableOnly })}
                  className={`relative h-6 w-11 rounded-full transition ${
                    f.availableOnly ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                      f.availableOnly ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                </button>
              </label>
            </FilterSection>

            {/* Price range */}
            <FilterSection title="Price range / day">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={f.priceMin}
                  onChange={(e) => patch({ priceMin: e.target.value })}
                  placeholder="From"
                  className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <span className="text-gray-400">–</span>
                <input
                  type="number"
                  min="0"
                  value={f.priceMax}
                  onChange={(e) => patch({ priceMax: e.target.value })}
                  placeholder="To"
                  className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </FilterSection>

            {/* Car brand */}
            {opts.brands.length > 0 && (
              <FilterSection title="Car brand">
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

            {/* Body type */}
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

            {/* Transmission */}
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

            {/* Fuel type */}
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

        {/* Main content */}
        <main className="min-w-0 flex-1">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Our Fleet
            </h1>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl border border-gray-100 bg-white" />
              ))}
            </div>
          ) : error ? (
            <p className="text-center text-red-600">{error}</p>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-gray-50/50 px-6 py-16 text-center">
              <Car size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500">
                No vehicles match your filters.{' '}
                <button onClick={resetAll} className="font-medium text-blue-600 hover:text-blue-700">
                  Reset all
                </button>
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((v) => (
                  <FleetCard
                    key={v.id}
                    vehicle={v}
                    favourite={favs.has(v.id)}
                    onToggleFav={toggleFav}
                  />
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
        </main>
      </div>
      <SiteFooter/>
    </div>
  );
};

export default FleetListing;
