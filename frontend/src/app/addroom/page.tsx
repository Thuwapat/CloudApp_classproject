"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/ui/sidebar";
import DashboardHeader from "@/components/ui/dashboardheader";
import Input from "@/components/ui/input";

export default function AddNewProduct() {
  const [firstName, setFirstName] = useState("User");
  const [roomname, setroomname] = useState("");
  const [idroom, setidroom] = useState("");
  const [capacity, setcapacity] = useState("");
  const [type, settype] = useState("");
  const [description, setdescription] = useState("");
  const [capaerror, setcapaError] = useState('');

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setFirstName(parsedUser.first_name || "User");
    }
  }, []);

  const handleChangecapa = (e: { target: { value: any; }; }) => {
    const value = e.target.value;
    setcapacity(value);

      // ถ้าไม่มีการกรอกข้อมูลให้เคลียร์ error
  if (value === '') {
    setcapaError('');
    return;
  }

  // แปลงค่าเป็นตัวเลข
  const numericValue = Number(value);

  // ตรวจสอบว่าแปลงค่าได้หรือไม่
  if (isNaN(numericValue)) {
    setcapaError('กรุณากรอกหมายเลขที่ถูกต้อง');
    return;
  }



     if (value !== '') {
       const numericValue = Number(value);
       if (numericValue < 5 || numericValue > 80) {
       setcapaError('The value must be between 5 and 80');
       } else {
       setcapaError('');
       }
    }
 };



  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    settype(e.target.value);
  };
  return (
    <div className="flex">
      {/* Sidebar ด้านซ้าย */}
      <Sidebar />

      {/* ส่วนเนื้อหา (Main Content) ด้านขวา */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Header ด้านบน */}
        <DashboardHeader firstName={firstName} />

        {/* ส่วนเนื้อหาหลัก (Form Add New Product) */}
        <div className="p-6 overflow-auto bg-[#F5F3EF] h-full">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-6 text-black">Add new Room</h2>

            {/* ฟอร์ม 2 คอลัมน์ */}
            <div className="grid grid-cols-2 gap-8">
              {/* คอลัมน์ซ้าย */}
              <div>

                {/* Product name */}
                <div className="mb-4">
                  <label className="block font-medium mb-2 text-[#221C3FFF]">
                    Room name
                  </label>
                  <Input
                    type="text"
                    placeholder="cloud room"
                    value={roomname}
                    onChange={(e) => setroomname(e.target.value)}

                  />
                </div>

                {/* Type */}
                <div className="mb-4">
                  <label className="block font-medium mb-2 text-[#221C3FFF]">
                    Type
                  </label>
                  <select
                    className="block appearance-none w-full bg-gray-100 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-xs sm:text-sm md:text-base"
                    id="grid-state"
                    value={type}
                    onChange={handleSelectChange}
                  >
                    <option>Conference Room</option>
                    <option>Work Room</option>
                    <option>Classroom</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block font-medium mb-2 text-[#221C3FFF]">
                    Description
                  </label>
                  <textarea
                    className="w-full border border-gray-200 rounded p-2 placeholder: text-black"
                    rows={3}
                    placeholder="Discription"
                    value={description}
                    onChange={(e) => setdescription(e.target.value)}
                  />
                </div>

              </div>

              {/* คอลัมน์ขวา */}
              <div>
                {/* Sales information */}
                <div className="mb-6">
                  <div className="mb-4">
                    <label className="block font-medium mb-2 text-[#221C3FFF]">
                      ID Room
                    </label>
                    <div className="flex items-center">
                      <Input
                        type="text"
                        // className="w-full border border-gray-300 rounded p-2"
                        placeholder="EN4780"
                        value={idroom}
                        onChange={(e) => setidroom(e.target.value)}
                      />
                    </div>
                  </div>



                  <div className="mb-4">
                    <label className="block font-medium mb-2 text-[#221C3FFF]">
                      Capacity
                    </label>
                    <input
                      type="number"
                      className="w-full border p-2  placeholder:  text-black"
                      placeholder="5-50"
                      min="5"
                      max="80"
                      value={capacity}
                      onChange={handleChangecapa}

                    />
                    {capaerror && <p className="text-red-500">{capaerror}</p>}
                  </div>
                </div>


              </div>
            </div>

            {/* ปุ่มด้านล่าง */}
            <div className="mt-6 flex space-x-4">
              <button className="bg-[#221C3FFF] text-white px-4 py-2 rounded hover:bg-[#302858FF]">
                Add Room
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
