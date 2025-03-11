"use client";

import Sidebar from "@/components/ui/sidebar";
import DashboardHeader from "@/components/ui/dashboardheader";
import RoomCards from "@/components/ui/roomcards";
import Logs from "@/components/ui/logs";
import Graph from "@/components/ui/graph";
import TemperatureMonitor from "@/components/ui/temperaturemonitor";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-[#F5F3EF]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1">
        <DashboardHeader />

        <main className="p-6">
          {/* Room Cards */}
          <RoomCards />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Access Logs */}
            <div className="lg:col-span-2">
              <Logs />
            </div>

            {/* Temperature Monitoring */}
            <div>
              <TemperatureMonitor />
            </div>

            {/* Statistics */}
            <div className="lg:col-span-2">
              <Graph />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}