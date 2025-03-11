"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

// Dummy data for logs and temperatures
const dummyLogs = [
  { id: 1, user: "John Doe", room: "Room 101", time: "2025-03-10 09:15", method: "Fingerprint", photo: "/dummy-photo1.jpg" },
  { id: 2, user: "Jane Smith", room: "Room 102", time: "2025-03-10 09:30", method: "Student Card", photo: "/dummy-photo2.jpg" },
  { id: 3, user: "Admin User", room: "Room 103", time: "2025-03-10 10:00", method: "Admin Command", photo: "/dummy-photo3.jpg" },
];

const dummyTemperatures = [
  { room: "Room 101", temp: "22°C" },
  { room: "Room 102", temp: "23°C" },
  { room: "Room 103", temp: "21°C" },
];

const ProjectManagementSection = () => {
  const [logs, setLogs] = useState(dummyLogs);
  const [temperatures, setTemperatures] = useState(dummyTemperatures);

  // Placeholder for API calls
  useEffect(() => {
    // Fetch logs from API
    // fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/logs`)
    //   .then((res) => res.json())
    //   .then((data) => setLogs(data));

    // Fetch temperatures from API
    // fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/temperatures`)
    //   .then((res) => res.json())
    //   .then((data) => setTemperatures(data));
  }, []);

  return (
    <section className="px-8 py-12 md:py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-4 text-2xl font-bold text-[#221C3FFF] md:text-3xl">
          Room Access Logs & Temperature Monitoring
        </h2>
        <p className="mb-6 text-[#302858FF]">
          Monitor real-time access logs and room temperatures for enhanced security and management.
        </p>

        {/* Logs Table */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-[#221C3FFF]">Access Logs</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b">User</th>
                  <th className="py-2 px-4 border-b">Room</th>
                  <th className="py-2 px-4 border-b">Time</th>
                  <th className="py-2 px-4 border-b">Method</th>
                  <th className="py-2 px-4 border-b">Photo</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{log.user}</td>
                    <td className="py-2 px-4 border-b">{log.room}</td>
                    <td className="py-2 px-4 border-b">{log.time}</td>
                    <td className="py-2 px-4 border-b">{log.method}</td>
                    <td className="py-2 px-4 border-b">
                      <Image
                        src={log.photo}
                        alt={`${log.user}'s photo`}
                        width={64}
                        height={64}
                        className="object-cover rounded"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Temperature Cards */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-[#221C3FFF]">Room Temperatures</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {temperatures.map((temp, index) => (
              <div key={index} className="bg-white p-4 rounded shadow">
                <h4 className="font-medium text-[#221C3FFF]">{temp.room}</h4>
                <p className="text-lg text-[#302858FF]">{temp.temp}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectManagementSection;