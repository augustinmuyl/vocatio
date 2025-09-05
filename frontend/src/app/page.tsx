import Navbar from "@/components/Navbar";
import Hero from "@/app/_components/Hero";
import About from "@/app/_components/About";
import HowItWorks from "@/app/_components/HowItWorks";
import Waitlist from "@/app/_components/Waitlist";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Navbar />
      <Hero />
      <About />
      <HowItWorks />
      <Waitlist />
      <Footer />
    </div>
  );
}
