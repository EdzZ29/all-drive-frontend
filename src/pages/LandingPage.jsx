import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { vehiclesApi, ApiError } from '../api';
import VehicleCard from '../components/VehicleCard';
import SiteHeader from '../components/SiteHeader';

// Testimonials data
const testimonials = [
  {
    id: 1,
    name: 'Jerryl Corria Rondez-Layog',
    initials: 'JL',
    rating: 5,
    date: '2 weeks ago',
    text: 'On 19 June 2026, while traveling to Talacogon to pay our respects at the wake of Rene, I rented a vehicle from this owner. The booking process was smooth and hassle-free. The owner arrived at the airport ahead of schedule, turned over the vehicle in excellent condition, and made the entire experience seamless. Highly recommended!',
    isNew: true,
  },
  {
    id: 2,
    name: 'michael brown',
    initials: 'MB',
    rating: 5,
    date: '2 months ago',
    text: 'This is by far the best car rental experience I have had in the Philippines. Very accommodating and well-maintained vehicles. If you let them know in advance they can pick you up at the airport with the car.',
    reviewCount: 7,
    hasPhoto: true,
  },
  {
    id: 3,
    name: 'Vern H',
    initials: 'VH',
    rating: 5,
    date: 'a month ago',
    text: "I can't say enough about AllDrive! On a last-minute trip I saw their great reviews and contacted them. They gave me a brand new Toyota Hilux. They actually brought the truck to the airport to meet me. I drove it to Hinatuan for five days. Flawless experience from start to finish.",
    isLocalGuide: true,
    reviewCount: 17,
    hasPhoto: true,
    response: {
      text: 'Thank you so much for your kind feedback sir. We\'re glad to hear that you had a smooth and hassle-free experience with AllDrive. We look forward to serving you again!',
      date: 'a month ago',
    },
  },
];

