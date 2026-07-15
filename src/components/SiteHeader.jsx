import { Link } from 'react-router-dom';

import alldriveLogo from '../assets/images/all-drive.png';
import { useAuth } from '../context/auth-context';

// Shared public site header used across the landing, fleet and detail pages.
const SiteHeader = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link to="/">
          <img src={alldriveLogo} alt="AllDrive Logo" className="h-14 w-auto" />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <Link to="/" className="text-gray-600 transition hover:text-blue-600">
            Home
          </Link>
          <Link to="/vehicles" className="text-gray-600 transition hover:text-blue-600">
            Our Fleet
          </Link>
          <Link to="/about" className="text-gray-600 transition hover:text-blue-600">
            About Us
          </Link>
          <Link to="/contact" className="text-gray-600 transition hover:text-blue-600">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <span className="hidden text-gray-600 sm:inline">
                Hi, <span className="font-medium text-gray-900">{user.name}</span>
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
  );
};

export default SiteHeader;
