"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [agreePolicy, setAgreePolicy] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch("http://localhost:5000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        first_name: firstName,
        last_name: lastName,
        password,
      }), // Removed role from the request
    });

    const data = await response.json();
    if (response.ok) {
      alert("Registration successful! Please log in.");
      window.location.href = "/signin";
    } else {
      alert(`Registration failed: ${data.error}`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4e2dc] p-4">
      <div className="mx-auto flex w-full max-w-5xl flex-col-reverse items-center gap-8 md:flex-row md:gap-12">
        {/* Left side: Form */}
        <div className="w-full rounded-lg bg-white p-6 shadow md:w-1/2">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Create your Account</h2>
          <p className="mb-6 text-sm text-gray-500">
            Start your website in seconds. Already have an account?{" "}
            <Link href="/signin" className="text-[#E08184FF] hover:underline">
              Login here
            </Link>
            .
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Your email
              </label>
              <Input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                First Name
              </label>
              <Input
                type="text"
                required
                placeholder="Bonnie"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <Input
                type="text"
                required
                placeholder="Green"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                type="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Checkbox & Terms */}
            <div className="mt-4 space-y-2 text-sm text-gray-500">
              <div>
                <input
                  id="newsletter"
                  type="checkbox"
                  checked={newsletter}
                  onChange={() => setNewsletter(!newsletter)}
                  className="mr-2 h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="newsletter">
                  Email me about product updates and resources.
                </label>
              </div>
              <div>
                <input
                  id="policy"
                  type="checkbox"
                  checked={agreePolicy}
                  onChange={() => setAgreePolicy(!agreePolicy)}
                  className="mr-2 h-4 w-4 rounded border-gray-300"
                  required
                />
                <label htmlFor="policy">
                  By signing up, you are creating a Flowbite account and you agree to
                  Flowbite's{" "}
                  <a className="text-blue-600 hover:underline" href="#">
                    Terms of Use
                  </a>{" "}
                  and{" "}
                  <a className="text-blue-600 hover:underline" href="#">
                    Privacy Policy
                  </a>
                  .
                </label>
              </div>
            </div>

            <Button
              type="submit"
              disabled={!agreePolicy}
              className="bg-[#221C3FFF] w-full rounded-md py-2 hover:bg-[#16122BFF] focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              Create an account
            </Button>
          </form>
        </div>

        {/* Right side: Illustration with animation */}
        <div className="flex w-full items-center justify-center md:w-1/2">
          <Image
            src="/image_room.svg"
            alt="Register Illustration"
            width={800}
            height={400}
            className="transition-transform duration-500 hover:scale-105 hover:rotate-1"
          />
        </div>
      </div>
    </div>
  );
}