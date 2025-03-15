import { useState, useEffect } from "react";

const dummyTemperatures = [
  { room: "Room 101", temp: "22°C" },
  { room: "Room 102", temp: "23°C" },
  { room: "Room 103", temp: "21°C" },
  { room: "Room 104", temp: "22°C" },
  { room: "Room 105", temp: "24°C" },
  { room: "Room 106", temp: "20°C" },
  { room: "Room 107", temp: "23°C" },
  { room: "Room 108", temp: "21°C" },
];

const TemperatureMonitor = () => {
  const [temperatures, setTemperatures] = useState(dummyTemperatures);

  useEffect(() => {
    // Fetch temperatures from API
    // fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/temperatures`)
    //   .then((res) => res.json())
    //   .then((data) => setTemperatures(data));
  }, []);

  return (
    <div className="p-6 bg-white rounded-xl shadow-md h-full overflow-y-auto">
      <h3 className="text-xl font-semibold text-[#221C3FFF] mb-4">Temperature Monitoring</h3>
      <ul className="space-y-2">
        {temperatures.map((temp, index) => (
          <li key={index} className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-[#E08184FF]"></span>
            <p className="text-[#221C3FFF]">{temp.room}: {temp.temp}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TemperatureMonitor;
