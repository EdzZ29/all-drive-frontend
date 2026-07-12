import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/admin/Dashboard";
import VehicleManagement from "./pages/admin/VehicleManagement";
import VehicleForm from "./pages/admin/VehicleForm";
import ClientDashboard from "./pages/client/Dashboard";
import AdminLayout from "./components/admin/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import VehicleDetails from "./pages/admin/VehicleDetails";
import VehicleDetailsLanding from "./pages/ViewDetailsLanding";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="vehicles/:id" element={<VehicleDetailsLanding />} />

      {/* Admin area — sidebar layout, admin-only. Add more admin pages as
          nested routes here and they inherit the sidebar automatically. */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="vehicles" element={<VehicleManagement />} />
        <Route path="vehicles/:id" element={<VehicleDetails />} />
        <Route path="vehicles/:id/edit" element={<VehicleForm />} />
        <Route path="vehicles/new" element={<VehicleForm />} />
      </Route>

      {/* Client-only */}
      <Route
        path="/client/dashboard"
        element={
          <ProtectedRoute role="client">
            <ClientDashboard />
            <Route path="vehicles" element={<VehicleManagement />} />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
