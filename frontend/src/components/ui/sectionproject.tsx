// components/ProjectManagementSection.tsx
import Image from "next/image";
import Link from "next/link";

const ProjectManagementSection = () => {
  return (
    <section className="px-8 py-12 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center md:flex-row gap-12">
          <div className="md:w-1/2">
            <Image
              src="/images/project-management.jpg"
              alt="Project Management"
              width={500}
              height={400}
              className="mx-auto"
            />
          </div>
          <div className="mt-8 md:mt-0 md:w-1/2 md:pl-12">
            <h2 className="mb-4 text-2xl font-bold text-[#221C3FFF] md:text-3xl">
            Effortless Room Access with Advanced Security Features
            </h2>
            <p className="mb-6 text-[#302858FF]">
            Enhance security and convenience with automated room access, real-time monitoring, and historical usage tracking.
            </p>
            <Link href="#">
              <button className="rounded bg-[#E08184FF] px-6 py-3 text-white hover:bg-[#E06A6EFF]">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectManagementSection;