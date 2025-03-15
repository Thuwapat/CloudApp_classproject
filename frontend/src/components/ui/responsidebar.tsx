
import React, { useState } from "react";
import Link from "next/link";
import { HiMenu, HiX } from "react-icons/hi";

const ResponsiveSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // toggle เปิด/ปิด Sidebar
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <>
      {/* ปุ่ม Hamburger สำหรับเปิด Sidebar (แสดงเฉพาะบนมือถือ) */}
      <button
        data-drawer-target="default-sidebar"
        data-drawer-toggle="default-sidebar"
        aria-controls="default-sidebar"
        type="button"
        onClick={toggleSidebar}
        className="inline-flex items-center p-2 mt-2 ml-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
      >
        <span className="sr-only">Open sidebar</span>
        {isOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        id="default-sidebar"
        className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform transform pt-[75px] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0`}
        aria-label="Sidebar"
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-[#e08a8d]">
          <ul className="space-y-2 font-medium">
            <li>
              <Link href="dashboard" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-[#db787b] group">
                
                  <svg
                    className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      clipRule="evenodd"
                      fillRule="evenodd"
                     
                    />
                  </svg>
                  <p className="ml-3 font-bold ">Dashboard</p>
                
              </Link>
            </li>
            <li>
              <Link href="/analytics" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-[#db787b] group">
                  <svg
                    className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 18 18"
                  >
                  </svg>
                  <span className="flex-1 ml-3 whitespace-nowrap">Analytics</span>                
              </Link>
            </li>
            <li>
              <Link href="/gallery" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-[#db787b] group">
                  <svg
                    className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 18 18"
                  >
                  </svg>
                  <span className="flex-1 ml-3 whitespace-nowrap">Gallery</span>
              </Link>
            </li>
            <li>
              <Link href="/addroom" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-[#db787b] group">
                  <svg
                    className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 18 18"
                  >
                   
                  </svg>
                  <span className="flex-1 ml-3 whitespace-nowrap">add Room</span>
              </Link>
            </li>
            <li>
              <Link href="/analytics" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-[#db787b] group">
                  <svg
                    className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 18 18"
                  >
                   
                  </svg>
                  <span onClick={handleLogout} className="flex-1 ml-3 whitespace-nowrap">Logout</span>
                  
              </Link>
            </li>
          </ul>
        </div>
      </aside>

      {/* Overlay สำหรับมือถือ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 sm:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default ResponsiveSidebar;