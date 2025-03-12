"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/ui/sidebar";
import DashboardHeader from "@/components/ui/dashboardheader";
import RoomCards from "@/components/ui/roomcards";
import Logs from "@/components/ui/logs";
import Graph from "@/components/ui/graph";
import TemperatureMonitor from "@/components/ui/temperaturemonitor";

export default function Dashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null); // Track authorization status

  useEffect(() => {
    // Check for token in localStorage
    const token = localStorage.getItem("token");

    if (!token) {
      // No token found, redirect to login
      router.push("/login?error=Please log in to access the dashboard");
      return;
    }

    try {
      // Decode the token to get the role
      const decoded = JSON.parse(atob(token.split(".")[1]));
      const role = decoded.role;

      // Allow access only for teacher or admin roles
      if (role === "teacher" || role === "admin") {
        setIsAuthorized(true);
      } else {
        // Unauthorized role, redirect to homepage
        router.push("/?error=Unauthorized access");
        setIsAuthorized(false);
      }
    } catch (error) {
      // Invalid token, redirect to login
      console.error("Token decoding failed:", error);
      router.push("/login?error=Invalid token");
      setIsAuthorized(false);
    }
  }, [router]);

  // Show loading state while checking authorization
  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  // If not authorized, return null (redirection is handled in useEffect)
  if (!isAuthorized) {
    return null;
  }

  // Render the dashboard if authorized
  return (
    <div className="flex min-h-screen bg-[#F5F3EF]">
      <Sidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="p-6">
          <RoomCards />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Logs />
            </div>
            <div>
              <TemperatureMonitor />
            </div>
            <div className="lg:col-span-2">
              <Graph />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}