import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';

import AdminSidebar from './AdminSidebar';
import AdminTopbarActions from './AdminTopbarActions';
import { NotificationsProvider } from '../../context/NotificationsProvider';
import alldriveLogo from '../../assets/images/all-drive.png';

// Shell for all admin pages: a sidebar that collapses to icons on desktop and
// slides in as a drawer on mobile, plus a scrollable content area.
const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('admin-sidebar-collapsed') === '1',
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapse = () =>
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem('admin-sidebar-collapsed', next ? '1' : '0');
      return next;
    });

  return (
    <NotificationsProvider>
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="sticky top-0 hidden h-screen lg:block">
        <AdminSidebar collapsed={collapsed} onToggleCollapse={toggleCollapse} />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full shadow-xl">
            <AdminSidebar
              collapsed={false}
              onNavigate={() => setMobileOpen(false)}
              onClose={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      <main className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="rounded-lg p-1.5 text-gray-600 transition hover:bg-gray-100"
          >
            <Menu size={22} />
          </button>
          <img src={alldriveLogo} alt="AllDrive" className="h-8 w-auto" />
          <div className="ml-auto">
            <AdminTopbarActions />
          </div>
        </div>

        {/* Desktop top bar: notifications, settings, profile */}
        <div className="sticky top-0 z-30 hidden items-center justify-end border-b border-gray-200 bg-white px-6 py-3 lg:flex">
          <AdminTopbarActions />
        </div>

        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </div>
    </NotificationsProvider>
  );
};

export default AdminLayout;
