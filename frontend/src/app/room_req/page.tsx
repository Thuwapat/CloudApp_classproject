"use client";

import { useState, useEffect } from "react";
import { apiRoom } from "@/utility/axiosInstance";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/ui/sidebarrequest";

export default function RequestRoomPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await apiRoom.get("/rooms");
        setRooms(response.data); 
      } catch (err) {
        setError("Failed to load rooms");
        console.error("Error fetching rooms:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const handleBook = (roomId: number) => {
    router.push(`/room_req/req_form?roomId=${roomId}`);
  };

  if (loading) return <div className="p-10">Loading...</div>;
  if (error) return <div className="p-10 text-red-500">{error}</div>;

  return (
    <div className="flex h-full bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Good Morning, [Student Name]
        </h1>
        <div className="grid gap-6">
          {rooms.map((room) => (
            <div
              key={room.roomid} 
              className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center"
            >
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded mb-4">
                <span className="text-gray-500">Room Image</span>
              </div>
              <div className="text-left w-full">
                <h2 className="text-xl font-semibold text-gray-900">
                  {room.roomname || `Room ${room.roomid}`} 
                </h2>
                <p className="text-gray-600">
                  Type: {room.type || "N/A"}
                </p>
                <p className="text-gray-500 text-sm">
                  Capacity: {room.capacity || "N/A"} seats |{" "}
                  {room.description || "No description available"}
                </p>
              </div>
              <button
                onClick={() => handleBook(room.roomid)} 
                className="mt-4 bg-black text-white py-2 px-6 rounded hover:bg-gray-800 transition"
              >
                Request
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}