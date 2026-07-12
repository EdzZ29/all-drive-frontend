import { useEffect, useState } from 'react';
import { useParams, Link, } from 'react-router-dom';
import { ArrowLeft, Car,} from 'lucide-react';

import { vehiclesApi, ApiError } from '../api';

const STATUS_STYLES = {
  Available: 'bg-green-50 text-green-700',
  Booked: 'bg-blue-50 text-blue-700',
  Maintenance: 'bg-amber-50 text-amber-700',
};

const VehicleDetails = () => {
  const { id } = useParams();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


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
    return <p className="px-6 py-8 text-sm text-gray-500">Loading…</p>;
  }

  if (error) {
    return <p className="px-6 py-8 text-sm text-red-600">{error}</p>;
  }

  if (!vehicle) return null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} />
        Back to vehicles
      </Link>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex h-56 items-center justify-center bg-gray-50">
          {vehicle.image ? (
            <img
              src={vehicle.image}
              alt={vehicle.model}
              className="h-full w-full object-contain"
            />
          ) : (
            <Car size={48} className="text-gray-300" />
          )}
        </div>

        <div className="p-6">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-gray-900">
                {vehicle.year} {vehicle.brand} {vehicle.model}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {vehicle.vehicleType} · Plate {vehicle.plateNumber}
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                STATUS_STYLES[vehicle.status] ?? 'bg-gray-100 text-gray-700'
              }`}
            >
              {vehicle.status}
            </span>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-5 sm:grid-cols-3">
            <Spec label="Color" value={vehicle.color} />
            <Spec label="Transmission" value={vehicle.transmission} />
            <Spec label="Fuel type" value={vehicle.fuelType} />
            <Spec label="Seats" value={vehicle.seats} />
            <Spec label="Rate/day" value={`₱${Number(vehicle.dailyRate).toLocaleString()}`} />
          </div>

          {vehicle.description && (
            <div className="mb-6 border-t border-gray-100 pt-5">
              <p className="mb-1 text-sm font-medium text-gray-700">Description</p>
              <p className="text-sm text-gray-600">{vehicle.description}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

const Spec = ({ label, value }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
    <p className="mt-0.5 text-sm font-medium text-gray-900">{value}</p>
  </div>
);

export default VehicleDetails;