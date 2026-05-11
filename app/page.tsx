import FeatureCard from "@/components/ui/FeatureCard";
import Navbar from "@/components/layout/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
        <h1 className="text-6xl font-bold mb-6">
          Sports Management System
        </h1>

        <p className="text-xl text-gray-300 max-w-2xl">
          A modern college sports platform for equipment tracking,
          slot booking, announcements, and student access management.
        </p>
      </section>

      <section className="px-8 pb-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

          <FeatureCard
            title="Equipment Tracking"
            description="Monitor sports equipment availability, damaged gear, and inventory status in real time."
          />

          <FeatureCard
            title="Slot Booking"
            description="Students can reserve sports slots, swimming sessions, and training availability online."
          />

          <FeatureCard
            title="Role-Based Access"
            description="Separate dashboards and permissions for students, admins, and sports staff."
          />

        </div>
      </section>

    </main>
  );
}