"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BadgeCheck as BadgeCheckIcon } from "lucide-react";
import { motion } from "motion/react";
import { fadeInSide } from "@/lib/variants";

type Opportunity = {
  id: string;
  title: string;
  description?: string | null;
  communityHours: number | null;
  approved: boolean;
};

type OpportunityListItem = {
  id: string;
  title: string;
  slug: string;
  community_hours: number | null;
  themes: string[] | null;
  start_at: string;
  end_at: string;
  timezone: string;
};

type OpportunityListResponse = {
  items: OpportunityListItem[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
};

const cardsContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.7,
    },
  },
};

export default function Results() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchOpportunities() {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

      if (!baseUrl) {
        setError("Backend URL is not configured");
        return;
      }

      try {
        const response = await fetch(`${baseUrl}/opportunities`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data: OpportunityListResponse = await response.json();
        const mapped = data.items.map((item) => ({
          id: item.id,
          title: item.title,
          description: null,
          communityHours: item.community_hours,
          approved: true,
        }));

        setOpportunities(mapped);
        setError(null);
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          return;
        }
        console.error("Failed to load opportunities", err);
        setError("Unable to load opportunities");
      }
    }

    fetchOpportunities();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <main className="w-full px-6 sm:px-8 lg:px-12 pb-16">
      <div className="mx-auto max-w-6xl">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}
        {!error && opportunities.length === 0 ? (
          <p className="text-sm text-text-mute">No opportunities available yet.</p>
        ) : null}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 items-stretch gap-6 lg:gap-8"
          variants={cardsContainer}
          initial="show"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {opportunities.map((opportunity) => (
            <motion.div key={opportunity.id} variants={fadeInSide} className="h-full">
              <Card className="relative flex h-full min-h-[200px] flex-col gap-3 p-6 text-text">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between w-full">
                  <h3 className="text-xl font-semibold leading-snug">
                    {opportunity.title}
                  </h3>
                  {opportunity.approved ? (
                    <Badge
                      className="rounded-md border-transparent bg-success/45 text-text"
                      aria-label="Approved opportunity"
                    >
                      <BadgeCheckIcon />
                      Approved
                    </Badge>
                  ) : null}
                </div>

                <p className="text-text-mute">
                  {opportunity.description ?? "Details coming soon."}
                </p>

                <p className="mt-auto pt-4 text-text-mute">
                  {opportunity.communityHours ?? 0} hours · Counts for Graduation
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
