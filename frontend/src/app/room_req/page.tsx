'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRoom } from '@/utility/axiosInstance';
import { useRouter } from 'next/navigation';

export default function RequestRoomPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // ดึงข้อมูลห้อง (สมมติว่า backend มี endpoint /rooms ในอนาคต)
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        // ตัวอย่าง: ดึงรายการห้องจาก backend (ปรับตาม API จริง)
        const response = await apiRoom.get('/rooms'); // เพิ่ม endpoint นี้ใน room_request_backend
        setRooms(response.data);
      } catch (err) {
        setError('Failed to load rooms');
        console.error('Error fetching rooms:', err);
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
    <div className="p-10 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Good Morning, [Student Name]</h1>

      <div className="grid gap-6">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center"
          >
            {/* Placeholder Image */}
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded mb-4">
              <span className="text-gray-500">Room Image</span>
            </div>

            {/* Room Details */}
            <div className="text-left w-full">
              <h2 className="text-xl font-semibold text-gray-900">{`Meeting Room ${room.id}`}</h2>
              <p className="text-gray-600">{`${room.meetings_today || 0} meetings today`}</p>
              <p className="text-gray-500 text-sm">
                {/* ตัวอย่างข้อมูลเพิ่มเติม (ปรับตามต้องการ) */}
                4 seater | Whiteboard available | No Projector
              </p>
            </div>

            {/* Book Button */}
            <button
              onClick={() => handleBook(room.id)}
              className="mt-4 bg-black text-white py-2 px-6 rounded hover:bg-gray-800 transition"
            >
              Request
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}