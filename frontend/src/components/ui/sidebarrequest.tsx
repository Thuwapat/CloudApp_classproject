"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const Sidebar = () => {
  const [firstName, setFirstName] = useState("User");
  const [email, setEmail] = useState("email@example.com");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setFirstName(parsedUser.first_name || "User");
      setEmail(parsedUser.email || "email@example.com");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <aside className="w-64 bg-white h-screen p-6 shadow-md">
      {/* Logo */}
      <div className="flex items-center mb-8">
        {/* <Image src="/logo.png" alt="Logo" width={32} height={32} /> */}
        <h1 className="ml-2 text-xl font-bold text-[#221C3FFF]">COE Access</h1>
      </div>

      {/* User Info */}
      <div className="flex items-center mb-8">
        {/* <Image
          src="/dummy-photo1.jpg"
          alt="User"
          width={48}
          height={48}
          className="rounded-full"
        /> */}
        <div className="ml-3">
          <h2 className="text-lg font-semibold text-[#221C3FFF]">{firstName}</h2>
          <p className="text-sm text-[#302858FF]">{email}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav>
        <ul className="space-y-4">
          <li>
            <Link href="/room_req" className="flex items-center text-[#221C3FFF] hover:text-[#E08184FF]">
              <span className="mr-2">📝</span> Request
            </Link>
          </li>
          <li>
            <Link href="/req_status" className="flex items-center text-[#221C3FFF] hover:text-[#E08184FF]">
              <span className="mr-2">📊</span> Request Status
            </Link>
          </li>
          <li>
            <Link href="/profile" className="flex items-center text-[#221C3FFF] hover:text-[#E08184FF]">
              <span className="mr-2">🏷️</span> Profile & RFID Setting
            </Link>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="flex items-center text-[#221C3FFF] hover:text-[#E08184FF]"
            >
              <span className="mr-2">🚪</span> Logout
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;