import type { Metadata } from "next";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

import Opportunity from "@/app/opportunities/[slug]/_components/Opportunity";
import { getOpportunity } from "@/app/opportunities/_hooks/useOpportunity";

const FALLBACK_TITLE = "Opportunity";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const opportunity = await getOpportunity(slug);
    return {
      title: `${opportunity.title} | Vocatio`,
      description: opportunity.description.slice(0, 160),
    };
  } catch {
    return {
      title: `${FALLBACK_TITLE} | Vocatio`,
    };
  }
}

export default async function OpportunityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const opportunity = await getOpportunity(slug);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <Opportunity opportunity={opportunity} />
      <Footer />
    </div>
  );
}
