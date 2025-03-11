// components/WorkTogetherSection.tsx
import Image from "next/image";
import Link from "next/link";

const WorkTogetherSection = () => {
  return (
    <section className="bg-[#f4e2dc] px-8 py-12 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center md:flex-row-reverse">
          <div className="md:w-1/2 md:pl-12">
            <h2 className="mb-4 text-2xl font-bold text-[#221C3FFF] md:text-3xl">
            Unlock Smarter Room Management with AI-Powered Security
            </h2>
            <p className="mb-6 text-[#302858FF]">
            RFID, Face Recognition, and smart sensors ensure seamless access control and real-time security insights.
            </p>
            <Link href="#">
              <button className="rounded bg-[#E08184FF] px-6 py-3 text-white hover:bg-[#E06A6EFF]">
                Learn More
              </button>
            </Link>
          </div>
          <div className="mt-8 md:mt-0 md:w-1/2">
            <Image
              src="/images/work-together.png"
              alt="Work Together"
              width={500}
              height={400}
              className="mx-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkTogetherSection;