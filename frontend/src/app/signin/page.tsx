"use client";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import { useState } from "react";
import Label from "@/components/ui/label";
import Input from "@/components/ui/input";
import { apiAuth } from "@/utility/axiosInstance";
import Button from "@/components/ui/button";
import { useRouter } from "next/navigation"; // Import useRouter

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null); // Store response data
  const router = useRouter(); // Initialize useRouter
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiAuth.post("/login", { email, password });
      const loginData = response.data;
      setData(loginData);
      localStorage.setItem("token", loginData.token);
      localStorage.setItem("user", JSON.stringify(loginData.user));
      
      // Check the user's role and redirect
      const userRole = loginData.user.role; // Assuming role is in user object
      if (userRole === "student") {
        router.push("/room_req"); // Request-room
      } else if (userRole === "teacher" || userRole === "admin") {
        router.push("/dashboard"); // Redirect to Dashboard
      } else {
        setError("Unknown role detected");
      }

      alert("Login successful");
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Login
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const response = await apiAuth.get("/auth/google"); // Call the backend Google OAuth endpoint
      window.location.href = response.data.authorization_url; // Redirect to Google auth URL
    } catch (error: any) {
      console.error("Google Login error:", error);
      setError(error.response?.data?.error || "Something went wrong with Google Login");
    } finally {
      setLoading(false);
    }
  };

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
              <Input
                type="email"
                placeholder="name@kku.ac.th , name@kkumail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <Label className="font-bold text-[#221d42]">Password</Label>
                <Link href="#" className="text-sm text-[#3882BEFF] hover:underline">
                  Forgot your password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="Enter your password "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              className="bg-[#221C3FFF] w-full rounded-md py-2 hover:bg-[#16122BFF]"
              type="submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* Separator */}
          <div className="mb-4 flex items-center">
            <div className="h-px flex-1 bg-gray-200"></div>
            <p className="px-3 text-sm text-gray-400">Or continue with</p>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>

          {/* ปุ่ม Social Login */}
          <div className="mb-6 flex gap-2">
            {/* Google Login Button */}
            <Button
              className="flex-1 rounded border py-2 bg-[#E08184FF] text-sm hover:bg-[#E06A6EFF]"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? "Loading..." : "Sign in with Google"}
            </Button>

            {/* SSO KKU Button (existing) */}
            <Button
              className="flex-1 rounded border py-2 bg-[#E08184FF] text-sm hover:bg-[#E06A6EFF]"
              onClick={() => alert("SSO KKU login not implemented yet")}
              disabled={loading}
            >
              SSO KKU
            </Button>
          </div>

          {/* Sign Up */}
          <p className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#3882BEFF] hover:underline">
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

          {/* Error Message */}
          {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}
        </div>

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