import React from "react";
import ItemsChartCard from "./components/ItemsChartCard";
import UserStatsCard from "./components/UserStatsCard";
import TopBorrowersChartCard from "./components/TopBorrowersChartCard";
import BorrowRequest from "./BorrowRequest";

function HomeDashboard() {
  return (
    <div className="space-y-6 px-4 md:px-6 pb-8">
      {/* Top charts row */}
      <h1 className="md:text-2xl text-xl font-bold bg-gradient-to-r from-[#3b82f6] to-[#ff3333] text-transparent bg-clip-text w-fit">Dashboard</h1>
      <div className="flex flex-col gap-4 md:flex-row md:gap-6">
        <div className="w-full md:w-1/2">
          <TopBorrowersChartCard />
        </div>
        <div className="w-full md:w-1/2">
          <UserStatsCard />
        </div>
      </div>

      {/* Bottom full-width chart */}
      <div className="w-full">
        <ItemsChartCard />
      </div>

      <div className="border rounded-lg">
        <BorrowRequest />
      </div>
    </div>
  );
}

export default HomeDashboard;
