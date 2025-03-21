"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/ui/sidebar";
import ResponsiveSidebar from '@/components/ui/responsidebar';
import Header from '@/components/header';
import DashboardHeader from "@/components/ui/dashboardheader";
import { apiRoom, apiReq } from "@/utility/axiosInstance"; 

export default function RoomAccessLog() {
  const { roomId } = useParams();
  const router = useRouter();
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [firstName, setFirstName] = useState("User");

  useEffect(() => {
    const checkAuthorization = () => {
      const user = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login?error=Please log in to access the dashboard");
        return;
      }

      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        const role = decoded.role;

        if (role === "teacher" || role === "admin") {
          setIsAuthorized(true);
        } else {
          router.push("/?error=Unauthorized access");
          setIsAuthorized(false);
        }
      } catch (error) {
        router.push("/login?error=Invalid token");
        setIsAuthorized(false);
      }

      if (user) {
        try {
          const parsedUser = JSON.parse(user);
          setFirstName(parsedUser.first_name || "User");
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    };

    checkAuthorization();
  }, [router]);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!roomId || !isAuthorized) return;

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found");
        }

        const logsResponse = await apiRoom.get(`/room-usage-logs/room/${roomId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        let logs = logsResponse.data;

        console.log("Logs from API:", logs);

        // No backend send status or error use status from room_req
        if (!logs.every((log) => log.status)) {
          const requestsResponse = await apiReq.get(`/requests`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: { room_id: roomId },
          });
          const requests = requestsResponse.data;

          logs = logs.map((log) => {
            const matchingRequest = requests.find(
              (req) =>
                req.room_id === parseInt(roomId) &&
                req.student_id === log.user_id &&
                req.start_time === log.start_time &&
                req.end_time === log.end_time
            );
            return {
              ...log,
              status: matchingRequest ? matchingRequest.status : "A",
            };
          });
        }

        let logsWithUserData = logs.map((log) => ({
          id: log.logid,
          name: log.user_name || "Unknown",
          studentId: log.user_id ? log.user_id.toString() : "N/A",
          email: log.email || "N/A",
          bookingTime: `${new Date(log.start_time).toLocaleTimeString()} - ${new Date(log.end_time).toLocaleTimeString()}`,
          status: log.status || "A",
          checkIn: new Date(log.start_time).toLocaleTimeString(),
          checkOut: new Date(log.end_time).toLocaleTimeString(),
          roomID: roomId,
          photo: "/dummy-photo.jpg",
          startTime: log.start_time,
        }));

        logsWithUserData = logsWithUserData.filter(
          (log) => log.status === "A" || log.status === "R"
        );

        logsWithUserData.sort((a, b) => 
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );

        setFilteredLogs(logsWithUserData);
      } catch (error) {
        console.error("Error fetching logs:", error.response?.data || error.message);
        setFilteredLogs([]);
      }
    };

    fetchLogs();
  }, [roomId, isAuthorized]);

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#F5F3EF]">
      <Sidebar />
      <div className="flex-1">
        <DashboardHeader firstName={firstName} />
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[#221C3FFF] mb-4">Access Log for Room {roomId}</h1>

          <div className="bg-white p-6 shadow-md rounded-lg overflow-x-auto">
            <table className="w-full border-collapse rounded-lg">
              <thead className="bg-gray-200 text-left sticky top-0">
                <tr className="border-b text-gray-700">
                  <th className="p-3">Photo</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Student ID</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Booking Time</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Check-In</th>
                  <th className="p-3">Check-Out</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log, index) => (
                    <tr key={log.id} className={`border-b ${index % 2 === 0 ? "bg-gray-100" : "bg-white"} hover:bg-gray-50 transition`}>
                      <td className="p-3 text-center">
                        <img src={log.photo} alt={log.name} className="w-12 h-12 rounded-full mx-auto" />
                      </td>
                      <td className="p-3 font-medium text-gray-900">{log.name}</td>
                      <td className="p-3 text-gray-800">{log.studentId}</td>
                      <td className="p-3 text-gray-800">{log.email}</td>
                      <td className="p-3 text-gray-800">{log.bookingTime}</td>
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            log.status === "P" ? "bg-yellow-400 text-black" :
                            log.status === "A" ? "bg-green-500 text-white" :
                            log.status === "R" ? "bg-red-500 text-white" : "bg-gray-500 text-white"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3 text-gray-800">{log.checkIn}</td>
                      <td className="p-3 text-gray-800">{log.checkOut}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="p-3 text-center text-gray-500">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}