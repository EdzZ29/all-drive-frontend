import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Bell, Volume2, User } from 'lucide-react';

import { useAuth } from '../../context/auth-context';

// Small controlled switch used across the settings rows.
const Toggle = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative h-6 w-11 flex-shrink-0 rounded-full transition ${
      checked ? 'bg-blue-600' : 'bg-gray-300'
    }`}
  >
    <span
      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
        checked ? 'left-[22px]' : 'left-0.5'
      }`}
    />
  </button>
);

const Row = ({ icon: Icon, title, desc, children }) => (
  <div className="flex items-center justify-between gap-4 px-5 py-4">
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
        <Icon size={18} />
      </span>
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        {desc && <p className="text-xs text-gray-500">{desc}</p>}
      </div>
    </div>
    {children}
  </div>
);

// Reads a boolean preference from localStorage.
const readPref = (key, fallback) => {
  const v = localStorage.getItem(key);
  return v === null ? fallback : v === '1';
};

const AdminSettings = () => {
  const { user } = useAuth();

  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [sound, setSound] = useState(() => readPref('pref-notif-sound', true));
  const [desktop, setDesktop] = useState(() => readPref('pref-notif-desktop', false));

  // Keep the <html> theme class and stored preference in sync with the toggle.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    localStorage.setItem('pref-notif-sound', sound ? '1' : '0');
  }, [sound]);

  useEffect(() => {
    localStorage.setItem('pref-notif-desktop', desktop ? '1' : '0');
  }, [desktop]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your appearance and notification preferences.
        </p>
      </div>

      {/* Appearance */}
      <section className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Appearance</h2>
        </div>
        <Row
          icon={Moon}
          title="Dark mode"
          desc="Use a darker theme across the admin area."
        >
          <Toggle checked={dark} onChange={setDark} label="Toggle dark mode" />
        </Row>
      </section>

      {/* Notifications */}
      <section className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Notifications</h2>
        </div>
        <div className="divide-y divide-gray-100">
          <Row
            icon={Volume2}
            title="Sound alerts"
            desc="Play a sound when a new booking arrives."
          >
            <Toggle checked={sound} onChange={setSound} label="Toggle sound alerts" />
          </Row>
          <Row
            icon={Bell}
            title="Desktop notifications"
            desc="Show a browser notification for new activity."
          >
            <Toggle
              checked={desktop}
              onChange={setDesktop}
              label="Toggle desktop notifications"
            />
          </Row>
        </div>
      </section>

      {/* Account */}
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Account</h2>
        </div>
        <Row icon={User} title={user?.name || 'Administrator'} desc={user?.email}>
          <Link
            to="/admin/profile"
            className="rounded-lg border border-gray-300 px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            View profile
          </Link>
        </Row>
      </section>
    </div>
  );
};

export default AdminSettings;
