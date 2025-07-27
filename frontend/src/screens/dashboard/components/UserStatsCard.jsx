import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Users, UserCheck } from "lucide-react";
import dayjs from "dayjs";

const chartConfig = {
  users: {
    label: "Users",
    icon: <Users className="w-4 h-4 text-muted-foreground" />,
  }, 
  borrowers: {
    label: "Borrowers",
    icon: <UserCheck className="w-4 h-4 text-muted-foreground" />,
  },
};

export default function UserStatsCard() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [userStats, setUserStats] = useState([]);
  const [borrowStats, setBorrowStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState("users");

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/analytics/user-stats`)
      .then((res) => {
        setTotalUsers(res.data.totalUsers);

        // Format userStats for recharts
        const formattedUserStats = res.data.userStats.map((item) => ({
          label: dayjs(item.date).format("MMM D"),
          count: item.count,
        }));
        setUserStats(formattedUserStats);

        // Format borrowStats for recharts
        const formattedBorrowStats = res.data.borrowStats.map((item) => ({
          label: dayjs(item.date).format("MMM D"),
          count: item.count,
        }));
        setBorrowStats(formattedBorrowStats);
      })
      .catch((err) => console.error("Failed to fetch user stats:", err))
      .finally(() => setLoading(false));
  }, []);

  // Prepare chart data depending on active tab
  const chartData =
    activeChart === "users"
      ? userStats.length > 0
        ? userStats
        : [{ label: "No data", count: 0 }]
      : borrowStats.length > 0
      ? borrowStats
      : [{ label: "No data", count: 0 }];

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch h-full space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-6 sm:py-6">
          <CardTitle>User Statistics</CardTitle>
          <CardDescription>Showing system stats overview</CardDescription>
        </div>
        <div className="flex items-center">
          {["users", "borrowers"].map((key) => (
            <button
              key={key}
              data-active={activeChart === key}
              className="relative z-30 flex flex-1 flex-col items-center justify-center gap-1 border-t px-6 py-4 text-left mt-[-6px] even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-4"
              onClick={() => setActiveChart(key)}
            >
              <span className="text-xs text-muted-foreground">
                {chartConfig[key].label}
              </span>
              <span className="text-lg font-bold leading-none sm:text-3xl">
                {key === "users"
                  ? totalUsers.toLocaleString()
                  : borrowStats.reduce((acc, cur) => acc + cur.count, 0)}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="h-[250px] pt-4">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(label) => `${label}`}
                contentStyle={{ borderRadius: "0.5rem", padding: "0.5rem" }}
                labelStyle={{ fontWeight: "500" }}
              />
              <Bar
                dataKey="count"
                fill="var(--primary)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
