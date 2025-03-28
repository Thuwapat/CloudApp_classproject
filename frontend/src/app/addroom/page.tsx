"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/ui/sidebar";
import DashboardHeader from "@/components/ui/dashboardheader";
import Input from "@/components/ui/input";
import { apiRoom } from "@/utility/axiosInstance"; 
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

  
  const handleChangeRoomName = (e: { target: { value: any } }) => {
    const value = e.target.value;
    setRoomName(value);

    if (value.trim() === "") {
      setRoomNameError("Room Name is required");
    } else {
      setRoomNameError("");
    }
  };

  
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

    if (numericValue < 1 || numericValue > 100) {
      setCapacityError("Capacity must be between 1 and 100");
    } else {
      setCapacityError("");
    }
  };

 
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setType(value);

    if (value === "") {
      setTypeError("Please select a room type");
    } else {
      setTypeError("");
    }
  };

  const handleAddRoom = async () => {
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
        roomid: Number(roomId),
        roomname: roomName,
        type,
        capacity: Number(capacity),
        description,
      });

      setSuccessMessage("Room added successfully!");
      setRoomId("");
      setRoomName("");
      setCapacity("");
      setType("");
      setDescription("");
      setTimeout(() => {
        router.push("/addroom");
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

  const handleCancel = () => {
    router.push("/rooms");
  };

  return (
    <div className="flex h-full">
      <Header firstName={''}/>
      <ResponsiveSidebar />
      <div className="flex-1 flex flex-col h-screen">

        <div className="p-6 pl-70 pt-20 overflow-auto bg-[#F5F3EF] h-full">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-6 text-black">Add New Room</h2>

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

            <div className="grid grid-cols-2 gap-8">
              <div>
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

                <div className="mb-4">
                  <label className="block font-medium mb-2 text-[#221C3FFF]">
                    Type
                  </label>
                  <select
                    className="block appearance-none w-full bg-gray-100 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-xs sm:text-sm md:text-base"
                    value={type}
                    onChange={handleSelectChange}
                  >
                    <option value="">Select Room Type</option>
                    <option value="Conference Room">Conference Room</option>
                    <option value="Work Room">Work Room</option>
                    <option value="Classroom">Classroom</option>
                    <option value="Labartory">Labartory</option> 
                  </select>
                  {typeError && (
                    <p className="text-red-500 text-sm mt-1">{typeError}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block font-medium mb-2 text-[#221C3FFF]">
                    Description
                  </label>
                  <textarea
                    className="w-full bg-gray-100 border border-gray-200 rounded p-2 placeholder:text-black text-black focus:outline-none focus:border-gray-500"
                    rows={3}
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              <div>
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
                <div className="mb-4">
                  <label className="block font-medium mb-2 text-[#221C3FFF]">
                    Capacity
                  </label>
                  <input
                    type="number"
                    className="w-full bg-gray-100 border border-gray-200 rounded p-2 placeholder:text-black text-black focus:outline-none focus:border-gray-500"
                    placeholder="1-100"
                    min="1"
                    max="100"
                    value={capacity}
                    onChange={handleChangeCapacity}
                  />
                  {capacityError && (
                    <p className="text-red-500 text-sm mt-1">{capacityError}</p>
                  )}
                </div>
              </div>
            </div>

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