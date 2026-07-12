import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

// Auth Pages
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

// Dashboard
import Dashboard from "../pages/dashboard/Dashboard";

// Assets
import AssetDirectory from "../pages/assets/AssetDirectory";
import AssetForm from "../pages/assets/AssetForm";
import AssetDetail from "../pages/assets/AssetDetail";

// Modules
import Allocations from "../pages/allocations/Allocations";
import Bookings from "../pages/bookings/Bookings";
import Maintenance from "../pages/maintenance/Maintenance";
import Audits from "../pages/audit/Audits";

// Organization
import Departments from "../pages/organization/Departments";
import Employees from "../pages/organization/Employees";

// Logs
import Logs from "../pages/logs/Logs";

// (Create these pages in future steps)
import Notifications from "../pages/notifications/Notifications";
import Reports from "../pages/reports/Reports";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* ================= Authentication ================= */}

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* ================= Protected Area ================= */}

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Default */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard */}
        <Route path="dashboard" element={<Dashboard />} />

        {/* Organization */}
        <Route path="departments" element={<Departments />} />
        <Route path="employees" element={<Employees />} />

        {/* Assets */}
        <Route path="assets" element={<AssetDirectory />} />
        <Route path="assets/new" element={<AssetForm />} />
        <Route path="assets/edit/:id" element={<AssetForm />} />
        <Route path="assets/:id" element={<AssetDetail />} />

        {/* Allocation */}
        <Route path="allocations" element={<Allocations />} />

        {/* Bookings */}
        <Route path="bookings" element={<Bookings />} />

        {/* Maintenance */}
        <Route path="maintenance" element={<Maintenance />} />

        {/* Audits */}
        <Route path="audits" element={<Audits />} />

        {/* Reports */}
        <Route path="reports" element={<Reports />} />

        {/* Notifications */}
        <Route path="notifications" element={<Notifications />} />

        {/* Logs */}
        <Route path="logs" element={<Logs />} />
      </Route>

      {/* ================= Invalid Routes ================= */}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;