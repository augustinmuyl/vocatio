import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

export default function BrowsePage() {
  return (
    <div className="flex flex-col">
      <Navbar />

      <div className="h-[83vh] mt-30 w-full max-w-2/3 flex flex-col gap-4 items-center">
        <div className="flex gap-4">
          <Card className="rounded-lg">Search opportunities...</Card>
          <Card>Location ^</Card>
          <Card>Theme ^</Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
