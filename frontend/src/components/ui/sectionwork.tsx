"use client";

import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2"; // Correct import for the Bar component
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"; // Correct import for Chart.js components

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Dummy data for usage stats
const dummyUsageStats = [
  { room: "Room 101", count: 15 },
  { room: "Room 102", count: 10 },
  { room: "Room 103", count: 8 },
];

const WorkTogetherSection = () => {
  const [usageStats, setUsageStats] = useState(dummyUsageStats);

  // Placeholder for API calls
  useEffect(() => {
    // Fetch usage stats from API
    // fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/usage-stats`)
    //   .then((res) => res.json())
    //   .then((data) => setUsageStats(data));
  }, []);

  // Chart data and options
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
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Room Usage Frequency",
      },
    },
  };

  return (
    <section className="bg-[#f4e2dc] px-8 py-12 md:py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-4 text-2xl font-bold text-[#221C3FFF] md:text-3xl">
          Room Usage Statistics
        </h2>
        <p className="mb-6 text-[#302858FF]">
          Visualize which rooms are most frequently accessed over time.
        </p>
        <div className="bg-white p-4 rounded shadow">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </section>
  );
};

export default WorkTogetherSection;