import { Navigate, Route, Routes } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import Dashboard from "../pages/dashboard/Dashboard";
import DashboardLayout from "../layouts/DashboardLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import Organization from "../pages/organization/Organization";
import Assets from "../pages/assets/Assets";
import Allocation from "../pages/allocation/Allocation";
import Booking from "../pages/booking/Booking";
import Maintenance from "../pages/maintenance/Maintenance";
import Audit from "../pages/audit/Audit";
import Reports from "../pages/reports/Reports";
import Notifications from "../pages/notifications/Notifications";

import DashboardLayout from "../layouts/DashboardLayout";
function AppRoutes() {

    return (

        <Routes>

            <Route path="/" element={<Navigate to="/login"/>}/>

            <Route element={<AuthLayout/>}>

                <Route
                    path="/login"
                    element={<Login/>}
                />

                <Route
                    path="/signup"
                    element={<Signup/>}
                />

                <Route
                    path="/forgot-password"
                    element={<ForgotPassword/>}
                />

                <Route
                    path="/reset-password"
                    element={<ResetPassword/>}
                />


            </Route>

        <Route element={<DashboardLayout />}>

  <Route
    path="/dashboard"
    element={<Dashboard />}
  />

  <Route
    path="/organization"
    element={<Organization />}
  />

  <Route
    path="/assets"
    element={<Assets />}
  />

  <Route
    path="/allocation"
    element={<Allocation />}
  />

  <Route
    path="/booking"
    element={<Booking />}
  />

  <Route
    path="/maintenance"
    element={<Maintenance />}
  />

  <Route
    path="/audit"
    element={<Audit />}
  />

  <Route
    path="/reports"
    element={<Reports />}
  />

  <Route
    path="/notifications"
    element={<Notifications />}
  />

</Route>   

        </Routes>

    )

}

export default AppRoutes;