import { Link } from 'react-router-dom';
import { Mail, Shield, BadgeCheck, Settings as SettingsIcon } from 'lucide-react';

import { useAuth } from '../../context/auth-context';
import { initials } from '../../utils/initials';

const Detail = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4">
    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
      <Icon size={18} />
    </span>
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-0.5 truncate font-medium text-gray-900">{value || '—'}</p>
    </div>
  </div>
);

const AdminProfile = () => {
  const { user } = useAuth();
  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : 'Admin';

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Your account details and role in AllDrive.
        </p>
      </div>

      {/* Identity card */}
      <div className="mb-6 flex flex-col items-center gap-4 rounded-2xl border border-gray-200 bg-white p-6 text-center sm:flex-row sm:text-left">
        <span className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-2xl font-semibold text-white">
          {initials(user?.name)}
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-xl font-semibold text-gray-900">
            {user?.name || 'Administrator'}
          </h2>
          <p className="truncate text-sm text-gray-500">{user?.email}</p>
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            <Shield size={12} /> {roleLabel}
          </span>
        </div>
        <Link
          to="/admin/settings"
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:ml-auto sm:mt-0"
        >
          <SettingsIcon size={15} /> Settings
        </Link>
      </div>

      {/* Details */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Detail icon={Mail} label="Email" value={user?.email} />
        <Detail icon={Shield} label="Role" value={roleLabel} />
        <Detail icon={BadgeCheck} label="Account status" value="Active" />
        <Detail icon={BadgeCheck} label="User ID" value={user?.id ? `#${user.id}` : '—'} />
      </div>
    </div>
  );
};

export default AdminProfile;
