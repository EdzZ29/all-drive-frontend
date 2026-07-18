import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';

import NotificationBell from './NotificationBell';
import ProfileMenu from './ProfileMenu';

// The cluster of top-bar controls: notifications, a settings shortcut, and the
// profile menu. Shared by the desktop and mobile admin headers.
const AdminTopbarActions = () => (
  <div className="flex items-center gap-1 sm:gap-2">
    <NotificationBell />
    <Link
      to="/admin/settings"
      aria-label="Settings"
      title="Settings"
      className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
    >
      <Settings size={20} />
    </Link>
    <span className="mx-1 hidden h-6 w-px bg-gray-200 sm:block" />
    <ProfileMenu />
  </div>
);

export default AdminTopbarActions;
