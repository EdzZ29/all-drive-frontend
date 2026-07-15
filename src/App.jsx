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
import FleetListing from "./pages/FleetListing";
import Booking from "./pages/client/Booking";
import BookingManagement from "./pages/admin/BookingManagement";
import BookingHistory from "./pages/admin/BookingHistory";

function App() {
  return (
    <Routes>
      {/* Public — guests can browse the fleet and view details */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/vehicles" element={<FleetListing />} />
      <Route path="/vehicles/:id" element={<VehicleDetailsLanding />} />

      {/* Booking requires a logged-in client */}
      <Route
        path="/booking/:id"
        element={
          <ProtectedRoute role="client">
            <Booking />
          </ProtectedRoute>
        }
      />

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
        <Route path="bookings" element={<BookingManagement />} />
        <Route path="bookings/history" element={<BookingHistory />} />
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
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
