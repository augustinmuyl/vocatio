import { Suspense } from "react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TopBar from "@/app/opportunities/_components/TopBar";
import Results from "@/app/opportunities/_components/Results";

function TopBarFallback() {
  return (
    <section className="px-6 sm:px-8 lg:px-12 pt-28 pb-8">
      <div className="mx-auto max-w-6xl h-24 rounded-lg bg-muted animate-pulse" aria-hidden />
    </section>
  );
}

function ResultsFallback() {
  return (
    <main className="w-full px-6 sm:px-8 lg:px-12 pb-16 min-h-screen">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          <div className="h-48 rounded-lg bg-muted animate-pulse" aria-hidden />
          <div className="hidden md:block h-48 rounded-lg bg-muted animate-pulse" aria-hidden />
        </div>
      </div>
    </main>
  );
}

export default function OpportunitiesPage() {
  return (
    <div className="flex flex-col justify-between min-h-screen">
      <Navbar />
      <div>
        <Suspense fallback={<TopBarFallback />}>
          <TopBar />
        </Suspense>
        <Suspense fallback={<ResultsFallback />}>
          <Results />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
