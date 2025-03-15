"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/ui/sidebarrequest";
import DashboardHeader from "@/components/ui/dashboardheader";
import Input from "@/components/ui/input";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import { apiAuth } from "@/utility/axiosInstance";

interface FormErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  rfid?: string;
}

export default function ProfilePage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    rfid: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login?error=Please log in to access the dashboard");
      return;
    }
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      const role = decoded.role;
      if (role === "student") {
        setIsAuthorized(true);
      } else {
        router.push("/?error=Unauthorized access");
        setIsAuthorized(false);
      }
    } catch (error) {
      router.push("/login?error=Invalid token");
      setIsAuthorized(false);
    }
  }, [router]);

  // โหลดข้อมูลผู้ใช้จาก localStorage และแปลง null เป็น ""
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser({
        first_name: parsedUser.first_name ?? "", // แปลง null เป็น ""
        last_name: parsedUser.last_name ?? "",
        email: parsedUser.email ?? "",
        rfid: parsedUser.rfid ?? "",
      });
    }
  }, []);

  if (!mounted) return null;
  if (isAuthorized === null) return <div>Loading...</div>;
  if (!isAuthorized) return null;

  const handleChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const errs: FormErrors = {};
    if (!user.first_name) errs.first_name = "First name is required";
    if (!user.last_name) errs.last_name = "Last name is required";
    if (!user.email) {
      errs.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(user.email)) {
      errs.email = "Email is invalid";
    }
    if (!user.rfid) errs.rfid = "RFID is required";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    const storedUser = localStorage.getItem("user");
    let userId;
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      userId = parsedUser.id;
    }
    if (!userId) {
      toast.error("User ID not found", { position: "top-right" });
      setLoading(false);
      return;
    }

    const payload = {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      rfid: user.rfid,
    };

    try {
      const response = await apiAuth.put(`/profile/${userId}`, payload);
      const updatedData = response.data;
      // แปลง null เป็น "" ก่อนเก็บใน localStorage
      const updatedUser = {
        ...updatedData.user,
        first_name: updatedData.user.first_name ?? "",
        last_name: updatedData.user.last_name ?? "",
        email: updatedData.user.email ?? "",
        rfid: updatedData.user.rfid ?? "",
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success("Profile updated successfully!", { position: "top-right" });
    } catch (error: any) {
      toast.error(error.message || "Error updating profile", { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader firstName={user.first_name || "User"} />
        <div className="p-6 overflow-auto bg-gray-100 h-full">
          <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4 text-left text-gray-700">Profile</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">First Name</label>
                  <Input
                    type="text"
                    name="first_name" // เปลี่ยน name ให้ตรงกับ key ใน user
                    placeholder="First Name"
                    value={user.first_name}
                    onChange={handleChange}
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-sm">{errors.first_name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Last Name</label>
                  <Input
                    type="text"
                    name="last_name" // เปลี่ยน name ให้ตรงกับ key ใน user
                    placeholder="Last Name"
                    value={user.last_name}
                    onChange={handleChange}
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-sm">{errors.last_name}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Email</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={user.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-1">RFID</label>
                <div className="relative">
                  <Input
                    type="text"
                    name="rfid"
                    placeholder="Enter RFID"
                    value={user.rfid}
                    onChange={handleChange}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3 4a1 1 0 000 2h14a1 1 0 100-2H3zM3 9a1 1 0 000 2h14a1 1 0 100-2H3zM3 14a1 1 0 000 2h14a1 1 0 100-2H3z" />
                    </svg>
                  </div>
                </div>
                {errors.rfid && (
                  <p className="text-red-500 text-sm">{errors.rfid}</p>
                )}
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
                >
                  {loading ? "Updating..." : "Update Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}