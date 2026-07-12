import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  AreaChart,
  Area
} from "recharts";
import {
  Box,
  Calendar,
  Wrench,
  AlertTriangle,
  FolderSync,
  TrendingUp,
  Clock,
  ExternalLink,
  Plus,
  BookOpen
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { dashboardApi } from "../../api/dashboardApi";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"];

function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [utilizationData, setUtilizationData] = useState([]);
  const [deptData, setDeptData] = useState([]);
  const [maintData, setMaintData] = useState([]);
  const [upcomingReturns, setUpcomingReturns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const isManagerOrAdmin = user && ["ADMIN", "ASSET_MANAGER"].includes(user.role);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch KPIs
        const kpiData = await dashboardApi.getKPIs();
        setKpis(kpiData);

        // Fetch Utilization data for Donut Chart
        const utilResponse = await dashboardApi.getAssetUtilization();
        const formattedUtil = utilResponse.map((item) => ({
          name: item.lifecycleStatus.replace("_", " "),
          value: item._count,
        }));
        setUtilizationData(formattedUtil);

        // Fetch Department allocation
        const deptResponse = await dashboardApi.getDepartmentAllocation();
        const formattedDept = deptResponse.map((item) => ({
          name: item.name.length > 15 ? `${item.name.substring(0, 15)}...` : item.name,
          assets: item._count.assets,
          employees: item._count.members,
        }));
        setDeptData(formattedDept);

        // Fetch Maintenance trends
        const maintResponse = await dashboardApi.getMaintenanceCost();
        const formattedMaint = maintResponse.map((item) => ({
          priority: item.priority,
          count: item._count,
          cost: Number(item._sum.cost || 0),
        }));
        setMaintData(formattedMaint);

        // Fetch Upcoming returns
        const returnsResponse = await dashboardApi.getUpcomingReturns();
        setUpcomingReturns(returnsResponse);
      } catch (err) {
        toast.error("Failed to load dashboard statistics.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Dashboard metric card component
  const MetricCard = ({ title, value, icon: Icon, color, subtext }) => (
    <Card className="flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-bold text-slate-100 mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-slate-800 border border-slate-700 text-${color}-400`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {subtext && <p className="text-slate-500 text-xs mt-4">{subtext}</p>}
    </Card>
  );

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header and Welcome */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Welcome Back, {user?.firstName}!</h1>
          <p className="text-sm text-slate-400">Here's what's happening with your organization's resources today.</p>
        </div>

        {/* Quick Actions Panel */}
        <div className="flex gap-3">
          {isManagerOrAdmin && (
            <Link to="/assets/new">
              <Button className="flex items-center gap-2 py-2.5 px-4 text-xs font-semibold">
                <Plus className="h-4 w-4" /> Register Asset
              </Button>
            </Link>
          )}
          <Link to="/bookings">
            <Button variant="secondary" className="flex items-center gap-2 py-2.5 px-4 text-xs font-semibold">
              <BookOpen className="h-4 w-4" /> Book Resource
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Assets Available"
          value={kpis?.availableAssets ?? 0}
          icon={Box}
          color="emerald"
          subtext={`Out of ${kpis?.totalAssets ?? 0} total assets`}
        />
        <MetricCard
          title="Assets Allocated"
          value={kpis?.allocatedAssets ?? 0}
          icon={FolderSync}
          color="indigo"
          subtext="Assigned to employees/depts"
        />
        <MetricCard
          title="Maintenance Requests"
          value={kpis?.maintenanceToday ?? 0}
          icon={Wrench}
          color="amber"
          subtext="Active service requests today"
        />
        <MetricCard
          title="Overdue Returns"
          value={kpis?.overdueReturns ?? 0}
          icon={AlertTriangle}
          color="rose"
          subtext="Action required immediately"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Asset Utilization pie chart */}
        <Card className="lg:col-span-1">
          <h4 className="font-semibold text-slate-200 text-sm mb-4">Asset Status Utilization</h4>
          <div className="h-64 flex flex-col justify-center items-center">
            {utilizationData.length > 0 ? (
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={utilizationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {utilizationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500 text-sm">No asset status data available.</p>
            )}
            {/* Custom Legend */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
              {utilizationData.map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-2 text-[10px] font-medium text-slate-400 uppercase">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {entry.name} ({entry.value})
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Department Summary bar chart */}
        <Card className="lg:col-span-2">
          <h4 className="font-semibold text-slate-200 text-sm mb-4">Department Asset Allocation</h4>
          <div className="h-64">
            {deptData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="assets" name="Allocated Assets" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="employees" name="Total Members" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500 text-sm text-center py-20">No department allocation data available.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Second Row Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Maintenance cost trends area/bar chart */}
        <Card className="lg:col-span-2">
          <h4 className="font-semibold text-slate-200 text-sm mb-4">Maintenance Spend by Priority</h4>
          <div className="h-64">
            {maintData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={maintData}>
                  <XAxis dataKey="priority" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area type="monotone" dataKey="cost" name="Service Cost ($)" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="count" name="Tickets count" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500 text-sm text-center py-20">No maintenance reports logged.</p>
            )}
          </div>
        </Card>

        {/* Upcoming Returns List Widget */}
        <Card className="lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-slate-200 text-sm">Upcoming Returns</h4>
            <Link to="/allocations" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
              View all <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          
          <div className="divide-y divide-slate-800 max-h-64 overflow-y-auto space-y-1">
            {upcomingReturns.length > 0 ? (
              upcomingReturns.map((alloc) => (
                <div key={alloc.id} className="py-3 flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-200">{alloc.asset.name}</p>
                    <p className="text-[10px] text-slate-400">User: {alloc.employee.firstName} {alloc.employee.lastName}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      <Clock className="h-3 w-3" />
                      {new Date(alloc.expectedReturnDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-center py-10 text-xs">No returns scheduled for the next 7 days.</p>
            )}
          </div>
        </Card>

      </div>
    </div>
  );
}

export default Dashboard;
