"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { apiAuth } from "@/utility/axiosInstance";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    const fetchUserData = async () => {
      if (token) {
        try {
          localStorage.setItem("token", token);
          const response = await apiAuth.get("/protected", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const userData = response.data;
          localStorage.setItem("user", JSON.stringify({
            id: userData.user_id,
            role: userData.role,
            first_name: userData.first_name || "User",
            email: userData.email || "email@example.com",
          }));
          // Redirect Depend on Role
          if (userData.role === "student") {
            router.push("/room_req");
          } else if (userData.role === "teacher" || userData.role === "admin") {
            router.push("/dashboard");
          } else {
            router.push("/login?error=Unknown role");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          router.push("/login?error=Failed to fetch user data");
        }
      } else {
        router.push("/login?error=No token provided");
      }
    };

    fetchUserData();
  }, [token, router]);

  return <div>Processing authentication...</div>;
}