// components/HeroSection.tsx
import Image from "next/image";
import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="flex flex-col-reverse items-center justify-between gap-8 px-8 py-12 bg-[#E08184FF] md:flex-row md:py-24">
      <div className="md:w-1/2">
        <h1 className="mb-4 text-3xl font-bold text-[#221C3FFF] md:text-5xl">
        Smart Room Access, Secure & Effortless
        </h1>
        <p className="mb-6 text-[#302858FF]">
        Manage room access effortlessly with RFID and Face Recognition. Track usage, ensure security, and receive real-time alerts..
        </p>
        <Link href="#">
          <button className="rounded bg-white px-6 py-3 text-[#221C3FFF] hover:bg-gray-50">
          Get Started Now
          </button>
        </Link>
      </div>

      <div className="md:w-1/2">
        <Image
          src="/images/hero-illustration1.png"
          alt="Hero Illustration"
          width={500}
          height={400}
          className="mx-auto"
        />
      </div>
    </section>
  );
};

export default HeroSection;
