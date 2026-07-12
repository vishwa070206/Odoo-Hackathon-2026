import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts";

import {
  assetDistribution,
  monthlyAllocation,
  maintenanceTrend,
} from "../../data/dashboardData";

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#ea580c",
];

function DashboardCharts() {
  return (
    <div className="grid gap-6 xl:grid-cols-3">

      {/* Pie Chart */}

      <div className="rounded-2xl bg-white p-6 shadow border">

        <h2 className="mb-4 text-xl font-semibold">
          Asset Distribution
        </h2>

        <ResponsiveContainer width="100%" height={250}>

          <PieChart>

            <Pie
              data={assetDistribution}
              dataKey="value"
              outerRadius={80}
              label
            >
              {assetDistribution.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index]}
                />
              ))}
            </Pie>

            <Tooltip />

          </PieChart>

        </ResponsiveContainer>

      </div>

      {/* Bar Chart */}

      <div className="rounded-2xl bg-white p-6 shadow border">

        <h2 className="mb-4 text-xl font-semibold">
          Monthly Allocation
        </h2>

        <ResponsiveContainer width="100%" height={250}>

          <BarChart data={monthlyAllocation}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="assets"
              fill="#2563eb"
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

      {/* Line Chart */}

      <div className="rounded-2xl bg-white p-6 shadow border">

        <h2 className="mb-4 text-xl font-semibold">
          Maintenance Trend
        </h2>

        <ResponsiveContainer width="100%" height={250}>

          <LineChart data={maintenanceTrend}>

            <CartesianGrid strokeDasharray="3 3"/>

            <XAxis dataKey="month"/>

            <YAxis/>

            <Tooltip/>

            <Legend/>

            <Line
              type="monotone"
              dataKey="count"
              stroke="#ea580c"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}

export default DashboardCharts;