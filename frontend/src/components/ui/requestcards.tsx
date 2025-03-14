'use client';

import { useState, useEffect } from 'react';
import { apiRoom } from '@/utility/axiosInstance';

interface Request {
  id: number;
  room_id: number;
  start_time: string;
  end_time: string;
  reason: string;
  status: string;
}

export default function RequestCards() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await apiRoom.get('/requests'); // สมมติ endpoint /requests
        setRequests(response.data);
      } catch (err) {
        setError('Failed to load requests');
        console.error('Error fetching requests:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleApprove = async (requestId: number) => {
    try {
      await apiRoom.put(`/requests/${requestId}/approve`);
      setRequests(requests.map(req => req.id === requestId ? { ...req, status: 'Approved' } : req));
    } catch (err) {
      setError('Failed to approve request');
      console.error('Error approving request:', err);
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      await apiRoom.put(`/requests/${requestId}/reject`);
      setRequests(requests.map(req => req.id === requestId ? { ...req, status: 'Rejected' } : req));
    } catch (err) {
      setError('Failed to reject request');
      console.error('Error rejecting request:', err);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
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
              <p className="text-gray-600">Status: {request.status}</p>
              {request.status === 'Pending' && (
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