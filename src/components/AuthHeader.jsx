import { Link } from 'react-router-dom';

import alldriveLogo from '../assets/images/all-drive.png';

// Minimal header for the auth pages — just the logo and the log in / sign up
// actions, no navigation list.
const AuthHeader = () => (
  <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md">
    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
      <Link to="/">
        <img src={alldriveLogo} alt="AllDrive Logo" className="h-12 w-auto" />
      </Link>

      <div className="flex items-center gap-3 text-sm">
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
      </div>
    </div>
  </header>
);

export default AuthHeader;
