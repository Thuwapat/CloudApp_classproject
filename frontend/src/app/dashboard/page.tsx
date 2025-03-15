'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/sidebar';
import DashboardHeader from '@/components/ui/dashboardheader';
import RoomCards from '@/components/ui/roomcards';
import Logs from '@/components/ui/logs';
import TemperatureMonitor from '@/components/ui/temperaturemonitor';
import RequestCards from '@/components/ui/requestcards';
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [firstName, setFirstName] = useState('User');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      setFirstName(parsedUser.first_name || 'User');
    }

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login?error=Please log in to access the dashboard');
      return;
    }

    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const role = decoded.role;
      if (role === 'teacher' || role === 'admin') {
        setIsAuthorized(true);
      } else {
        router.push('/?error=Unauthorized access');
        setIsAuthorized(false);
      }
    } catch (error) {
      router.push('/login?error=Invalid token');
      setIsAuthorized(false);
    }
  }, [router]);

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#F5F3EF]">
      <Sidebar />
      <div className="flex-1">
        <DashboardHeader firstName={firstName} />

        <main className="p-6">
          {/* ใช้ Grid Layout */}
          <div className="grid grid-cols-3 grid-rows-2 gap-6 h-[80vh]">
            
            {/* Room List (กิน 2 แถว ซ้ายมือ) */}
            <div className="row-span-2 bg-white p-4 shadow rounded-lg overflow-y-auto">
              <Link href="/addroom">
              <button className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 mb-4">
                + Add Room
              </button>
              
              </Link>
              <RoomCards />
            </div>

            {/* Temperature Monitoring (แถวบนกลาง) */}
            <div className="bg-white p-4 shadow rounded-lg">
              <TemperatureMonitor />
            </div>

            {/* Request Panel (กิน 2 แถว ขวาสุด) */}
            <div className="row-span-2 bg-white p-4 shadow rounded-lg">
              <RequestCards />
            </div>

            {/* Access Logs (แถวล่างกลาง) */}
            <div className="bg-white p-4 shadow rounded-lg">
              <Logs />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
