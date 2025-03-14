"use client";

import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const dummyUsageStats = [
  { room: "Room 101", count: 15 },
  { room: "Room 102", count: 10 },
  { room: "Room 103", count: 8 },
];

const Graph = () => {
  const [usageStats, setUsageStats] = useState(dummyUsageStats);

  useEffect(() => {
    // Fetch usage stats from API
    // fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/usage-stats`)
    //   .then((res) => res.json())
    //   .then((data) => setUsageStats(data));
  }, []);

  const chartData = {
    labels: usageStats.map((stat) => stat.room),
    datasets: [
      {
        label: "Number of Accesses",
        data: usageStats.map((stat) => stat.count),
        backgroundColor: "#E08184FF",
        borderColor: "#E06A6EFF",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // ❗ Fix graph scaling issue
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Room Usage Statistics",
      },
    },
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md w-full h-full flex justify-center items-center">
      <h3 className="text-xl font-semibold text-[#221C3FFF] mb-4">Statistics</h3>
      <div className="w-full h-full">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default Graph;
