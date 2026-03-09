import { Suspense } from "react";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Bottons from "@/components/buttonSection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/footer";
import OurTeam from "@/components/ourTeam";
export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <main className="min-h-screen">
        <Navbar />
        <Hero />
        <About />
        <Bottons />
        <OurTeam />
        <Footer />
      </main>
    </Suspense>
  );
}
