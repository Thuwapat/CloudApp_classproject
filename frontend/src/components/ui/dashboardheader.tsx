import React from "react";

interface DashboardHeaderProps {
  firstName: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ firstName }) => {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="flex justify-between items-center p-6 bg-white shadow-md">
      <div>
        <h1 className="text-2xl font-bold text-[#221C3FFF]">Hello, {firstName}</h1>
        <p className="text-sm text-[#302858FF]">{today}</p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
        </div>
        <button className="bg-[#E08184FF] text-white px-4 py-2 rounded-full hover:bg-[#E06A6EFF]">
          🔔
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;