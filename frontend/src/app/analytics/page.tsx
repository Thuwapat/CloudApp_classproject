'use client';

import DashboardHeader from '@/components/ui/dashboardheader';
import Graph from '@/components/ui/graph';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ResponsiveSidebar from '@/components/ui/responsidebar';
import Header from '@/components/header';

export default function AnalyticsPage() {
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
    <div className="flex min-h-screen w-full bg-[#F5F3EF]">
      <Header firstName={''}/>
      <div className="w-64">

        <ResponsiveSidebar />
      </div>

      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold text-[#221C3FFF] mb-4">Analytics</h1>
        <div className="bg-white p-6 shadow-md rounded-lg h-screen">
          <Graph />
        </div>
      </main>
    </div>

  );
}

