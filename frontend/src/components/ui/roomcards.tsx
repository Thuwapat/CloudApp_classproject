"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiRoom } from "@/utility/axiosInstance";

const RoomCards = () => {
  const [roomStats, setRoomStats] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchRoomStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found. Please log in again.");
        }

        // ดึงข้อมูลห้องจาก /rooms
        const roomsResponse = await apiRoom.get("/rooms", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const rooms = roomsResponse.data;

        // สร้าง room stats โดยรวมข้อมูล last accessed
        const statsPromises = rooms.map(async (room) => {
          try {
            const logsResponse = await apiRoom.get(`/room-usage-logs/room/${room.roomid}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            const logs = logsResponse.data;

            // หา log ล่าสุดจาก start_time
            const lastLog = logs.sort((a, b) => new Date(b.start_time) - new Date(a.start_time))[0];
            const lastAccessed = lastLog ? new Date(lastLog.start_time).toLocaleString() : "N/A";

            return {
              roomId: room.roomid,
              room: room.roomname,
              temp: `${Math.floor(Math.random() * 5) + 20}°C`, // Dummy temperature ระหว่าง 20-24°C
              lastAccessed,
            };
          } catch (error) {
            console.error(`Error fetching logs for room ${room.roomid}:`, error);
            return {
              roomId: room.roomid,
              room: room.roomname,
              temp: `${Math.floor(Math.random() * 5) + 20}°C`,
              lastAccessed: "N/A",
            };
          }
        });

        const stats = await Promise.all(statsPromises);
        setRoomStats(stats);
      } catch (error) {
        console.error("Error fetching room stats:", error);
        setRoomStats([]);
      }
    };

    fetchRoomStats();
  }, []);

  const handleRoomClick = (roomId) => {
    router.push(`/access-log/${roomId}`);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-fit overflow-y-auto">
  <div className="space-y-4">
    {roomStats.map((room, index) => (
      <div
        key={room.roomId}
        onClick={() => handleRoomClick(room.roomId)}
        className={`p-4 rounded-lg shadow cursor-pointer hover:opacity-80 transition-all ${
          index % 2 === 0 ? "text-white" : "text-black"
        }`}
        style={{
          background: index % 2 === 0 ? "#D77D7D" : "#f0f0f0",
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