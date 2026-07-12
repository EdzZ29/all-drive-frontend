import { Link } from 'react-router-dom';
import { Star, Fuel, Settings2, Users, Car, ArrowUpRight } from 'lucide-react';

// Card for a single vehicle, matching the fleet design.
// `vehicle` is the shape returned by GET /api/vehicles.
const VehicleCard = ({ vehicle }) => {
  const {
    id,
    brand,
    model,
    vehicleType,
    year,
    transmission,
    fuelType,
    seats,
    dailyRate,
    status,
    image,
  } = vehicle;

  const isAvailable = status === 'Available';
  const price = Number(dailyRate).toLocaleString();

  // Ratings/reviews aren't in the backend yet — decorative placeholder derived
  // from the id so cards vary. Swap for real review data when it's wired.
  const rating = (4.5 + ((id % 5) * 0.1)).toFixed(1);
  const reviews = 8 + ((id * 7) % 40);

  const specs = [
    { icon: Car, label: vehicleType },
    { icon: Settings2, label: transmission },
    { icon: Fuel, label: fuelType },
    { icon: Users, label: `${seats}` },
  ].filter((s) => s.label);

  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-lg">
      {/* Top row: rating, status, expand */}
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700">
          <Star size={13} className="fill-amber-400 text-amber-400" />
          {rating}
          <span className="text-gray-400">({reviews})</span>
        </span>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {isAvailable ? 'Available now' : status}
        </span>

        <Link
          to={`/vehicles/${id}`}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200"
          aria-label="View details"
        >
          <ArrowUpRight size={15} />
        </Link>
      </div>

      {/* Image */}
      <div className="mb-3 flex h-36 items-center justify-center overflow-hidden rounded-xl bg-gray-50">
        {image ? (
          <img
            src={image}
            alt={`${brand} ${model}`}
            className="h-full w-full object-contain"
          />
        ) : (
          <Car size={64} className="text-gray-300" strokeWidth={1.5} />
        )}
      </div>

      {/* Brand + title + price */}
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {brand}
      </p>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-900">
          {year} {brand} {model}
        </h3>
        <div className="whitespace-nowrap text-right">
          <span className="text-lg font-bold text-blue-600">₱{price}</span>
          <span className="block text-xs text-gray-400">/per day</span>
        </div>
      </div>

      {/* Specs */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-gray-100 pt-3 text-xs text-gray-600">
        {specs.map(({ icon: Icon, label }, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <Icon size={15} className="text-blue-500" />
            {label}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <Link
          to={isAvailable ? '/login' : '#'}
          onClick={(e) => !isAvailable && e.preventDefault()}
          className={`flex-1 rounded-xl px-4 py-2.5 text-center text-sm font-semibold text-white transition ${
            isAvailable
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'cursor-not-allowed bg-gray-300'
          }`}
        >
          Book Now
        </Link>
        <Link
          to={`/vehicles/${id}`}
          className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default VehicleCard;
