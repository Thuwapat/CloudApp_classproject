import { useState } from "react";
import Link from "next/link";

const Navbar = ({ showDashboard = false }: { showDashboard?: boolean }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };
  interface NavbarProps {
    showDashboard?: boolean;
    showAuth?: boolean; // เพิ่มตัวเลือกเพื่อตัดสินใจว่าจะแสดง Sign in/Sign up หรือไม่
  }

  return (
    <header className="fixed top-3 left-2 right-2 rounded-2xl px-4 py-3 shadow-2xl bg-white z-50">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex flex-row gap-0.5">
          <div className="text-xl font-bold text-[#302858FF]">COE</div>
          <div className="text-xl font-bold text-[#E08184FF]">Access</div>
        </div>

        {/* Other actions */}
        <div className="space-x-4 ">
          {showDashboard && (
            <Link href="/dashboard" className="hover:text-[#E08184FF] flex justify-items-center">
              Dashboard
            </Link>
          )}
          <Link href="/signin">
            <button className="text-[#302858FF] hover:text-[#E06A6EFF]">
              Sign in
            </button>
          </Link>
          <Link href="/signup">
            <button className="rounded bg-[#E08184FF] px-4 py-2 text-white hover:bg-[#E06A6EFF]">
              Sign up
            </button>
          </Link>
        </div>
      </div>    
    </header>
    
  );
};

export default Navbar;
