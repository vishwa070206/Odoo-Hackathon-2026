import { Outlet } from "react-router-dom";
import { Building2, ShieldCheck, Laptop } from "lucide-react";

function AuthLayout() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">

      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 text-white p-16">

        <h1 className="text-5xl font-bold mb-6">
          AssetFlow ERP
        </h1>

        <p className="text-xl leading-8 opacity-90">
          Manage enterprise assets, employee allocations,
          maintenance, audits and bookings from one centralized
          platform.
        </p>

        <div className="mt-16 space-y-8">

          <div className="flex items-center gap-4">
            <Building2 size={42}/>
            <div>
              <h3 className="font-semibold text-xl">
                Asset Tracking
              </h3>

              <p className="opacity-80">
                Monitor assets in real time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Laptop size={42}/>
            <div>
              <h3 className="font-semibold text-xl">
                Resource Booking
              </h3>

              <p className="opacity-80">
                Book meeting rooms and shared equipment.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ShieldCheck size={42}/>
            <div>
              <h3 className="font-semibold text-xl">
                Secure Enterprise Access
              </h3>

              <p className="opacity-80">
                Role-based authentication with JWT.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Right Panel */}

      <div className="flex items-center justify-center p-8">

        <Outlet />

      </div>

    </div>
  );
}

export default AuthLayout;