// Star rating component
const StarRating = ({ rating }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`h-3.5 w-3.5 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const PAGE_SIZE = 6;
const ROTATE_MS = 5000;

const LandingPage = () => {
  const { user } = useAuth();
  const [allVehicles, setAllVehicles] = useState([]);
  const [offset, setOffset] = useState(0);
  const [fleetLoading, setFleetLoading] = useState(true);
  const [fleetError, setFleetError] = useState('');

  // Public endpoint — guests can browse the fleet. We load the whole catalogue
  // but only ever render 6 cards at a time (see `visibleVehicles` below).
  useEffect(() => {
    let active = true;
    vehiclesApi
      .list()
      // Booked and admin-hidden (Unlisted) vehicles are excluded from the
      // public fleet display.
      .then(
        (data) =>
          active &&
          setAllVehicles(
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
          setFleetError(
            err instanceof ApiError ? err.message : 'Failed to load vehicles',
          ),
      )
      .finally(() => active && setFleetLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // Rotate the visible window every 5 seconds so all vehicles get airtime,
  // while never showing more than 6 cards at once. No-op when there are 6
  // or fewer vehicles (nothing to rotate to).
  useEffect(() => {
    if (allVehicles.length <= PAGE_SIZE) return;
    const timer = setInterval(() => {
      setOffset((prev) => (prev + PAGE_SIZE) % allVehicles.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [allVehicles.length]);

  // The 6 cards currently on screen. Wraps around the end of the list so the
  // window always stays full.
  const visibleVehicles =
    allVehicles.length <= PAGE_SIZE
      ? allVehicles
      : Array.from(
          { length: PAGE_SIZE },
          (_, i) => allVehicles[(offset + i) % allVehicles.length],
        );

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header (shared, with responsive mobile nav row) */}
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white px-6 py-20 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-transparent" />
        <div className="relative mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            Trusted by 500+ customers
          </div>
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
            Rent a car, <br />
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">the easy way</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-500">
            Where Quality Meets Convenience, Rent with Confidence. Explore and Experience AllDrive Rent a Car Butuan.
          </p>
          
          <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
            {!user && (
              <Link
                to="/login"
                className="inline-block rounded-2xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-blue-700 hover:scale-105 shadow-lg shadow-blue-200"
              >
                Book Now
              </Link>
            )}
          </div>

          {/* Rating */}
          <div className="mb-8 flex items-center justify-center gap-3">
            <StarRating rating={5} />
            <span className="text-sm font-medium text-gray-700">5.0</span>
            <span className="text-sm text-gray-400">from 90+ reviews</span>
          </div>


          <div className='mt-4'>
            <span className='text-gray-400'>SAFE TRIP | COMFORT DRIVE | <span className='text-blue-600'>ALL DRIVE</span></span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-gray-100 bg-gray-50/50 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">100+</div>
              <div className="mt-1 text-sm text-gray-500">Our Esteemed Clients and Partners</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">7+</div>
              <div className="mt-1 text-sm text-gray-500">Years of Dedicated Service</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">1951+</div>
              <div className="mt-1 text-sm text-gray-500">Increase of 126 this month</div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse Cars Section */}
      <section className="px-6 py-16 bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Browse Our Fleet</h2>
            <p className="mt-2 text-gray-500">Choose from our wide selection of quality vehicles</p>
          </div>
          
          {fleetLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 animate-pulse rounded-2xl border border-gray-100 bg-white"
                />
              ))}
            </div>
          ) : fleetError ? (
            <p className="text-center text-red-600">{fleetError}</p>
          ) : visibleVehicles.length === 0 ? (
            <p className="text-center text-gray-500">
              No vehicles available yet. Please check back soon.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visibleVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <Link
              to="/vehicles"
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-300 bg-white px-8 py-3.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              View All Vehicles
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-white px-6 py-16 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-transparent" />
        <div className="relative mx-auto max-w-3xl">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">From Idea to Production in Days</h2>
          <p className="mb-6 text-lg text-gray-600">Accelerate your production with our technology. Reduce downtime and optimize costs.</p>
          <Link 
            to="/contact" 
            className="inline-block rounded-2xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-blue-700 hover:scale-105 shadow-lg shadow-blue-200"
          >
            Work With Us
          </Link>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-6 py-16 bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-gray-900">What our customers say</h2>
            <p className="mt-2 text-gray-500">Real reviews from real people</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="group rounded-2xl bg-gray-50 p-6 transition hover:bg-white hover:shadow-lg border border-gray-100">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-semibold text-white">
                      {testimonial.initials}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{testimonial.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{testimonial.date}</span>
                        {testimonial.isNew && <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">New</span>}
                        {testimonial.isLocalGuide && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">Local Guide</span>}
                      </div>
                    </div>
                  </div>
                  <StarRating rating={testimonial.rating} />
                </div>
                <p className="mb-3 text-sm leading-relaxed text-gray-600 overflow-hidden line-clamp-4">
                  {testimonial.text}
                </p>
                {testimonial.response && (
                  <div className="mt-3 rounded-xl bg-white p-3 border border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="font-medium text-gray-700">Owner response</span>
                      <span>·</span>
                      <span>{testimonial.response.date}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">"{testimonial.response.text}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/reviews" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition hover:text-blue-700">
              See all 84 reviews
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-900 px-6 py-12 text-gray-400">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 text-xl font-bold text-white">AllDrive</div>
              <p className="text-sm text-gray-400">Our solutions make production faster and cheaper.</p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-white">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/customers" className="hover:text-white">Customers</Link></li>
                <li><Link to="/newsroom" className="hover:text-white">Newsroom</Link></li>
                <li><Link to="/events" className="hover:text-white">Events</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-white">Products</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/mes" className="hover:text-white">Manufacturing Execution System</Link></li>
                <li><Link to="/erp" className="hover:text-white">Enterprise Resource Planning</Link></li>
                <li><Link to="/qms" className="hover:text-white">Quality Management System</Link></li>
                <li><Link to="/scp" className="hover:text-white">Supply Chain Planning</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-white">Get In Touch</h4>
              <a href="mailto:alldrivebtc@gmail.com" className="text-sm text-blue-400 hover:text-blue-300">alldrivebtc@gmail.com</a>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2026 AllDrive Rent a Car • Butuan City</p>
            <div className="mt-2 flex justify-center gap-4">
              <Link to="/terms" className="hover:text-white">Terms & Conditions</Link>
              <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;