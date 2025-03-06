"use client";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import { useState } from "react";


// แยก Input, Label, Button ไว้ใน components/ui/ 
import Label from "@/components/ui/label";
import Input from "@/components/ui/input";
import api from "@/utility/axiosInstance";
import Button from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, setError] = useState("");
  const [, setLoading] = useState(false);
  const [, setData] = useState("");
  

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/login", { email, password });
      setData(response.data);
      localStorage.setItem("token", response.data.token);
      alert("Login successful");
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }; // เมื่อ email หรือ password เปลี่ยนแปลงจะทำการ login ใหม่
  
   
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f4e2dc] p-4 md:flex-row">
    <div className="w-full max-w-4xl overflow-hidden rounded-md bg-white border border-gray-200 shadow-md md:flex">
      {/* โซนซ้าย (ฟอร์ม) */}
      <div className="mx-auto w-full max-w-md p-8 py-8 md:w-1/2 ">
        <h2 className="mb-2 text-2xl font-bold text-[#221d42]">Welcome back</h2>
        <p className="mb-6 text-sm text-gray-500">
          Login to your Acme Inc account
        </p>

        {/* ฟอร์ม */}
        <form className="mb-4 space-y-5" onSubmit={handleLogin}>
          <div>
            <Label className="font-bold text-[#221d42]">Email</Label>
            <Input type="email" 
                   placeholder="name@kku.ac.th , name@kkumail.com" 
                   value={email} 
                   onChange={(e) => setEmail(e.target.value)}/>
                   
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <Label className="font-bold text-[#221d42]" >Password</Label>
              <Link href="#" className="text-sm text-[#3882BEFF] hover:underline">
                Forgot your password?
              </Link>
            </div>
            <Input type="password" 
                    placeholder="Enter your password " 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}/>
          </div>

          <Button className=" bg-[#221C3FFF] w-full rounded-md py-2 hover:bg-[#16122BFF]" type="submit">Login</Button>
        </form>

        {/* Separator */}
        <div className="mb-4 flex items-center">
          <div className="h-px flex-1 bg-gray-200"></div>
          <p className="px-3 text-sm text-gray-400">Or continue with</p>
          <div className="h-px flex-1 bg-gray-200"></div>
        </div>

        {/* ปุ่ม Social Login */}
        <div className="mb-6 flex gap-2">
          <button className="flex-1 rounded border  py-2 bg-[#E08184FF] text-sm hover:bg-[#E06A6EFF]">
            SSO KKU
          </button>
          {/* <button className="flex-1 rounded border border-gray-300 py-2 text-sm hover:bg-gray-50">
            Google
          </button>
          <button className="flex-1 rounded border border-gray-300 py-2 text-sm hover:bg-gray-50">
            GitHub
          </button> */}
        </div>

        {/* Sign Up */}
        <p className="text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className=" text-[#3882BEFF] hover:underline">
            Sign up
          </Link>
        </p>

        {/* Terms */}
        <p className="mt-6 text-center text-xs text-gray-400">
          By clicking continue, you agree to our{" "}
          <Link href="#" className="underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="underline">
            Privacy Policy
          </Link>.
        </p>
      </div>

      {/* โซนขวา (รูปหรือคอนเทนต์เพิ่มเติม) */}
      {/* hidden บนจอเล็ก (mobile) แต่แสดงบนจอ md ขึ้นไป */}
      {/* โซนขวา (รูปภาพ) */}
   <div className="hidden h-full w-full items-center justify-center bg-white md:flex md:w-1/2">
       <Image
       src="/room1.svg"
       alt="My Illustration"
       width={447}
       height={544}
     />
    </div>
    </div>
    </div>
  );
}
