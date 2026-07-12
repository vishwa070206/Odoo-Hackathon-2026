import {
  LayoutDashboard,
  Building2,
  Package,
  ArrowRightLeft,
  CalendarDays,
  Wrench,
  ClipboardCheck,
  Bell,
  FileText,
  Users,
  LogOut,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menu = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },

  {
    name: "Departments",
    path: "/departments",
    icon: Building2,
  },

  {
    name: "Employees",
    path: "/employees",
    icon: Users,
  },

  {
    name: "Assets",
    path: "/assets",
    icon: Package,
  },

  {
    name: "Allocations",
    path: "/allocations",
    icon: ArrowRightLeft,
  },

  {
    name: "Bookings",
    path: "/bookings",
    icon: CalendarDays,
  },

  {
    name: "Maintenance",
    path: "/maintenance",
    icon: Wrench,
  },

  {
    name: "Audits",
    path: "/audits",
    icon: ClipboardCheck,
  },

  {
    name: "Logs",
    path: "/logs",
    icon: FileText,
  },

  {
    name: "Notifications",
    path: "/notifications",
    icon: Bell,
  },
];

function Sidebar() {
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  };

  return (
    <aside className="flex h-screen w-72 flex-col border-r bg-white shadow-sm">
      {/* Logo */}
      <div className="border-b p-6">
        <h1 className="text-3xl font-bold text-blue-600">
          AssetFlow
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Enterprise Asset Management
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `mb-2 flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-700 hover:bg-slate-100"
              }`
            }
          >
            <item.icon size={20} />

            <span className="font-medium">
              {item.name}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-600 transition hover:bg-red-50"
        >
          <LogOut size={20} />

          <span className="font-medium">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;