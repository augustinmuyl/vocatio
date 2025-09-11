import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TopBar from "@/app/opportunities/_components/TopBar";
import Results from "@/app/opportunities/_components/Results";

export default function OpportunitiesPage() {
  return (
    <div className="flex flex-col justify-between min-h-screen">
      <Navbar />
      <div>
        <TopBar />
        <Results />
      </div>
      <Footer />
    </div>
  );
}
