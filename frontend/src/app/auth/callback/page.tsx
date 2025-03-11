"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      // Store the token
      localStorage.setItem("token", token);

      // Decode the token to get the role (optional, for immediate use)
      const decoded = JSON.parse(atob(token.split(".")[1]));
      const role = decoded.role;

      // Redirect based on role
      if (role === "student") {
        router.push("/");
      } else if (role === "teacher" || role === "admin") {
        router.push("/dashboard");
      } else {
        router.push("/login?error=Unknown role");
      }
    } else {
      router.push("/login?error=No token provided");
    }
  }, [token, router]);

  return <div>Processing authentication...</div>; // Loading state
}