"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { apiRoom } from "@/utility/axiosInstance";

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await apiRoom.get("/room-usage-logs/all", {
          params: { limit: 5 }, 
        });
        setLogs(response.data);
      } catch (err) {
        setError(
          err.response?.data?.error || "Failed to load logs. Check token or server."
        );
        console.error("Error fetching logs:", err.response || err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // รูปภาพ dummy (จนกว่าจะมีระบบอัปโหลดรูปจริง)
  const getDummyPhoto = (index) => `/dummy-photo${(index % 5) + 1}.jpg`;

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-white rounded-xl shadow-md h-[334px] flex flex-col">
      <h3 className="text-xl font-semibold text-[#221C3FFF] mb-4">Access Logs</h3>

      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto max-h-full">
        <ul className="space-y-4">
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs available.</p>
          ) : (
            logs.map((log, index) => (
              <li key={`${log.id}-${log.room_name}`} className="flex items-center space-x-4">
                <Image
                  src={getDummyPhoto(index)}
                  alt={`${log.user_name}'s photo`}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <p className="text-[#221C3FFF] font-medium">
                    {log.user_name} ({log.role}) accessed {log.room_name}
                  </p>
                  <p className="text-sm text-[#302858FF]">
                    {new Date(log.time).toLocaleString()}
                  </p>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default Logs;