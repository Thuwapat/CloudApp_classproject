"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/ui/sidebarrequest";
import DashboardHeader from "@/components/ui/dashboardheader";
import { apiReq } from "@/utility/axiosInstance";

interface Request {
  id: number;
  room_id: number;
  start_time: string;
  end_time: string;
  reason: string;
  status: string;
  requester_name: string;
}

export default function RequestStatus() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkAuthorization = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login?error=Please log in to access the dashboard");
        return;
      }

      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        const role = decoded.role;
        if (role !== "student") {
          router.push("/?error=Unauthorized access for students only");
        }
      } catch (error) {
        router.push("/login?error=Invalid token");
      }
    };

    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const user = JSON.parse(localStorage.getItem("user") || '{}');
        const studentId = user.user_id;
        console.log("Fetching requests with studentId:", studentId, "and token:", token);

        const response = await apiReq.get('/requests', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        let allRequests = response.data;
        console.log("Requests from API:", allRequests);

        // เรียงคำขอจากล่าสุดไปเก่าสุด (ตาม start_time)
        allRequests.sort((a: Request, b: Request) => 
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
        );

        // เลือกเฉพาะ 5 คำขอ ล่าสุด
        const latestRequests = allRequests.slice(0, 5);
        setRequests(latestRequests);
      } catch (err) {
        setError('Failed to load request status');
        console.error('Error fetching requests:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuthorization();
    fetchRequests();
  }, [router]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="flex min-h-screen bg-[#F5F3EF]">
      <Sidebar />
      <div className="flex-1">
        <DashboardHeader firstName={localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!).first_name : "User"} />
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[#221C3FFF] mb-4">My Request Status</h1>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            {requests.length === 0 ? (
              <p className="text-gray-500">No requests found.</p>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-600">Room {request.room_id}</h3>
                    <p className="text-gray-600">
                      Start: {new Date(request.start_time).toLocaleString()}
                    </p>
                    <p className="text-gray-600">
                      End: {new Date(request.end_time).toLocaleString()}
                    </p>
                    <p className="text-gray-600">Reason: {request.reason}</p>
                    <p className="text-gray-600">Requester: {request.requester_name}</p>
                    <p className="text-gray-600">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          request.status === "P" ? "bg-yellow-400 text-black" :
                          request.status === "A" ? "bg-green-500 text-white" :
                          request.status === "R" ? "bg-red-500 text-white" : "bg-gray-500 text-white"
                        }`}
                      >
                        {request.status}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}