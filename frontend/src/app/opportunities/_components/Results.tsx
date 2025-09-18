"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BadgeCheck as BadgeCheckIcon } from "lucide-react";
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

  const skeletonCards = useMemo(() => {
    const count = Math.min(Math.max(pageSize, 1), 6);
    return Array.from({ length: count }, (_, index) => (
      <div key={`skeleton-${index}`} className="h-full">
        <Card className="relative flex h-full min-h-[200px] flex-col gap-3 p-6 text-text">
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-6 w-3/4 sm:w-2/3" />
            <Skeleton className="h-6 w-20 sm:w-24" />
          </div>
          <Skeleton className="h-4 w-3/4 sm:w-2/3" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[85%]" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="mt-auto h-4 w-1/3" />
        </Card>
      </div>
    ));
  }, [pageSize]);

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
    <main className="w-full px-6 sm:px-8 lg:px-12 pb-16">
      <div className="mx-auto max-w-6xl">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}
        {hasSummary || isLoading ? (
          <p className="mb-4 text-sm text-text-mute">
            Showing {startItem}-{endItem} of {total} opportunities
          </p>
        ) : null}
        {!error && !isLoading && opportunities.length === 0 ? (
          <p className="text-sm text-text-mute">No opportunities available yet.</p>
        ) : null}
        <div
          key={isLoading ? "loading" : filterKey}
          className="grid grid-cols-1 md:grid-cols-2 items-stretch gap-6 lg:gap-8"
        >
          {isLoading
            ? skeletonCards
            : opportunities.map((opportunity) => (
              <div key={opportunity.id} className="h-full">
                <Card className="relative flex h-full min-h-[200px] flex-col gap-3 p-6 text-text">
                  <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
              </div>
            ))}
        </div>
      </div>
    </main >
  );
}
