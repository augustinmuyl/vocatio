"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BadgeCheck as BadgeCheckIcon } from "lucide-react";
import { motion } from "motion/react";
import { fadeInSide } from "@/lib/variants";
import { useOpportunityFilters } from "@/app/opportunities/_hooks/useOpportunityFilters";

type Opportunity = {
  id: string;
  title: string;
  preview: string;
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
  preview: string;
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);

  const { filters } = useOpportunityFilters();
  const { page, pageSize, sortBy, sortDirection, locations, themes } = filters;

  const filterKey = [
    page,
    pageSize,
    sortBy,
    sortDirection,
    locations.join("|"),
    themes.join("|"),
  ].join(":");

  const hasSummary = !error && !isLoading && total > 0;
  const startItem = hasSummary ? (page - 1) * pageSize + 1 : 0;
  const endItem = hasSummary ? startItem + opportunities.length - 1 : 0;

  useEffect(() => {
    const controller = new AbortController();

    async function fetchOpportunities() {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

      if (!baseUrl) {
        setError("Backend URL is not configured");
        setIsLoading(false)
        return;
      }

      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("page_size", String(pageSize));
        params.set("sort_by", sortBy);
        params.set("sort_direction", sortDirection);

        locations.forEach((location) => {
          params.append("locations", location);
        });

        themes.forEach((theme) => {
          params.append("themes", theme);
        });

        const response = await fetch(`${baseUrl}/opportunities?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data: OpportunityListResponse = await response.json();
        const mapped = data.items.map((item) => ({
          id: item.id,
          title: item.title,
          preview: item.preview,
          communityHours: item.community_hours,
          approved: true,
        }));

        setOpportunities(mapped);
        setError(null);
        setTotal(data.total);
        setIsLoading(false)
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          return;
        }
        console.error("Failed to load opportunities", err);
        setError("Unable to load opportunities");
        setIsLoading(false)
      }
    }

    setIsLoading(true)
    fetchOpportunities();

    return () => {
      controller.abort();
    };
  }, [page, pageSize, sortBy, sortDirection, locations, themes]);

  return (
    <main className="w-full px-6 sm:px-8 lg:px-12 pb-16 min-h-screen">
      <div className="mx-auto max-w-6xl">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}
        {hasSummary ? (
          <p className="mb-4 text-sm text-text-mute">
            Showing {startItem}-{endItem} of {total} opportunities
          </p>
        ) : null}
        {!error && !isLoading && opportunities.length === 0 ? (
          <p className="text-sm text-text-mute">No opportunities available yet.</p>
        ) : null}
        <motion.div
          key={isLoading ? "loading" : filterKey}
          className="grid grid-cols-1 md:grid-cols-2 items-stretch gap-6 lg:gap-8"
          variants={cardsContainer}
          initial={"hidden"}
          animate={"show"}
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
                  {opportunity.preview || "Details coming soon."}
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
