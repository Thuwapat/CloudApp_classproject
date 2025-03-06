// components/Footer.tsx
const Footer = () => {
    return (
      <footer className="bg-[#E06A6EFF] px-8 py-8 text-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex flex-row gap-0.5">
          <div className="text-xl font-bold">COE</div>
          <div className="text-xl font-bold">Access</div>
          </div>
          <div className="text-sm">
            © 2025 COE Access. All rights reserved.
          </div>
        </div>
      </footer>
    );
  };
  
  export default Footer;