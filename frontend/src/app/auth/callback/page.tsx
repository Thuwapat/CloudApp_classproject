"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      alert("Google Sign in successful");
      router.push("/"); // Redirect to home or dashboard
    } else {
      alert("No token found in callback");
      router.push("/login");
    }
  }, [router]);

  return <div>Processing Google login...</div>;
}