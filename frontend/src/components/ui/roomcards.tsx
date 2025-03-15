"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const dummyRoomStats = [
  { roomId: "101", room: "Room 101", temp: "22°C", lastAccessed: "2025-03-10 09:15" },
  { roomId: "102", room: "Room 102", temp: "23°C", lastAccessed: "2025-03-10 09:30" },
  { roomId: "103", room: "Room 103", temp: "21°C", lastAccessed: "2025-03-10 10:00" },
  { roomId: "104", room: "Room 104", temp: "22°C", lastAccessed: "2025-03-10 10:15" },
  { roomId: "105", room: "Room 105", temp: "24°C", lastAccessed: "2025-03-10 10:30" },
];

const RoomCards = () => {
  const [roomStats, setRoomStats] = useState(dummyRoomStats);
  const router = useRouter();

  useEffect(() => {
    // Fetch room stats from API
    // fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/room-stats`)
    //   .then((res) => res.json())
    //   .then((data) => setRoomStats(data));
  }, []);

  const handleRoomClick = (roomId: string) => {
    router.push(`/access-log/${roomId}`); // Navigate using `roomID`
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-fit overflow-y-auto">
      <div className="space-y-4">
        {roomStats.map((room, index) => (
          <div
            key={room.roomId}
            onClick={() => handleRoomClick(room.roomId)}
            className="p-4 rounded-lg shadow text-white cursor-pointer hover:opacity-80 transition-all"
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
