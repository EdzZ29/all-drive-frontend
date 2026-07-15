import { Link } from 'react-router-dom';

// Shared public site footer used across the landing, fleet and detail pages.
const SiteFooter = () => (
  <footer className="border-t border-gray-200 bg-gray-900 px-6 py-12 text-gray-400">
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-8 md:grid-cols-4">
        <div>
          <div className="mb-4 text-xl font-bold text-white">AllDrive</div>
          <p className="text-sm text-gray-400">
            Where quality meets convenience. Rent with confidence in Butuan City.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-white">About Us</Link></li>
            <li><Link to="/vehicles" className="hover:text-white">Our Fleet</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/terms" className="hover:text-white">Terms &amp; Conditions</Link></li>
            <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Get In Touch</h4>
          <a
            href="mailto:alldrivebtc@gmail.com"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            alldrivebtc@gmail.com
          </a>
        </div>
      </div>
      <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm">
        <p>© 2026 AllDrive Rent a Car • Butuan City</p>
      </div>
    </div>
  </footer>
);

export default SiteFooter;
