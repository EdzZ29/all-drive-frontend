import { Outlet } from 'react-router-dom';

import AdminSidebar from './AdminSidebar';

// Shell for all admin pages: fixed sidebar + scrollable content area.
const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
