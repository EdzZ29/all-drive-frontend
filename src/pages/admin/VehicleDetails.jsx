import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Car,
  Pencil,
  Trash2,
  Palette,
  Cog,
  Fuel,
  Users,
  Calendar,
} from 'lucide-react';

import { vehiclesApi, ApiError } from '../../api';

const STATUS_STYLES = {
  Available: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200',
  Booked: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
  Maintenance: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  Unlisted: 'bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-200',
};

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

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

  const handleDelete = async () => {
    if (!window.confirm('Delete this vehicle? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await vehiclesApi.remove(id);
      navigate('/admin/vehicles');
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to delete vehicle');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="h-6 w-40 animate-pulse rounded bg-gray-100" />
        <div className="mt-6 h-72 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    );
  }

  if (error) {
    return <p className="px-6 py-8 text-sm text-red-600">{error}</p>;
  }

  if (!vehicle) return null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link
        to="/admin/vehicles"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-900"
      >
        <ArrowLeft size={16} />
        Back to vehicles
      </Link>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Hero image */}
        <div className="relative flex h-72 items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
          {vehicle.image ? (
            <img
              src={vehicle.image}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="h-full w-full object-contain p-6"
            />
          ) : (
            <Car size={56} strokeWidth={1.5} className="text-gray-300" />
          )}
          <span
            className={`absolute right-5 top-5 rounded-full px-3 py-1 text-xs font-semibold ${
              STATUS_STYLES[vehicle.status] ?? 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200'
            }`}
          >
            {vehicle.status}
          </span>
        </div>

        <div className="p-8">
          {/* Title */}
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                {vehicle.vehicleType}
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
                {vehicle.year} {vehicle.brand} {vehicle.model}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Plate&nbsp;
                <span className="font-medium text-gray-700">{vehicle.plateNumber}</span>
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Daily rate
              </p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                ₱{Number(vehicle.dailyRate).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Spec pills */}
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <Spec icon={Palette} label="Color" value={vehicle.color} />
            <Spec icon={Cog} label="Transmission" value={vehicle.transmission} />
            <Spec icon={Fuel} label="Fuel type" value={vehicle.fuelType} />
            <Spec icon={Users} label="Seats" value={vehicle.seats} />
            <Spec icon={Calendar} label="Year" value={vehicle.year} />
            <Spec icon={Car} label="Type" value={vehicle.vehicleType} />
          </div>

          {vehicle.description && (
            <div className="mb-8">
              <p className="mb-1.5 text-sm font-semibold text-gray-900">Description</p>
              <p className="text-sm leading-relaxed text-gray-600">{vehicle.description}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 border-t border-gray-100 pt-6">
            <Link
              to={`/admin/vehicles/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Pencil size={15} />
              Edit vehicle
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 size={15} />
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Spec = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-3">
    <div className="mb-1.5 flex items-center gap-1.5 text-gray-400">
      <Icon size={14} />
      <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
    </div>
    <p className="text-sm font-semibold text-gray-900">{value}</p>
  </div>
);

export default VehicleDetails;