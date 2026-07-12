import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

// Auth Pages
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

// Dashboard / Modules Pages
import Dashboard from "../pages/Dashboard";
import AssetDirectory from "../pages/assets/AssetDirectory";
import AssetForm from "../pages/assets/AssetForm";
import AssetDetail from "../pages/assets/AssetDetail";
import Allocations from "../pages/allocations/Allocations";
import Bookings from "../pages/bookings/Bookings";
import Maintenance from "../pages/maintenance/Maintenance";
import Audits from "../pages/audit/Audits";
import Departments from "../pages/organization/Departments";
import Employees from "../pages/organization/Employees";
import Logs from "../pages/logs/Logs";

// Protected Route wrapper component
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
      {/* Public / Auth Pages */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Protected Modules Dashboard Pages */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Assets module */}
        <Route path="assets" element={<AssetDirectory />} />
        <Route path="assets/new" element={<AssetForm />} />
        <Route path="assets/edit/:id" element={<AssetForm />} />
        <Route path="assets/:id" element={<AssetDetail />} />

        {/* Allocations & bookings module */}
        <Route path="allocations" element={<Allocations />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="audits" element={<Audits />} />

        {/* Admin Setup */}
        <Route path="departments" element={<Departments />} />
        <Route path="employees" element={<Employees />} />
        <Route path="logs" element={<Logs />} />
      </Route>

      {/* Fallback Redirection */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;