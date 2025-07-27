import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

export default function TopBorrowersChartCard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/analytics/top-borrowers`)
      .then((res) => setData(res.data))
      .catch((err) => console.error("Failed to fetch top borrowers:", err));
  }, []);

  return (
    <Card className="w-full max-w-full h-full">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-6 sm:py-6">
          <CardTitle className="text-base">Top Borrowers</CardTitle>
          <CardDescription className=" text-muted-foreground">
            This month's most active users
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pt-0 px-4">
        <div className="w-full h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                tickMargin={8}
                axisLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.slice(0, 6)}
              />
              <Tooltip />
              <Bar
                dataKey="borrowCount"
                fill="#3b82f6"
                radius={[4, 4, 4, 4]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>

      <CardFooter className="flex-col items-start gap-1 px-4 pb-4 text-xs">
        <div className="flex items-center gap-1 font-medium text-sm">
          Trending up by 12% this month <TrendingUp className="h-3 w-3" />
        </div>
        <p className="text-muted-foreground">
          Showing top 5 borrowers for the current month
        </p>
      </CardFooter>
    </Card>
  );
}
