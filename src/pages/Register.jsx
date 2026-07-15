import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { useAuth } from '../context/auth-context';
import AuthHeader from '../components/AuthHeader';
import AuthErrorAlert from '../components/AuthErrorAlert';
import { describeAuthError } from '../utils/authError';

// Password policy — each rule is checked live as the user types.
const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'One lowercase letter (a–z)', test: (v) => /[a-z]/.test(v) },
  { label: 'One uppercase letter (A–Z)', test: (v) => /[A-Z]/.test(v) },
  { label: 'One number (0–9)', test: (v) => /[0-9]/.test(v) },
  { label: 'One special character (!@#$…)', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.6 35.1 26.9 36 24 36c-5.3 0-9.6-3.1-11.3-7.5l-6.6 5.1C9.5 39.6 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.6 5.6C41.5 36 44 30.6 44 24c0-1.3-.1-2.7-.4-3.5z"/>
  </svg>
);


const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Continue to wherever the user was headed (e.g. a booking) after signup.
  const from = location.state?.from;
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Custom validation (native browser bubbles are disabled via noValidate),
    // so every problem surfaces in our own error alert instead.
    const name = form.name.trim();
    const email = form.email.trim();

    if (!name || name.length < 2) {
      setError({
        title: 'Please enter your full name.',
        action: 'Your name must be at least 2 characters long.',
      });
      return;
    }

    if (!email) {
      setError({
        title: 'Please enter your email address.',
        action: 'We need it to create your account and send confirmations.',
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError({
        title: 'That email address looks incomplete.',
        action: 'Enter a valid email, e.g. name@company.com.',
      });
      return;
    }

    // Enforce the password policy before hitting the server.
    if (!PASSWORD_RULES.every((rule) => rule.test(form.password))) {
      setError({
        title: 'Your password doesn’t meet the requirements yet.',
        action: 'Please satisfy all the rules listed under the password field.',
      });
      return;
    }

    setSubmitting(true);
    try {
      // Omit phone if left blank so it passes @IsOptional validation.
      const payload = { ...form };
      if (!payload.phone) delete payload.phone;
      await register(payload);
      navigate(from || '/client/dashboard');
    } catch (err) {
      setError(describeAuthError(err, 'register'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSocial = (provider) => {
    console.log(`Continue with ${provider}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AuthHeader />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Create your account
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Sign up to book and manage your rentals
            </p>
          </div>

          <AuthErrorAlert error={error} onDismiss={() => setError(null)} />

          <div className="grid">
            <button
              type="button"
              onClick={() => handleSocial('Google')}
              className="flex items-center justify-center w-full rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
            >
              <GoogleIcon />
              Google
            </button>
          </div>
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Or continue with
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
                Full name <span className='text-red-700'>required *</span>
              </label>
              <input
                id="name"
                type="text"
                required
                minLength={2}
                autoComplete="name"
                value={form.name}
                onChange={update('name')}
                placeholder="Juan Dela Cruz"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                Email <span className='text-red-700'>required *</span>
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={update('email')}
                placeholder="name@company.com"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-gray-700">
                Phone <span className='text-red-700'>required *</span>
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={update('phone')}
                placeholder="09XX XXX XXXX"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
                Password <span className='text-red-700'>required *</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={update('password')}
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 pr-12 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-xs font-medium text-gray-400 transition hover:text-gray-600"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {/* Live password requirements */}
              <ul className="mt-3 space-y-1.5 rounded-xl border border-gray-100 bg-gray-50/70 p-3">
                <li className="mb-1 text-xs font-medium text-gray-500">
                  Your password must contain:
                </li>
                {PASSWORD_RULES.map((rule) => {
                  const ok = rule.test(form.password);
                  return (
                    <li
                      key={rule.label}
                      className={`flex items-center gap-2 text-xs transition-colors ${
                        ok ? 'text-green-600' : 'text-gray-500'
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full ${
                          ok ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {ok ? (
                          <Check size={11} strokeWidth={3} />
                        ) : (
                          <X size={11} strokeWidth={3} />
                        )}
                      </span>
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          

          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Sign in
            </Link>
          </p>

          <p className="mt-10 text-center text-xs text-gray-400">
            © 2026 AllDrive Rent a Car • Butuan City
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
