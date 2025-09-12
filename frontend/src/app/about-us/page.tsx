import Navbar from "@/components/Navbar";
import AboutUs from "@/app/about-us/_components/AboutUs";
import Footer from "@/components/Footer";

export default function AboutUsPage() {
  return (
    <div className="flex flex-col justify-between min-h-screen">
      <Navbar />
      <AboutUs />
      <Footer />
    </div>
  );
}
