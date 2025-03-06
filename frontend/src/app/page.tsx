// pages/index.tsx
"use client"; // ใช้ถ้าใช้ Next.js 13+

import Navbar from "@/components/ui/navbar";
import HeroSection from "@/components/ui/sectionhero";
import ProjectManagementSection from "@/components/ui/sectionproject";
import WorkTogetherSection from "@/components/ui/sectionwork";
import Footer from "@/components/ui/footer";

export default function HomePage() {
  return (
    <main className="bg-white">
      <Navbar  />
      <HeroSection />
      <ProjectManagementSection />
      <WorkTogetherSection />
      <Footer />
    </main>
  );
}

