import {
  Package,
  ClipboardList,
  Wrench,
  CalendarDays,
} from "lucide-react";

import StatCard from "../../components/dashboard/StatCard";
import DashboardCharts from "../../components/dashboard/DashboardCharts";
import QuickActions from "../../components/dashboard/QuickActions";
import RecentActivities from "../../components/dashboard/RecentActivities";

function Dashboard() {
  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Dashboard
        </h1>

        <p className="mt-2 text-slate-500">
          Welcome back! Here's an overview of your organization's assets.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Total Assets"
          value="325"
          icon={Package}
          color="bg-blue-600"
        />

        <StatCard
          title="Allocated Assets"
          value="210"
          icon={ClipboardList}
          color="bg-green-600"
        />

        <StatCard
          title="Maintenance"
          value="18"
          icon={Wrench}
          color="bg-orange-500"
        />

        <StatCard
          title="Resource Bookings"
          value="42"
          icon={CalendarDays}
          color="bg-purple-600"
        />

      </div>

      {/* Charts Section */}
      <DashboardCharts />

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Recent Activities */}
        <RecentActivities />

        {/* Quick Actions */}
        <QuickActions />

      </div>

    </div>
  );
}

export default Dashboard;