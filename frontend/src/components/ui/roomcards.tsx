import { useState, useEffect } from "react";

const dummyRoomStats = [
  { room: "Room 101", temp: "22°C", lastAccessed: "2025-03-10 09:15" },
  { room: "Room 102", temp: "23°C", lastAccessed: "2025-03-10 09:30" },
  { room: "Room 103", temp: "21°C", lastAccessed: "2025-03-10 10:00" },
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {roomStats.map((room, index) => (
        <div
          key={index}
          className="p-6 rounded-xl shadow-md text-white"
          style={{
            background: index === 0 ? "#6B48FF" : index === 1 ? "#34D399" : "#FB923C",
          }}
        >
          <h3 className="text-lg font-semibold">{room.room}</h3>
          <p className="text-sm">Temperature: {room.temp}</p>
          <p className="text-sm">Last Accessed: {room.lastAccessed}</p>
        </div>
      ))}
    </div>
  );
};

export default RoomCards;