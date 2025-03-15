"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // เพิ่ม useRouter สำหรับ redirect
import Sidebar from "@/components/ui/sidebar";
import DashboardHeader from "@/components/ui/dashboardheader";
import Input from "@/components/ui/input";
import { apiRoom } from "@/utility/axiosInstance"; // ใช้ apiRoom ที่ตั้งค่าไว้สำหรับ room_mgmt
import ResponsiveSidebar from "@/components/ui/responsidebar";
import Header from "@/components/header";

export default function AddNewRoom() {
  const router = useRouter(); 
  const [firstName, setFirstName] = useState("User");
  const [roomId, setRoomId] = useState(""); 
  const [roomName, setRoomName] = useState(""); 
  const [capacity, setCapacity] = useState(""); 
  const [type, setType] = useState(""); 
  const [description, setDescription] = useState(""); 
  const [capacityError, setCapacityError] = useState(""); 
  const [roomIdError, setRoomIdError] = useState("");
  const [roomNameError, setRoomNameError] = useState("");
  const [typeError, setTypeError] = useState(""); 
  const [loading, setLoading] = useState(false); 
  const [successMessage, setSuccessMessage] = useState(""); 
  const [errorMessage, setErrorMessage] = useState(""); 

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setFirstName(parsedUser.first_name || "User");
    }
  }, []);

  // Validation สำหรับ roomId
  const handleChangeRoomId = (e: { target: { value: any } }) => {
    const value = e.target.value;
    setRoomId(value);

    if (value === "") {
      setRoomIdError("Room ID is required");
      return;
    }

    const numericValue = Number(value);
    if (isNaN(numericValue) || numericValue <= 0) {
      setRoomIdError("Room ID must be a positive number");
    } else {
      setRoomIdError("");
    }
  };

  // Validation สำหรับ roomName
  const handleChangeRoomName = (e: { target: { value: any } }) => {
    const value = e.target.value;
    setRoomName(value);

    if (value.trim() === "") {
      setRoomNameError("Room Name is required");
    } else {
      setRoomNameError("");
    }
  };

  // Validation สำหรับ capacity
  const handleChangeCapacity = (e: { target: { value: any } }) => {
    const value = e.target.value;
    setCapacity(value);

    if (value === "") {
      setCapacityError("Capacity is required");
      return;
    }

    const numericValue = Number(value);
    if (isNaN(numericValue)) {
      setCapacityError("Please enter a valid number");
      return;
    }

    if (numericValue < 5 || numericValue > 80) {
      setCapacityError("Capacity must be between 5 and 80");
    } else {
      setCapacityError("");
    }
  };

  // Validation สำหรับ type
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setType(value);

    if (value === "") {
      setTypeError("Please select a room type");
    } else {
      setTypeError("");
    }
  };

  // ฟังก์ชันสำหรับเพิ่มห้อง
  const handleAddRoom = async () => {
    // ตรวจสอบ validation ก่อนส่ง
    if (!roomId || roomIdError) {
      setRoomIdError(roomId ? roomIdError : "Room ID is required");
      return;
    }
    if (!roomName || roomNameError) {
      setRoomNameError(roomName ? roomNameError : "Room Name is required");
      return;
    }
    if (!capacity || capacityError) {
      setCapacityError(capacity ? capacityError : "Capacity is required");
      return;
    }
    if (!type || typeError) {
      setTypeError(type ? typeError : "Please select a room type");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await apiRoom.post("/rooms", {
        roomid: Number(roomId), // ส่งเป็น integer
        roomname: roomName,
        type,
        capacity: Number(capacity), // ส่งเป็น integer
        description,
      });

      setSuccessMessage("Room added successfully!");
      // รีเซ็ตฟอร์มหลังเพิ่มสำเร็จ
      setRoomId("");
      setRoomName("");
      setCapacity("");
      setType("");
      setDescription("");
      setTimeout(() => {
        router.push("/addroom"); // เปลี่ยนเส้นทางไปหน้าที่ต้องการ (เช่น หน้ารายการห้อง)
      }, 2000);
    } catch (error: any) {
      if (error.response) {
        setErrorMessage(error.response.data.error || "Failed to add room");
      } else {
        setErrorMessage("An error occurred while adding the room");
      }
      console.error("Error adding room:", error);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันสำหรับยกเลิก
  const handleCancel = () => {
    router.push("/rooms"); // เปลี่ยนเส้นทางไปหน้าที่ต้องการ
  };

  return (
    <div className="flex h-full">
      {/* Sidebar ด้านซ้าย */}
      <Header firstName={''}/>
      <ResponsiveSidebar />
      {/* ส่วนเนื้อหา (Main Content) ด้านขวา */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Header ด้านบน */}
        {/* <DashboardHeader firstName={firstName} /> */}

        {/* ส่วนเนื้อหาหลัก (Form Add New Room) */}
        <div className="p-6 pl-70 pt-20 overflow-auto bg-[#F5F3EF] h-full">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-6 text-black">Add New Room</h2>

            {/* แสดงข้อความ Success หรือ Error */}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {errorMessage}
              </div>
            )}

            {/* ฟอร์ม 2 คอลัมน์ */}
            <div className="grid grid-cols-2 gap-8">
              {/* คอลัมน์ซ้าย */}
              <div>
                {/* Room Name */}
                <div className="mb-4">
                  <label className="block font-medium mb-2 text-[#221C3FFF]">
                    Room Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Cloud Room"
                    value={roomName}
                    onChange={handleChangeRoomName}
                  />
                  {roomNameError && (
                    <p className="text-red-500 text-sm mt-1">{roomNameError}</p>
                  )}
                </div>

                {/* Type */}
                <div className="mb-4">
                  <label className="block font-medium mb-2 text-[#221C3FFF]">
                    Type
                  </label>
                  <select
                    className="block appearance-none w-full bg-gray-100 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-xs sm:text-sm md:text-base"
                    value={type}
                    onChange={handleSelectChange}
                  >
                    <option value="">Select Room Type</option> {/* เพิ่มตัวเลือกเริ่มต้น */}
                    <option value="Conference Room">Conference Room</option>
                    <option value="Work Room">Work Room</option>
                    <option value="Classroom">Classroom</option>
                    <option value="Classroom">Labartory</option>
                  </select>
                  {typeError && (
                    <p className="text-red-500 text-sm mt-1">{typeError}</p>
                  )}
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block font-medium mb-2 text-[#221C3FFF]">
                    Description
                  </label>
                  <textarea
                    className="w-full border border-gray-200 rounded p-2 placeholder:text-black"
                    rows={3}
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* คอลัมน์ขวา */}
              <div>
                {/* Room ID */}
                <div className="mb-4">
                  <label className="block font-medium mb-2 text-[#221C3FFF]">
                    Room ID
                  </label>
                  <Input
                    type="number"
                    placeholder="101"
                    value={roomId}
                    onChange={handleChangeRoomId}
                  />
                  {roomIdError && (
                    <p className="text-red-500 text-sm mt-1">{roomIdError}</p>
                  )}
                </div>

                {/* Capacity */}
                <div className="mb-4">
                  <label className="block font-medium mb-2 text-[#221C3FFF]">
                    Capacity
                  </label>
                  <input
                    type="number"
                    className="w-full border p-2 placeholder:text-black"
                    placeholder="5-80"
                    min="5"
                    max="80"
                    value={capacity}
                    onChange={handleChangeCapacity}
                  />
                  {capacityError && (
                    <p className="text-red-500 text-sm mt-1">{capacityError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* ปุ่มด้านล่าง */}
            <div className="mt-6 flex space-x-4">
              <button
                onClick={handleAddRoom}
                disabled={loading}
                className={`bg-[#e08a8d] text-white px-4 py-2 rounded hover:bg-[#db787b] ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Adding..." : "Add Room"}
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}