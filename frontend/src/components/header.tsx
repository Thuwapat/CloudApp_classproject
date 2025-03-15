"use client";

import React, { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";

interface HeaderProps {
  firstName: string;
}

const Header: React.FC<HeaderProps> = ({ firstName }) => {
  // state สำหรับเปิด/ปิดเมนูบน mobile
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow z-50">
      {/* ส่วน Navbar บนสุด */}
      <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* โลโก้ / Branding */}
        <div className="flex flex-row gap-0.5">
        <div className="text-xl font-bold text-[#302858FF]">COE</div>
        <div className="text-xl font-bold text-[#E08184FF]">Access</div>
        </div>
        {/* เมนูแบบเต็ม (แสดงบนจอใหญ่ขึ้นไป) */}
        <ul className="hidden md:flex gap-6">
          <li>
            <a href="#" className="text-[#302858FF] hover:text-blue-500">Home</a>
          </li>
          <li>
            <a href="#" className=" text-[#302858FF] hover:text-blue-500">About</a>
          </li>
          <li>
            <a href="#" className=" text-[#302858FF] hover:text-blue-500">Contact</a>
          </li>
          <li>
            <a href="#" className=" text-[#302858FF] hover:text-blue-500">Services</a>
          </li>
          <li>
            <a href="#" className=" text-[#302858FF] hover:text-blue-500">Welcome {firstName}</a>
          </li>
        </ul>

        {/* ปุ่ม Hamburger (แสดงบนจอเล็ก) */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-gray-700 hover:text-gray-900"
        >
          {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>
      </nav>

      {/* เมนูสำหรับ Mobile (เลื่อนลงมา) */}
      {isOpen && (
        <div className="md:hidden bg-white shadow px-4 py-2">
          <ul className="flex flex-col gap-3">
            <li>
              <a href="#" className="text-[#302858FF] hover:text-blue-500 block">Home</a>
            </li>
            <li>
              <a href="#" className=" text-[#302858FF] hover:text-blue-500 block">About</a>
            </li>
            <li>
              <a href="#" className="text-[#302858FF] hover:text-blue-500 block">Contact</a>
            </li>
            <li>
              <a href="#" className="text-[#302858FF] hover:text-blue-500 block">Services</a>
            </li>
            <li>
              <a href="#" className="text-[#302858FF] hover:text-blue-500 block">Welcome {firstName}</a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
