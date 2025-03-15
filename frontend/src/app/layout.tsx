import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";

// ✅ Define metadata for SEO and browser tab title
export const metadata: Metadata = {
  title: "COE Access",
  description: "Manage smart room access securely and effortlessly.",
};

// ✅ Import Poppins font
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"], // Regular & Bold
  variable: "--font-poppins", // Define a CSS variable
});

interface RootLayoutProps {
  children: ReactNode;
}

// ✅ Root Layout Component
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Add a favicon */}
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${poppins.variable} antialiased bg-[#F5F3EF]`}>
        {children}
      </body>
    </html>
  );
}
