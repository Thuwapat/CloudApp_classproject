'use client';

import { useState, useEffect } from 'react';
import { apiReq } from '@/utility/axiosInstance';

interface Request {
  id: number;
  room_id: number;
  start_time: string;
  end_time: string;
  reason: string;
  status: string;
  requester_name: string;
}

export default function RequestCards() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await apiReq.get('/requests', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // กรองเฉพาะคำขอที่มี status เป็น P (Pending)
      const pendingRequests = response.data.filter((req: Request) => req.status === 'P');
      setRequests(pendingRequests);
    } catch (err) {
      setError('Failed to load requests');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (requestId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      await apiReq.put(`/requests/${requestId}/approve`, {}, { // เพิ่ม {} เพื่อให้แน่ใจว่า body ว่าง
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchRequests();
    } catch (err) {
      setError('Failed to approve request');
      console.error('Error approving request:', err);
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      await apiReq.put(`/requests/${requestId}/reject`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchRequests();
    } catch (err) {
      setError('Failed to reject request');
      console.error('Error rejecting request:', err);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 h-full">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Pending Room Requests</h2>
      {requests.length === 0 ? (
        <p className="text-gray-500">No pending requests.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold">Room {request.room_id}</h3>
              <p className="text-gray-600">Start: {new Date(request.start_time).toLocaleString()}</p>
              <p className="text-gray-600">End: {new Date(request.end_time).toLocaleString()}</p>
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
              {request.status === 'P' && (
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => handleApprove(request.id)}
                    className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}