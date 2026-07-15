import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, X, ChevronLeft, ChevronRight } from "lucide-react";

import alldriveLogo from "../assets/images/all-drive.png";
import { vehiclesApi, ApiError } from "../api";
import { useAuth } from "../context/auth-context";
import VehicleCard from "../components/VehicleCard";

const PER_PAGE_OPTIONS = [6, 12, 18];

// The dropdown filters. `field` is the vehicle property each one narrows on.
const FILTERS = [
  { key: "brand", label: "Brand" },
  { key: "model", label: "Model" },
  { key: "vehicleType", label: "Vehicle Type" },
  { key: "color", label: "Color" },
  { key: "status", label: "Status" },
  { key: "transmission", label: "Transmission" },
];

const EMPTY_FILTERS = {
  brand: "",
  model: "",
  vehicleType: "",
  color: "",
  status: "",
  transmission: "",
};

// Public "view all fleet" page. Guests and clients alike can browse every
// vehicle here; booking still requires logging in (handled by VehicleCard).
const FleetListing = () => {
  const { user, logout } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [perPage, setPerPage] = useState(PER_PAGE_OPTIONS[0]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    vehiclesApi
      .list()
      // Booked and admin-hidden (Unlisted) vehicles are excluded from the
      // public fleet display.
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
          setError(
            err instanceof ApiError ? err.message : "Failed to load vehicles",
          ),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // Distinct, sorted values for each filter dropdown, derived from the fleet.
  const options = useMemo(() => {
    const build = (field) =>
      [...new Set(vehicles.map((v) => v[field]).filter(Boolean))].sort((a, b) =>
        String(a).localeCompare(String(b)),
      );
    return FILTERS.reduce((acc, f) => ({ ...acc, [f.key]: build(f.key) }), {});
  }, [vehicles]);

  // Apply the free-text search and every active dropdown filter.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return vehicles.filter((v) => {
      if (q) {
        const haystack = [
          v.brand,
          v.model,
          v.vehicleType,
          v.color,
          v.year,
          v.plateNumber,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return FILTERS.every(
        (f) => !filters[f.key] || String(v[f.key]) === filters[f.key],
      );
    });
  }, [vehicles, search, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * perPage;
  const visible = filtered.slice(pageStart, pageStart + perPage);

  const activeFilterCount =
    (search.trim() ? 1 : 0) + Object.values(filters).filter(Boolean).length;

  // Any change that can shrink/reshape the result set resets to page 1.
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const updateFilter = (key) => (e) => {
    setFilters((prev) => ({ ...prev, [key]: e.target.value }));
    setPage(1);
  };

  const handlePerPage = (e) => {
    setPerPage(Number(e.target.value));
    setPage(1);
  };

  const clearAll = () => {
    setSearch("");
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link to="/">
            <img
              src={alldriveLogo}
              alt="AllDrive Logo"
              className="h-14 w-auto"
            />
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <Link to="/" className="text-gray-900 hover:text-blue-600">Home</Link>
            <Link to="/vehicles" className="text-gray-600 hover:text-blue-600">Our Fleet</Link>
            <Link to="/about" className="text-gray-600 hover:text-blue-600">About Us</Link>
            <Link to="/services" className="text-gray-600 hover:text-blue-600">Services</Link>
            <Link to="/contact" className="text-gray-600 hover:text-blue-600">Contact</Link>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            {user ? (
              <>
                <span className="text-gray-600">
                  Hi,{" "}
                  <span className="font-medium text-gray-900">{user.name}</span>
                </span>
                <button
                  onClick={logout}
                  className="rounded-xl bg-gray-900 px-5 py-2 font-medium text-white transition hover:bg-gray-800"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl px-5 py-2 font-medium text-gray-600 transition hover:bg-gray-100"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Our Full Fleet</h1>
          <p className="mt-2 text-gray-500">
            Search and filter our fleet to find the right ride for your trip.
          </p>
        </div>

        {/* Search + filters */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
          <div className="relative mb-4">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search by brand, model, color, year, plate…"
              className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {FILTERS.map((f) => (
              <div key={f.key}>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  {f.label}
                </label>
                <select
                  value={filters[f.key]}
                  onChange={updateFilter(f.key)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">All</option>
                  {options[f.key].map((opt) => (
                    <option key={opt} value={String(opt)}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {activeFilterCount > 0 && (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {filtered.length} result{filtered.length === 1 ? "" : "s"}
              </span>
              <button
                onClick={clearAll}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                <X size={13} />
                Clear filters
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-2xl border border-gray-100 bg-white"
              />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-gray-500">
            No vehicles match your search. Try adjusting your filters.
          </p>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visible.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Items per page</span>
                <select
                  value={perPage}
                  onChange={handlePerPage}
                  className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  {PER_PAGE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={15} />
                  Prev
                </button>
                <span className="text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default FleetListing;
