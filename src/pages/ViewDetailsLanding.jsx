import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Car,
  Lock,
  User,
  KeyRound,
  Palette,
  Settings2,
  Fuel,
  Users,
  Calendar,
  Star,
  ShieldCheck,
} from 'lucide-react';

import { vehiclesApi, ApiError } from '../api';
import { useAuth } from '../context/auth-context';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

const STATUS_STYLES = {
  Available: 'bg-green-100 text-green-700 ring-green-600/20',
  Booked: 'bg-blue-100 text-blue-700 ring-blue-600/20',
  Maintenance: 'bg-amber-100 text-amber-700 ring-amber-600/20',
};

// Sample driver fee per day added when a client picks "With Driver".
const WITH_DRIVER_FEE = 1000;

// Wraps page content with the shared header/footer so every state (loading,
// error, loaded) keeps a consistent chrome.
const PageShell = ({ children }) => (
  <div className="flex min-h-screen flex-col bg-gray-50">
    <SiteHeader />
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
    <SiteFooter />
  </div>
);

const VehicleDetails = () => {
  const { id } = useParams();
  const { isClient } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Rental option choice. Starts empty so the user must pick a drive type
  // before the estimated price is shown.
  const [driveType, setDriveType] = useState(''); // 'self' | 'driver'

  useEffect(() => {
    let active = true;
    vehiclesApi
      .getOne(id)
      .then((data) => active && setVehicle(data))
      .catch(
        (err) =>
          active &&
          setError(err instanceof ApiError ? err.message : 'Failed to load vehicle'),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <PageShell>
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="h-96 animate-pulse rounded-3xl bg-gray-200 lg:col-span-3" />
          <div className="h-96 animate-pulse rounded-3xl bg-gray-200 lg:col-span-2" />
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
          {error}
        </div>
      </PageShell>
    );
  }

  if (!vehicle) return null;

  const base = Number(vehicle.dailyRate) || 0;
  const isAvailable = vehicle.status === 'Available';
  const driverFee = driveType === 'driver' ? WITH_DRIVER_FEE : 0;
  const total = base + driverFee;

  // Choosing a drive type is the first step of booking; we carry it into the
  // booking form (and through login for guests) via the ?drive= param.
  const bookingHref = `/booking/${vehicle.id}?drive=${driveType}`;

  const specs = [
    { icon: Palette, label: 'Color', value: vehicle.color },
    { icon: Settings2, label: 'Transmission', value: vehicle.transmission },
    { icon: Fuel, label: 'Fuel type', value: vehicle.fuelType },
    { icon: Users, label: 'Seats', value: vehicle.seats },
    { icon: Calendar, label: 'Year', value: vehicle.year },
    { icon: Car, label: 'Type', value: vehicle.vehicleType },
  ].filter((s) => s.value !== undefined && s.value !== null && s.value !== '');

  return (
    <PageShell>
      {/* Breadcrumb */}
      <Link
        to="/vehicles"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-700"
      >
        <ArrowLeft size={16} />
        Back to fleet
      </Link>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Left column — gallery, specs, description */}
        <div className="flex flex-col gap-6 lg:col-span-3">
          {/* Image — grows to fill the column so it matches the booking panel height */}
          <div className="relative flex-1 overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-100 to-gray-50 shadow-sm">
            <span
              className={`absolute left-4 top-4 z-10 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                STATUS_STYLES[vehicle.status] ?? 'bg-gray-100 text-gray-700 ring-gray-300'
              }`}
            >
              {vehicle.status}
            </span>
            <div className="flex h-full min-h-72 items-center justify-center sm:min-h-96">
              {vehicle.image ? (
                <img
                  src={vehicle.image}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="h-full w-full object-contain p-4"
                />
              ) : (
                <Car size={96} className="text-gray-300" strokeWidth={1.25} />
              )}
            </div>
          </div>

          {/* Specs */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
              Specifications
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {specs.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-3"
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {vehicle.description && (
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
                About this vehicle
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                {vehicle.description}
              </p>
            </div>
          )}
        </div>

        {/* Right column — sticky booking panel. `self-start` stops the grid
            cell from stretching so the panel can actually stay pinned. */}
        <div className="lg:col-span-2 lg:self-start">
          <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
              {/* Title + rating */}
              <div className="border-b border-gray-100 p-6">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  {vehicle.brand}
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
                  {vehicle.year} {vehicle.brand} {vehicle.model}
                </h1>
                <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span className="font-medium text-gray-700">4.8</span>
                  </span>

                  
                </div>

                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold text-blue-600">
                    ₱{base.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-400">/ per day</span>
                </div>
              </div>

              {/* Rental options */}
              <div className="space-y-5 p-6">
                <div>
                  <p className="mb-2 text-sm font-semibold text-gray-800">
                    Choose your rental option
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDriveType('self')}
                      className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                        driveType === 'self'
                          ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600/20'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <KeyRound size={16} />
                      Self Drive
                    </button>
                    <button
                      type="button"
                      onClick={() => setDriveType('driver')}
                      className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                        driveType === 'driver'
                          ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600/20'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <User size={16} />
                      With Driver
                    </button>
                  </div>
                </div>

                {/* Estimated price — shown once a drive type is chosen */}
                {driveType && (
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                    <div className="space-y-1.5 text-sm">
                      <PriceRow label="Base rate / day" value={base} />
                      {driverFee > 0 && (
                        <PriceRow label="Driver's fee / day" value={driverFee} />
                      )}
                      <div className="mt-2 flex items-center justify-between border-t border-blue-200 pt-2">
                        <span className="font-semibold text-gray-900">
                          Estimated price / day
                        </span>
                        <span className="text-lg font-bold text-blue-700">
                          ₱{total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Booking CTA — a drive type must be chosen first */}
                <div className="border-t border-gray-100 pt-5">
                  {!isAvailable ? (
                    <button
                      disabled
                      className="w-full cursor-not-allowed rounded-2xl bg-gray-200 px-4 py-3.5 text-center text-sm font-semibold text-gray-500"
                    >
                      Currently unavailable
                    </button>
                  ) : !driveType ? (
                    <button
                      disabled
                      className="w-full cursor-not-allowed rounded-2xl bg-gray-200 px-4 py-3.5 text-center text-sm font-semibold text-gray-500"
                    >
                      Select Self Drive or With Driver to continue
                    </button>
                  ) : isClient ? (
                    <Link
                      to={bookingHref}
                      className="block w-full rounded-2xl bg-blue-600 px-4 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
                    >
                      Continue to booking
                    </Link>
                  ) : (
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-center">
                      <p className="mb-3 flex items-center justify-center gap-1.5 text-sm text-gray-600">
                        <Lock size={14} className="text-blue-600" />
                        Log in to continue your {driveType === 'driver' ? 'With Driver' : 'Self Drive'} booking
                      </p>
                      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                        <Link
                          to="/login"
                          state={{ from: bookingHref }}
                          className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          Log in
                        </Link>
                        <Link
                          to="/register"
                          state={{ from: bookingHref }}
                          className="rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                          Create an account
                        </Link>
                      </div>
                    </div>
                  )}

                  <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                    <ShieldCheck size={13} className="text-green-500" />
                    Free cancellation · No hidden charges
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

const PriceRow = ({ label, value }) => (
  <div className="flex items-center justify-between text-gray-600">
    <span>{label}</span>
    <span className="font-medium text-gray-900">
      ₱{Number(value).toLocaleString()}
    </span>
  </div>
);

export default VehicleDetails;
