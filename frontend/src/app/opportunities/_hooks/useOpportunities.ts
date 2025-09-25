import { useEffect, useState } from "react";

import {
  type OpportunityFilters,
  type OpportunityListItem,
  type OpportunityListResponse,
} from "@/app/opportunities/_types";

type UseOpportunitiesState = {
  opportunities: OpportunityListItem[];
  total: number;
  isLoading: boolean;
  error: string | null;
};

const initialState: UseOpportunitiesState = {
  opportunities: [],
  total: 0,
  isLoading: true,
  error: null,
};

export function useOpportunities(filters: OpportunityFilters) {
  const [{ opportunities, total, isLoading, error }, setState] =
    useState<UseOpportunitiesState>(initialState);

  const { search, page, pageSize, sortBy, sortDirection, locations, themes } =
    filters;

  useEffect(() => {
    const controller = new AbortController();

    async function fetchOpportunities() {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

      if (!baseUrl) {
        setState({
          opportunities: [],
          total: 0,
          isLoading: false,
          error: "Backend URL is not configured",
        });
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const params = new URLSearchParams();
        if (search) {
          params.set("search", search);
        }
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

        const response = await fetch(
          `${baseUrl}/opportunities?${params.toString()}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data: OpportunityListResponse = await response.json();
        const mapped = data.items.map<OpportunityListItem>((item) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          preview: item.preview,
          communityHours: item.community_hours,
          approved: true,
        }));

        setState({
          opportunities: mapped,
          total: data.total,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          return;
        }

        setState({
          opportunities: [],
          total: 0,
          isLoading: false,
          error: "Unable to load opportunities",
        });
        console.error("Failed to load opportunities", err);
      }
    }

    fetchOpportunities();

    return () => {
      controller.abort();
    };
  }, [locations, page, pageSize, search, sortBy, sortDirection, themes]);

  return { opportunities, total, isLoading, error };
}

export type {
  OpportunityFilters,
  OpportunityListItem,
  OpportunityListItemResponse,
  OpportunityListResponse,
} from "@/app/opportunities/_types";
