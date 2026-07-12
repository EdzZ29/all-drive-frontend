import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth-context';
import AdminSidebar from '../../components/admin/AdminSidebar';

// Wrap every /admin/* route with this layout, e.g.:
//
// <Route path="/admin" element={<AdminLayout />}>
//   <Route path="dashboard" element={<Dashboard />} />
//   <Route path="bookings" element={<BookingManagement />} />
//   ...
// </Route>

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;