'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/sidebar';
import DashboardHeader from '@/components/ui/dashboardheader';
import RoomCards from '@/components/ui/roomcards';
import Logs from '@/components/ui/logs';
import Graph from '@/components/ui/graph';
import TemperatureMonitor from '@/components/ui/temperaturemonitor';
import RequestCards from '@/components/ui/requestcards';

export default function Dashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [firstName, setFirstName] = useState('User'); // Default name

  useEffect(() => {
    // ดึง user จาก localStorage
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      setFirstName(parsedUser.first_name || 'User'); // ตั้งชื่อจาก first_name
    }

    // ตรวจสอบ authorization
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
        {/* ใช้ DashboardHeader และส่ง firstName */}
        <DashboardHeader firstName={firstName}/>
        
        <main className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RoomCards />
            <RequestCards /> {/* เพิ่ม RequestCards */}
            <div className="lg:col-span-2">
              <Logs />
            </div>
            <div>
              <TemperatureMonitor />
            </div>
            <div className="lg:col-span-2">
              <Graph />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}