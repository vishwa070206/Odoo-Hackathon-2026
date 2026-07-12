import { Outlet, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "../components/ui/Logo";

function AuthLayout() {
  const token = localStorage.getItem("accessToken");

  // Redirect authenticated users to dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Left decorative/marketing panel (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 border-r border-slate-800 text-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <Logo className="h-8 text-indigo-400" />
        </div>

        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 via-slate-100 to-indigo-200 bg-clip-text text-transparent"
          >
            AssetFlow
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-slate-400 leading-relaxed"
          >
            Enterprise Asset & Resource Management System. Track lifecycle, schedule resources, orchestrate maintenance, and audit compliance with ease.
          </motion.p>
        </div>

        <div className="relative z-10 text-sm text-slate-500">
          © {new Date().getFullYear()} AssetFlow. All rights reserved.
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-16 lg:px-20 xl:px-24 bg-white text-slate-900">
        <div className="mx-auto w-full max-w-md">
          {/* Logo visible only on mobile/tablet */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo className="h-10 text-indigo-600" />
          </div>
          
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
