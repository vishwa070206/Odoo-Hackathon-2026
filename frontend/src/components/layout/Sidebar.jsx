
import {
    LayoutDashboard,
    Building2,
    Package,
    ArrowRightLeft,
    CalendarDays,
    Wrench,
    ClipboardCheck,
    BarChart3,
    Bell,
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
        name: "Organization",
        path: "/organization",
        icon: Building2,
    },

    {
        name: "Assets",
        path: "/assets",
        icon: Package,
    },

    {
        name: "Allocation",
        path: "/allocation",
        icon: ArrowRightLeft,
    },

    {
        name: "Booking",
        path: "/booking",
        icon: CalendarDays,
    },

    {
        name: "Maintenance",
        path: "/maintenance",
        icon: Wrench,
    },

    {
        name: "Audit",
        path: "/audit",
        icon: ClipboardCheck,
    },

    {
        name: "Reports",
        path: "/reports",
        icon: BarChart3,
    },

    {
        name: "Notifications",
        path: "/notifications",
        icon: Bell,
    },

];

function Sidebar() {

    return (

        <aside className="w-72 bg-white border-r shadow-sm">

            <div className="p-6">

                <h1 className="text-2xl font-bold text-blue-600">

                    AssetFlow

                </h1>

            </div>

            <nav className="px-4">

                {

                    menu.map((item) => (

                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-xl px-4 py-3 mb-2 transition ${
                                    isActive
                                        ? "bg-blue-600 text-white"
                                        : "hover:bg-slate-100"
                                }`
                            }
                        >
                            <item.icon size={20} />

                            {item.name}

                        </NavLink>

                    ))

                }

            </nav>

            <div className="absolute bottom-6 left-6">

                <button className="flex items-center gap-2 text-red-500">

                    <LogOut size={20} />

                    Logout

                </button>

            </div>

        </aside>

    );

}

export default Sidebar;