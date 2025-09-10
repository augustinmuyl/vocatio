import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Results from "@/app/opportunities/_components/Results";

export default function OpportunitiesPage() {
  return (
    <div className="flex flex-col">
      <Navbar />
      <Results />
      <Footer />
    </div>
  );
}

