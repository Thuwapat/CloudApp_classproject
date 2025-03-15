"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/ui/sidebar";
import DashboardHeader from "@/components/ui/dashboardheader";
import { apiRoom, apiAuth } from "@/utility/axiosInstance";

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

        // ดึง logs จาก room_mgmt_backend
        const logsResponse = await apiRoom.get(`/room-usage-logs/room/${roomId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const logs = logsResponse.data;

        // ดึงข้อมูลผู้ใช้สำหรับแต่ละ log
        const logsWithUserData = await Promise.all(
          logs.map(async (log) => {
            try {
              // สร้าง internal token สำหรับเรียก authen_backend (สมมติว่า frontend ต้องส่ง token ที่มี role admin)
              const internalToken = token; // ในความเป็นจริง อาจต้องสร้าง token ใหม่หรือใช้ token เดิม

              const userResponse = await apiAuth.post(
                "/validate-user-by-id",
                { user_id: log.user_id },
                {
                  headers: {
                    Authorization: `Bearer ${internalToken}`,
                  },
                }
              );
              const user = userResponse.data;

              return {
                id: log.logid,
                name: `${user.first_name} ${user.last_name}`,
                studentId: user.id.toString(), // สมมติว่าไม่มี studentId ใช้ user.id แทน
                email: user.email,
                bookingTime: `${new Date(log.start_time).toLocaleTimeString()} - ${new Date(log.end_time).toLocaleTimeString()}`,
                status: "A", // สมมติว่าเป็น Approved
                checkIn: new Date(log.start_time).toLocaleTimeString(),
                checkOut: new Date(log.end_time).toLocaleTimeString(),
                roomID: roomId,
                photo: "/dummy-photo.jpg", // Dummy photo
              };
            } catch (error) {
              console.error(`Error fetching user data for user_id ${log.user_id}:`, error);
              return {
                id: log.logid,
                name: "Unknown",
                studentId: "N/A",
                email: "N/A",
                bookingTime: `${new Date(log.start_time).toLocaleTimeString()} - ${new Date(log.end_time).toLocaleTimeString()}`,
                status: "A",
                checkIn: new Date(log.start_time).toLocaleTimeString(),
                checkOut: new Date(log.end_time).toLocaleTimeString(),
                roomID: roomId,
                photo: "/dummy-photo.jpg",
              };
            }
          })
        );

        setFilteredLogs(logsWithUserData);
      } catch (error) {
        console.error("Error fetching logs:", error);
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
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">{log.status}</span>
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