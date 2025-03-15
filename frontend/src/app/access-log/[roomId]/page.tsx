"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Sidebar from "@/components/ui/sidebar";
import DashboardHeader from "@/components/ui/dashboardheader";

const dummyLogs = [
    // Room 101
    { id: 1, name: "John Doe", studentId: "123456", email: "john@example.com", bookingTime: "16:00 - 18:00", status: "A", checkIn: "16:05", checkOut: "18:00", roomID: "101", photo: "/dummy-photo1.jpg" },
    { id: 2, name: "Jane Smith", studentId: "654321", email: "jane@example.com", bookingTime: "13:00 - 16:00", status: "A", checkIn: "13:00", checkOut: "16:02", roomID: "101", photo: "/dummy-photo2.jpg" },
    { id: 3, name: "Bob White", studentId: "789012", email: "bob@example.com", bookingTime: "14:00 - 17:00", status: "A", checkIn: "14:10", checkOut: "17:00", roomID: "101", photo: "/dummy-photo3.jpg" },
    // Room 102
    { id: 4, name: "Alice Brown", studentId: "234567", email: "alice@example.com", bookingTime: "10:00 - 12:00", status: "A", checkIn: "10:05", checkOut: "12:00", roomID: "102", photo: "/dummy-photo4.jpg" },
    { id: 5, name: "Tom Hanks", studentId: "345678", email: "tom@example.com", bookingTime: "12:00 - 14:00", status: "A", checkIn: "12:10", checkOut: "14:00", roomID: "102", photo: "/dummy-photo5.jpg" },
    { id: 6, name: "Sophia Lee", studentId: "456789", email: "sophia@example.com", bookingTime: "14:00 - 16:00", status: "A", checkIn: "14:05", checkOut: "16:00", roomID: "102", photo: "/dummy-photo6.jpg" },
  
    // Room 103
    { id: 7, name: "Ethan Hunt", studentId: "567890", email: "ethan@example.com", bookingTime: "16:00 - 18:00", status: "A", checkIn: "16:15", checkOut: "18:00", roomID: "103", photo: "/dummy-photo7.jpg" },
    { id: 8, name: "Olivia Adams", studentId: "678901", email: "olivia@example.com", bookingTime: "18:00 - 20:00", status: "A", checkIn: "18:10", checkOut: "20:00", roomID: "103", photo: "/dummy-photo8.jpg" },
    { id: 9, name: "Jack Sparrow", studentId: "789012", email: "jack@example.com", bookingTime: "20:00 - 22:00", status: "A", checkIn: "20:05", checkOut: "22:00", roomID: "103", photo: "/dummy-photo9.jpg" },
  
    // Room 104
    { id: 10, name: "Emma Watson", studentId: "890123", email: "emma@example.com", bookingTime: "08:00 - 10:00", status: "A", checkIn: "08:05", checkOut: "10:00", roomID: "104", photo: "/dummy-photo10.jpg" },
    { id: 11, name: "Daniel Craig", studentId: "901234", email: "daniel@example.com", bookingTime: "10:00 - 12:00", status: "A", checkIn: "10:10", checkOut: "12:00", roomID: "104", photo: "/dummy-photo11.jpg" },
    { id: 12, name: "Scarlett Johansson", studentId: "012345", email: "scarlett@example.com", bookingTime: "12:00 - 14:00", status: "A", checkIn: "12:05", checkOut: "14:00", roomID: "104", photo: "/dummy-photo12.jpg" },
  
    // Room 105
    { id: 13, name: "Chris Evans", studentId: "112345", email: "chris@example.com", bookingTime: "14:00 - 16:00", status: "A", checkIn: "14:05", checkOut: "16:00", roomID: "105", photo: "/dummy-photo13.jpg" },
    { id: 14, name: "Mark Ruffalo", studentId: "223456", email: "mark@example.com", bookingTime: "16:00 - 18:00", status: "A", checkIn: "16:10", checkOut: "18:00", roomID: "105", photo: "/dummy-photo14.jpg" },
    { id: 15, name: "Robert Downey Jr.", studentId: "334567", email: "robert@example.com", bookingTime: "18:00 - 20:00", status: "A", checkIn: "18:15", checkOut: "20:00", roomID: "105", photo: "/dummy-photo15.jpg" },
];

export default function RoomAccessLog() {
  const { roomId } = useParams();
  const router = useRouter();
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [firstName, setFirstName] = useState("User");

  useEffect(() => {
    if (!roomId) return;
    setFilteredLogs(dummyLogs.filter((log) => log.roomID === roomId));
  }, [roomId]);

  useEffect(() => {
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
  }, [router]);

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
