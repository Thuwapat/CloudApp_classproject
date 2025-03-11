"use client";

import { useState, useEffect } from "react";

// Dummy data for demonstration
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

const dummyUsageStats = [
  { room: "Room 101", count: 15 },
  { room: "Room 102", count: 10 },
  { room: "Room 103", count: 8 },
];

export default function Dashboard() {
  const [logs, setLogs] = useState(dummyLogs);
  const [temperatures, setTemperatures] = useState(dummyTemperatures);
  const [usageStats, setUsageStats] = useState(dummyUsageStats);

  // Placeholder for API calls (to be replaced with real API integration)
  useEffect(() => {
    // Fetch logs from API
    // fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/logs`)
    //   .then((res) => res.json())
    //   .then((data) => setLogs(data));

    // Fetch temperatures from API
    // fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/temperatures`)
    //   .then((res) => res.json())
    //   .then((data) => setTemperatures(data));

    // Fetch usage stats from API
    // fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/usage-stats`)
    //   .then((res) => res.json())
    //   .then((data) => setUsageStats(data));
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">COE Room Access Dashboard</h1>

      {/* Logs Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Access Logs</h2>
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
                    <img
                      src={log.photo}
                      alt={`${log.user}'s photo`}
                      className="w-16 h-16 object-cover"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Temperature Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Room Temperatures</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {temperatures.map((temp, index) => (
            <div key={index} className="bg-white p-4 rounded shadow">
              <h3 className="font-medium">{temp.room}</h3>
              <p className="text-lg">{temp.temp}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Room Usage Graph Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Room Usage Statistics</h2>
        <div className="bg-white p-4 rounded shadow">
          {/* Placeholder for Chart.js or similar library */}
          <div className="h-64 flex items-center justify-center bg-gray-100">
            <p className="text-gray-500">Graph Placeholder (e.g., Bar Chart of Room Usage)</p>
          </div>
          {/* Dummy stats display */}
          <ul className="mt-4">
            {usageStats.map((stat, index) => (
              <li key={index} className="text-gray-700">
                {stat.room}: {stat.count} accesses
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Photo Gallery Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">User Photo Gallery</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {logs.map((log) => (
            <div key={log.id} className="bg-white p-2 rounded shadow">
              <img
                src={log.photo}
                alt={`${log.user}'s photo`}
                className="w-full h-32 object-cover rounded"
              />
              <p className="text-center mt-2">{log.user}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}