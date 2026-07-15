import { Link } from 'react-router-dom';

import alldriveLogo from '../assets/images/all-drive.png';
import authImage from '../assets/images/image 3.png';

// Two-column shell for the auth pages: the form on the left, a full-height
// hero image on the right (hidden on small screens).
const AuthLayout = ({ children }) => (
  <div className="grid min-h-screen lg:grid-cols-2">
    {/* Left — form column */}
    <div className="flex flex-col overflow-y-auto bg-white">
      <div className="px-6 pt-6 sm:px-10">
        <Link to="/" className="inline-block">
          <img src={alldriveLogo} alt="AllDrive Logo" className="h-12 w-auto" />
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center px-6 py-8 sm:px-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>

    {/* Right — hero image */}
    <div className="relative hidden lg:block">
      <img
        src={authImage}
        alt="AllDrive"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
        <h2 className="text-3xl font-bold leading-tight">
          Rent with confidence, <br /> drive with AllDrive
        </h2>
        <p className="mt-3 max-w-md text-sm text-white/80">
          Where quality meets convenience. Explore our fleet and book your ride
          in Butuan City — quick, easy, and reliable.
        </p>
      </div>
    </div>
  </div>
);

export default AuthLayout;
