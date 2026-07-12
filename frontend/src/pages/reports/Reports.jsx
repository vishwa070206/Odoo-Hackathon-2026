import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  Area,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  BarChart2,
  Activity,
  Download,
  Wrench,
  FolderSync,
  CalendarDays,
  ClipboardCheck,
  Clock,
  AlertTriangle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { dashboardApi } from "../../api/dashboardApi";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899"];

// CSV Export helper
function downloadCSV(filename, rows) {
  if (!rows || rows.length === 0) { toast.error("No data to export."); return; }
  const header = Object.keys(rows[0]).join(",");
  const body = rows.map(r => Object.values(r).map(v => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([`${header}\n${body}`], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── Custom Tooltip ──────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-xs">
      {label && <p className="font-bold text-slate-900 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {typeof p.value === "number" && p.value > 999 ? `$${p.value.toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  );
};

// ─── KPI Summary Card ────────────────────────────────────────
const KpiCard = ({ label, value, sub, icon: Icon, color }) => (
  <Card className="flex justify-between items-start">
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <h3 className="text-3xl font-bold text-slate-900 mt-2">{value}</h3>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
    <div className={`p-3 rounded-xl border ${color}`}>
      <Icon className="h-5 w-5" />
    </div>
  </Card>
);

function Reports() {
  const [kpis, setKpis] = useState(null);
  const [utilization, setUtilization] = useState([]);
  const [deptAlloc, setDeptAlloc] = useState([]);
  const [maintenanceCost, setMaintenanceCost] = useState([]);
  const [auditSummary, setAuditSummary] = useState(null);
  const [upcomingReturns, setUpcomingReturns] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [kpiData, util, dept, maint, audit, returns, heat] = await Promise.all([
          dashboardApi.getKPIs(),
          dashboardApi.getAssetUtilization(),
          dashboardApi.getDepartmentAllocation(),
          dashboardApi.getMaintenanceCost(),
          dashboardApi.getAuditSummary(),
          dashboardApi.getUpcomingReturns(),
          dashboardApi.getBookingHeatmap(),
        ]);

        setKpis(kpiData);
        setUtilization(util.map(i => ({ name: i.lifecycleStatus.replace("_", " "), value: i._count })));
        setDeptAlloc(dept.map(i => ({
          dept: i.name.length > 12 ? i.name.substring(0, 12) + "…" : i.name,
          assets: i._count.assets,
          members: i._count.members,
        })));
        setMaintenanceCost(maint.map(i => ({
          priority: i.priority,
          tickets: i._count,
          cost: Number(i._sum.cost || 0),
        })));
        setAuditSummary(audit);
        setUpcomingReturns(returns);
        setHeatmap(heat || []);
      } catch (err) {
        toast.error("Failed to load reports data.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  // Utilization for bar chart (most-used vs idle)
  const idleVsActive = utilization.map(u => ({
    status: u.name,
    count: u.value,
    fill: u.name === "AVAILABLE" ? "#10b981" : u.name === "ALLOCATED" ? "#6366f1" : u.name === "UNDER MAINTENANCE" ? "#f59e0b" : "#ef4444",
  }));

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Operational insights — utilization, maintenance trends, department summaries, and booking patterns.</p>
        </div>
        <Button
          variant="secondary"
          className="w-auto py-2.5 px-4 text-xs font-semibold flex items-center gap-2"
          onClick={() => downloadCSV("assetflow-report.csv", [
            ...deptAlloc.map(d => ({ type: "Department", name: d.dept, assets: d.assets, members: d.members })),
            ...maintenanceCost.map(m => ({ type: "Maintenance", priority: m.priority, tickets: m.tickets, cost: m.cost })),
          ])}
        >
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Assets" value={kpis?.totalAssets ?? 0} sub="All registered assets" icon={BarChart2} color="bg-indigo-50 border-indigo-200 text-indigo-500" />
        <KpiCard label="Available" value={kpis?.availableAssets ?? 0} sub="Ready for allocation" icon={TrendingUp} color="bg-emerald-50 border-emerald-200 text-emerald-500" />
        <KpiCard label="Overdue Returns" value={kpis?.overdueReturns ?? 0} sub="Action required" icon={AlertTriangle} color="bg-rose-50 border-rose-200 text-rose-500" />
        <KpiCard label="Active Bookings" value={kpis?.activeBookings ?? 0} sub="Ongoing reservations" icon={CalendarDays} color="bg-amber-50 border-amber-200 text-amber-500" />
      </div>

      {/* Row 1: Utilization + Dept Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Utilization Donut */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-slate-800 text-sm">Asset Utilization Breakdown</h4>
            <button onClick={() => downloadCSV("utilization.csv", utilization.map(u => ({ status: u.name, count: u.value })))} className="text-xs text-indigo-600 hover:underline flex items-center gap-1"><Download className="h-3 w-3" /></button>
          </div>
          <div className="h-56 flex flex-col items-center justify-center">
            {utilization.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="75%">
                  <PieChart>
                    <Pie data={utilization} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                      {utilization.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-1">
                  {utilization.map((u, i) => (
                    <div key={u.name} className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-slate-500">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      {u.name} ({u.value})
                    </div>
                  ))}
                </div>
              </>
            ) : <p className="text-slate-400 text-sm">No data</p>}
          </div>
        </Card>

        {/* Department Allocation Bar */}
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-slate-800 text-sm">Department-wise Allocation</h4>
            <button onClick={() => downloadCSV("dept-allocation.csv", deptAlloc)} className="text-xs text-indigo-600 hover:underline flex items-center gap-1"><Download className="h-3 w-3" /></button>
          </div>
          <div className="h-56">
            {deptAlloc.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptAlloc} margin={{ top: 0, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="dept" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={28} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="assets" name="Allocated Assets" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="members" name="Team Members" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-slate-400 text-sm text-center pt-20">No data</p>}
          </div>
        </Card>
      </div>

      {/* Row 2: Maintenance Trends + Upcoming Returns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Maintenance by Priority */}
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-slate-800 text-sm">Maintenance Frequency & Cost by Priority</h4>
            <button onClick={() => downloadCSV("maintenance-cost.csv", maintenanceCost)} className="text-xs text-indigo-600 hover:underline flex items-center gap-1"><Download className="h-3 w-3" /></button>
          </div>
          <div className="h-56">
            {maintenanceCost.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maintenanceCost} margin={{ top: 0, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="priority" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={28} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="tickets" name="Ticket Count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cost" name="Service Cost ($)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
                <Wrench className="h-10 w-10 text-slate-200" />
                <p className="text-sm">No maintenance tickets logged yet.</p>
              </div>
            )}
          </div>
        </Card>

        {/* Upcoming Returns Widget */}
        <Card>
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-slate-800 text-sm">Upcoming Returns</h4>
            <button onClick={() => downloadCSV("upcoming-returns.csv", upcomingReturns.map(r => ({ asset: r.asset.name, tag: r.asset.assetTag, employee: `${r.employee.firstName} ${r.employee.lastName}`, due: new Date(r.expectedReturnDate).toLocaleDateString() })))} className="text-xs text-indigo-600 hover:underline flex items-center gap-1"><Download className="h-3 w-3" /></button>
          </div>
          <div className="divide-y divide-slate-100 max-h-52 overflow-y-auto">
            {upcomingReturns.length > 0 ? upcomingReturns.map((r) => (
              <div key={r.id} className="py-2.5 flex justify-between items-center text-xs">
                <div>
                  <p className="font-semibold text-slate-800 line-clamp-1">{r.asset.name}</p>
                  <p className="text-slate-500">{r.employee.firstName} {r.employee.lastName}</p>
                </div>
                <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                  <Clock className="h-3 w-3" />
                  {new Date(r.expectedReturnDate).toLocaleDateString()}
                </span>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-400">
                <Clock className="h-8 w-8 text-slate-200" />
                <p className="text-xs">No returns in the next 7 days.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Row 3: Audit Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-slate-800 text-sm">Audit Cycle Summary</h4>
            <ClipboardCheck className="h-4 w-4 text-slate-400" />
          </div>
          <div className="space-y-3">
            {auditSummary ? (
              <>
                <div className="flex justify-between items-center py-2.5 border-b border-slate-100 text-xs">
                  <span className="text-slate-500 font-medium">Total Cycles</span>
                  <span className="font-bold text-slate-900">{auditSummary.totalCycles ?? 0}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-slate-100 text-xs">
                  <span className="text-slate-500 font-medium">Active Cycles</span>
                  <span className="font-bold text-indigo-600">{auditSummary.activeCycles ?? 0}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-slate-100 text-xs">
                  <span className="text-slate-500 font-medium">Verified Assets</span>
                  <span className="font-bold text-emerald-600">{auditSummary.verifiedItems ?? 0}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-slate-100 text-xs">
                  <span className="text-slate-500 font-medium">Missing Items</span>
                  <span className="font-bold text-rose-600">{auditSummary.missingItems ?? 0}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 text-xs">
                  <span className="text-slate-500 font-medium">Damaged Items</span>
                  <span className="font-bold text-amber-600">{auditSummary.damagedItems ?? 0}</span>
                </div>
              </>
            ) : (
              <p className="text-slate-400 text-sm text-center py-10">No audit data available.</p>
            )}
          </div>
        </Card>

        {/* Most-used vs Idle Assets */}
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-slate-800 text-sm">Asset Status Distribution — Idle vs Active</h4>
            <Activity className="h-4 w-4 text-slate-400" />
          </div>
          <div className="h-56">
            {idleVsActive.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={idleVsActive} layout="vertical" margin={{ top: 0, right: 16, left: 24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis type="category" dataKey="status" stroke="#94a3b8" fontSize={10} tickLine={false} width={100} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Asset Count" radius={[0, 4, 4, 0]}>
                    {idleVsActive.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-slate-400 text-sm text-center pt-20">No data</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Reports;