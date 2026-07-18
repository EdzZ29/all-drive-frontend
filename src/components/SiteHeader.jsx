import { Link } from 'react-router-dom';

import alldriveLogo from '../assets/images/all-drive.png';
import { useAuth } from '../context/auth-context';

// Public navigation links, shared by the desktop bar and the mobile row.
const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/vehicles', label: 'Our Fleet' },
  { to: '/about', label: 'About Us' },
  { to: '/about', label: 'Services' },
  { to: '/contact', label: 'Contact' },
];

// Shared public site header used across the landing, fleet and detail pages.
// On desktop the links sit inline; on mobile they drop to a scrollable row
// directly below the header.
const SiteHeader = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/">
          <img
            src={alldriveLogo}
            alt="AllDrive Logo"
            className="h-11 w-auto sm:h-14"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-gray-600 transition hover:text-blue-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth actions (all screen sizes) */}
        <div className="flex items-center gap-2 text-sm sm:gap-3">
          {user ? (
            <>
              <span className="hidden text-gray-600 lg:inline">
                Hi, <span className="font-medium text-gray-900">{user.name}</span>
              </span>
              <button
                onClick={logout}
                className="rounded-xl bg-gray-900 px-4 py-2 font-medium text-white transition hover:bg-gray-800 sm:px-5"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl px-3 py-2 font-medium text-gray-600 transition hover:bg-gray-100 sm:px-5"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 sm:px-5"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile nav row: links sit below the header, scrollable if they overflow */}
      <nav className="border-t border-gray-100 md:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 overflow-x-auto px-4 py-3 text-sm font-medium whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-gray-600 transition hover:text-blue-600"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default SiteHeader;
