import { useState, useEffect } from "react";

const dummyRoomStats = [
  { room: "Room 101", temp: "22°C", lastAccessed: "2025-03-10 09:15" },
  { room: "Room 102", temp: "23°C", lastAccessed: "2025-03-10 09:30" },
  { room: "Room 103", temp: "21°C", lastAccessed: "2025-03-10 10:00" },
  { room: "Room 104", temp: "22°C", lastAccessed: "2025-03-10 10:15" },
  { room: "Room 105", temp: "24°C", lastAccessed: "2025-03-10 10:30" },
  { room: "Room 106", temp: "20°C", lastAccessed: "2025-03-10 10:45" },
  { room: "Room 107", temp: "23°C", lastAccessed: "2025-03-10 11:00" },
];

const RoomCards = () => {
  const [roomStats, setRoomStats] = useState(dummyRoomStats);

  useEffect(() => {
    // Fetch room stats from API
    // fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/room-stats`)
    //   .then((res) => res.json())
    //   .then((data) => setRoomStats(data));
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-[668px] overflow-y-auto">

      {/* Room Cards (Scrollable List) */}
      <div className="space-y-4">
        {roomStats.map((room, index) => (
          <div
            key={index}
            className="p-4 rounded-lg shadow text-white"
            style={{
              background: index % 2 === 0 ? "#6B48FF" : "#34D399",
            }}
          >
            <h3 className="text-lg font-semibold">{room.room}</h3>
            <p className="text-sm">Temperature: {room.temp}</p>
            <p className="text-sm">Last Accessed: {room.lastAccessed}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomCards;

