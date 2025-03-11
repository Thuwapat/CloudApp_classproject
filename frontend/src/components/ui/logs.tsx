"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

// Updated dummy data with roles
const dummyLogs = [
  { id: 1, user: "John Doe", role: "Student", room: "Room 101", time: "2025-03-10 09:15", photo: "/dummy-photo1.jpg" },
  { id: 2, user: "Jane Smith", role: "Teacher", room: "Room 102", time: "2025-03-10 09:30", photo: "/dummy-photo2.jpg" },
  { id: 3, user: "Admin User", role: "Admin", room: "Room 103", time: "2025-03-10 10:00", photo: "/dummy-photo3.jpg" },
];

const Logs = () => {
  const [logs, setLogs] = useState(dummyLogs);

  useEffect(() => {
    // Fetch logs from API
    // fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/logs`)
    //   .then((res) => res.json())
    //   .then((data) => setLogs(data));
  }, []);

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h3 className="text-xl font-semibold text-[#221C3FFF] mb-4">Access Logs</h3>
      <ul className="space-y-4">
        {logs.map((log) => (
          <li key={log.id} className="flex items-center space-x-4">
            <Image
              src={log.photo}
              alt={`${log.user}'s photo`}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="flex-1">
              <p className="text-[#221C3FFF] font-medium">
                {log.user} ({log.role}) accessed {log.room}
              </p>
              <p className="text-sm text-[#302858FF]">
                {log.time}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Logs;