import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Reusable custom tooltip
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0];
  return (
    <div className="rounded-md border bg-background p-2 shadow-sm">
      <div className="text-sm font-medium">{label}</div>
      <div className="text-sm text-muted-foreground">{`${
        data.name || data.dataKey
      }: ${data.value}`}</div>
    </div>
  );
};

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"];

export default function DashboardCharts() {
  const [topModels, setTopModels] = useState([]);
  const [borrowStatusData, setBorrowStatusData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    axios
      .get("/api/stats/top-models")
      .then((res) => setTopModels(res.data))
      .catch(console.error);
    axios
      .get("/api/stats/borrow-status")
      .then((res) => setBorrowStatusData(res.data))
      .catch(console.error);
    axios
      .get("/api/stats/monthly-requests")
      .then((res) => setMonthlyData(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {/* Most Borrowed Models */}
      <Card>
        <CardHeader>
          <CardTitle>Most Borrowed Models</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topModels}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Borrow Requests by Status */}
      <Card>
        <CardHeader>
          <CardTitle>Borrow Requests by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={borrowStatusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
              >
                {borrowStatusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Borrow Requests per Month */}
      <Card>
        <CardHeader>
          <CardTitle>Borrow Requests per Month</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#8884d8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
