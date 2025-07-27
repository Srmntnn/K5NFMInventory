import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import dayjs from "dayjs";

// Helper to get date of ISO week number
function getDateOfISOWeek(w, y) {
  const simple = new Date(y, 0, 1 + (w - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  return ISOweekStart;
}

export default function ItemsChartCard() {
  const [range, setRange] = useState("month");
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get(
        `${import.meta.env.VITE_BACKEND_URL}/api/analytics/items?range=${range}`
      )
      .then((res) => setData(res.data))
      .catch((err) => console.error("Failed to fetch item chart data:", err));
  }, [range]);

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 p-6 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left w-full">
          <CardTitle>Items Added</CardTitle>
          <CardDescription>New items added by {range}</CardDescription>
        </div>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="max-w-[160px] rounded-lg sm:ml-auto">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="week" className="rounded-lg">
              Last 7 days
            </SelectItem>
            <SelectItem value="month" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="year" className="rounded-lg">
              Last 12 months
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-1 pt-2 sm:px-3 sm:pt-6">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={true}
              axisLine={true}
              interval={1}
              angle={0}
              height={50}
              tick={{ fontSize: 12 }}
              tickFormatter={(label) => {
                if (range === "week" || range === "month") {
                  const date = new Date(label);
                  if (!isNaN(date)) {
                    return date.toLocaleDateString("en-PH", {
                      month: "short",
                      day: "numeric",
                    });
                  }
                  return label;
                }
                if (range === "year") {
                  return label;
                }
                return label;
              }}
            />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: "0.5rem",
                padding: "0.75rem",
                fontSize: "14px",
              }}
              labelStyle={{ fontWeight: "600", fontSize: "14px" }}
              labelFormatter={(label) => {
                const date = new Date(label);
                if (range === "year") {
                  return label;
                }

                if (range === "week") {
                  return `Week of ${date.toLocaleDateString("en-PH", {
                    timeZone: "Asia/Manila",
                    month: "short",
                    day: "numeric",
                  })}`;
                }

                if (range === "month") {
                  return date.toLocaleDateString("en-PH", {
                    timeZone: "Asia/Manila",
                    month: "short",
                    day: "numeric",
                  });
                }

                return label;
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorCount)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
