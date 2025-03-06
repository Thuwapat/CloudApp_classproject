// components/Navbar.tsx
import Link from "next/link";

const Navbar = () => {
  return (
    <header className="fixed top-3 left-2 right-2 rounded-2xl px-4 py-3 shadow-2xl bg-white z-50">
      <div className="flex items-center justify-between">
        <div className=" flex flex-row gap-0.5">
        <div className="text-xl font-bold text-[#302858FF]">COE</div>
        <div className="text-xl font-bold text-[#E08184FF]">  Access</div>
        </div>
        
        <nav className="hidden space-x-4 md:block px-2 ">
          <Link href="#">
            <span className="text-[#302858FF] hover:text-[#E06A6EFF]">Products</span>
          </Link>
          <Link href="#">
            <span className="text-[#302858FF] hover:text-[#E06A6EFF]">Admin</span>
          </Link>
          <Link href="#">
            <span className="text-[#302858FF] hover:text-[#E06A6EFF]">Resources</span>
          </Link>
          <Link href="#">
            <span className="text-[#302858FF] hover:text-[#E06A6EFF]">About us</span>
          </Link>
        </nav>
        
        <div className="space-x-4">
          <Link href="/signin">
            <button className="text-[#302858FF] hover:text-[#E06A6EFF]">Sign in</button>
          </Link>
          <Link href="/signup">
            <button className="rounded bg-[#E08184FF] px-4 py-2 text-white hover:bg-[#E06A6EFF]">
              sing up
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
