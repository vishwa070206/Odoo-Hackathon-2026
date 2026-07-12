import { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Box,
  CalendarDays,
  Wrench,
  ClipboardCheck,
  Building2,
  Users,
  Settings,
  Bell,
  LogOut,
  Menu,
  ChevronLeft,
  Search,
  User,
  Shield,
  FileText,
  Activity,
  FolderOpen
} from "lucide-react";
import { notificationApi } from "../api/notificationApi"; // We can also import direct from file
import Logo from "../components/ui/Logo";

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const token = localStorage.getItem("accessToken");
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  useEffect(() => {
    if (!token || !user) return;

    // Fetch unread count and notifications on mount
    const fetchNotifications = async () => {
      try {
        const { count } = await notificationApi.getUnreadCount();
        setUnreadNotifications(count);
        
        const response = await notificationApi.listNotifications({ limit: 5 });
        setNotifications(response.data);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // 10s poll

    return () => clearInterval(interval);
  }, [token]);

  // Click outside handlers
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleGlobalSearch = async (val) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      const { systemApi } = await import("../api/systemApi");
      const results = await systemApi.globalSearch(val);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    }
  };

  // Navigation Links based on user roles
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"] },
    { name: "Asset Directory", path: "/assets", icon: Box, roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"] },
    { name: "Asset Allocations", path: "/allocations", icon: FolderOpen, roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"] },
    { name: "Resource Bookings", path: "/bookings", icon: CalendarDays, roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"] },
    { name: "Maintenance requests", path: "/maintenance", icon: Wrench, roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"] },
    { name: "Audit cycles", path: "/audits", icon: ClipboardCheck, roles: ["ADMIN", "ASSET_MANAGER"] },
    { name: "Departments Setup", path: "/departments", icon: Building2, roles: ["ADMIN"] },
    { name: "Employee Directory", path: "/employees", icon: Users, roles: ["ADMIN"] },
    { name: "Activity Logs", path: "/logs", icon: Activity, roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"] },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <motion.aside
        animate={{ width: sidebarOpen ? "260px" : "80px" }}
        className="hidden md:flex flex-col bg-slate-900 border-r border-slate-800 flex-shrink-0"
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <AnimatePresence mode="wait">
            {sidebarOpen ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Logo className="h-6 text-indigo-400" />
              </motion.div>
            ) : (
              <span className="text-xl font-black text-indigo-500 mx-auto">AF</span>
            )}
          </AnimatePresence>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 transition"
          >
            <ChevronLeft className={`h-5 w-5 transform transition-transform ${!sidebarOpen && "rotate-180"}`} />
          </button>
        </div>

        {/* Links list */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems
            .filter((item) => item.roles.includes(user.role))
            .map((item) => {
              const active = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                    active
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${active ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`} />
                  {sidebarOpen && <span className="font-medium text-sm">{item.name}</span>}
                  
                  {/* Tooltip on collapsed state */}
                  {!sidebarOpen && (
                    <div className="absolute left-20 bg-slate-800 text-slate-100 text-xs font-semibold px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-slate-700 z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-md">
              {user.firstName[0]}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-slate-200">{user.firstName} {user.lastName}</p>
                <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase mt-0.5">
                  {user.roleLabel}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar navigation Header */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-40">
          <div className="flex items-center gap-4 flex-1">
            <button className="md:hidden text-slate-400 p-1 hover:bg-slate-800 rounded-lg">
              <Menu className="h-6 w-6" />
            </button>

            {/* Global search */}
            <div className="relative max-w-md w-full hidden sm:block">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleGlobalSearch(e.target.value)}
                placeholder="Search assets, tag, departments..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              
              {/* Search dropdown results */}
              {searchResults && (searchQuery.trim().length > 0) && (
                <div className="absolute top-12 left-0 w-full bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 space-y-4 max-h-96 overflow-y-auto">
                  {searchResults.assets?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assets</p>
                      {searchResults.assets.map(a => (
                        <Link to={`/assets/${a.id}`} onClick={() => setSearchResults(null)} key={a.id} className="flex justify-between items-center py-2 px-3 hover:bg-slate-800 rounded-lg transition text-sm">
                          <span>{a.name}</span>
                          <span className="text-xs font-mono text-indigo-400">{a.assetTag}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  {searchResults.users?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Employees</p>
                      {searchResults.users.map(u => (
                        <Link to="/employees" onClick={() => setSearchResults(null)} key={u.id} className="flex justify-between items-center py-2 px-3 hover:bg-slate-800 rounded-lg transition text-sm">
                          <span>{u.firstName} {u.lastName}</span>
                          <span className="text-xs text-slate-400">{u.email}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  {searchResults.departments?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Departments</p>
                      {searchResults.departments.map(d => (
                        <Link to="/departments" onClick={() => setSearchResults(null)} key={d.id} className="flex justify-between items-center py-2 px-3 hover:bg-slate-800 rounded-lg transition text-sm">
                          <span>{d.name}</span>
                          <span className="text-xs font-mono text-emerald-400">{d.code}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  {(!searchResults.assets?.length && !searchResults.users?.length && !searchResults.departments?.length) && (
                    <p className="text-sm text-slate-400 text-center py-4">No results found for "{searchQuery}"</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Header actions (Notifs, Profile) */}
          <div className="flex items-center gap-4">
            
            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-indigo-600 rounded-full text-[9px] font-bold text-white flex items-center justify-center border border-slate-900">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
                  >
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                      <h3 className="font-semibold text-sm">Notifications</h3>
                      <button onClick={async () => {
                        await notificationApi.markAllAsRead();
                        setUnreadNotifications(0);
                      }} className="text-xs text-indigo-400 hover:underline">Mark all read</button>
                    </div>
                    <div className="divide-y divide-slate-800 max-h-64 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div key={n.id} className={`p-4 text-xs transition hover:bg-slate-800/50 ${!n.isRead && "bg-indigo-950/20"}`}>
                            <p className="font-semibold text-slate-200">{n.title}</p>
                            <p className="text-slate-400 mt-1">{n.message}</p>
                            <span className="text-[10px] text-slate-500 block mt-2">{new Date(n.createdAt).toLocaleDateString()}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-400 text-center py-6 text-xs">No notifications yet.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800 transition"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center font-bold text-white">
                  {user.firstName[0]}
                </div>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 space-y-1"
                  >
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-sm font-semibold truncate text-slate-200">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-rose-400 hover:bg-rose-500/10 text-sm font-medium transition"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        {/* Dashboard Main Scrollable View */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
