"use client";

import { useCallback, useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  OPPORTUNITY_LOCATIONS,
  OPPORTUNITY_SORT_DIRECTIONS,
  OPPORTUNITY_SORT_FIELDS,
  OPPORTUNITY_THEMES,
  type OpportunityFiltersState,
  type OpportunityLocation,
  type OpportunitySortDirection,
  type OpportunitySortField,
  type OpportunityTheme,
} from "@/app/opportunities/_types";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 12;
const DEFAULT_SORT_BY: OpportunitySortField = "updated_at";
const DEFAULT_SORT_DIRECTION: OpportunitySortDirection = "desc";

const VALID_LOCATIONS = new Set<OpportunityLocation>(OPPORTUNITY_LOCATIONS);
const VALID_THEMES = new Set<OpportunityTheme>(OPPORTUNITY_THEMES);
const VALID_SORT_BY = new Set<OpportunitySortField>(OPPORTUNITY_SORT_FIELDS);
const VALID_SORT_DIRECTION = new Set<OpportunitySortDirection>(
  OPPORTUNITY_SORT_DIRECTIONS,
);

type UpdateParamsFn = (params: URLSearchParams) => void;

type SetSortArgs = {
  sortBy?: OpportunitySortField;
  sortDirection?: OpportunitySortDirection;
};

function parseInteger(
  value: string | null,
  fallback: number,
  { min, max }: { min?: number; max?: number } = {},
): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }

  if (min != null && parsed < min) {
    return min;
  }
  if (max != null && parsed > max) {
    return max;
  }

  return parsed;
}

function normalizeParams(params: URLSearchParams) {
  // Strip defaults to keep URLs clean.
  if (params.get("page") === String(DEFAULT_PAGE)) {
    params.delete("page");
  }
  if (params.get("page_size") === String(DEFAULT_PAGE_SIZE)) {
    params.delete("page_size");
  }
  if (params.get("sort_by") === DEFAULT_SORT_BY) {
    params.delete("sort_by");
  }
  if (params.get("sort_direction") === DEFAULT_SORT_DIRECTION) {
    params.delete("sort_direction");
  }
}

function ensureDefaultSort(param: string | null): OpportunitySortField {
  if (!param) {
    return DEFAULT_SORT_BY;
  }
  return VALID_SORT_BY.has(param as OpportunitySortField)
    ? (param as OpportunitySortField)
    : DEFAULT_SORT_BY;
}

function ensureDefaultDirection(
  param: string | null,
): OpportunitySortDirection {
  if (!param) {
    return DEFAULT_SORT_DIRECTION;
  }
  const lower = param.toLowerCase();
  return VALID_SORT_DIRECTION.has(lower as OpportunitySortDirection)
    ? (lower as OpportunitySortDirection)
    : DEFAULT_SORT_DIRECTION;
}

export function useOpportunityFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const filters = useMemo<OpportunityFiltersState>(() => {
    const paramsLocations = searchParams
      .getAll("locations")
      .map((value) => value.toUpperCase());
    const locations = paramsLocations.filter(
      (value): value is OpportunityLocation =>
        VALID_LOCATIONS.has(value as OpportunityLocation),
    );

    const paramsThemes = searchParams
      .getAll("themes")
      .map((value) => value.toUpperCase());
    const themes = paramsThemes.filter((value): value is OpportunityTheme =>
      VALID_THEMES.has(value as OpportunityTheme),
    );

    const page = parseInteger(searchParams.get("page"), DEFAULT_PAGE, {
      min: 1,
    });
    const pageSize = parseInteger(
      searchParams.get("page_size"),
      DEFAULT_PAGE_SIZE,
      {
        min: 1,
        max: 50,
      },
    );
    const sortBy = ensureDefaultSort(searchParams.get("sort_by"));
    const sortDirection = ensureDefaultDirection(
      searchParams.get("sort_direction"),
    );

    return {
      page,
      pageSize,
      sortBy,
      sortDirection,
      locations,
      themes,
    };
  }, [searchParams]);

  const updateSearchParams = useCallback(
    (updater: UpdateParamsFn) => {
      const nextParams = new URLSearchParams(searchParams.toString());
      updater(nextParams);
      normalizeParams(nextParams);
      const queryString = nextParams.toString();

      startTransition(() => {
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
          scroll: false,
        });
      });
    },
    [pathname, router, searchParams, startTransition],
  );

  const setLocations = useCallback(
    (values: string[] | null) => {
      updateSearchParams((params) => {
        params.delete("locations");
        if (values && values.length > 0) {
          values.forEach((value) => {
            const upper = value.toUpperCase();
            if (VALID_LOCATIONS.has(upper as OpportunityLocation)) {
              params.append("locations", upper);
            }
          });
        }
        params.delete("page");
      });
    },
    [updateSearchParams],
  );

  const setThemes = useCallback(
    (values: string[] | null) => {
      updateSearchParams((params) => {
        params.delete("themes");
        if (values && values.length > 0) {
          values.forEach((value) => {
            const upper = value.toUpperCase();
            if (VALID_THEMES.has(upper as OpportunityTheme)) {
              params.append("themes", upper);
            }
          });
        }
        params.delete("page");
      });
    },
    [updateSearchParams],
  );

  const setPage = useCallback(
    (page: number) => {
      updateSearchParams((params) => {
        if (page <= 1) {
          params.delete("page");
          return;
        }
        params.set("page", page.toString());
      });
    },
    [updateSearchParams],
  );

  const setPageSize = useCallback(
    (pageSize: number) => {
      updateSearchParams((params) => {
        const clamped = Math.min(Math.max(pageSize, 1), 50);
        if (clamped === DEFAULT_PAGE_SIZE) {
          params.delete("page_size");
        } else {
          params.set("page_size", String(clamped));
        }
        params.delete("page");
      });
    },
    [updateSearchParams],
  );

  const setSort = useCallback(
    ({ sortBy, sortDirection }: SetSortArgs) => {
      updateSearchParams((params) => {
        if (sortBy) {
          if (VALID_SORT_BY.has(sortBy)) {
            params.set("sort_by", sortBy);
          }
        }
        if (sortDirection) {
          if (VALID_SORT_DIRECTION.has(sortDirection)) {
            params.set("sort_direction", sortDirection);
          }
        }
      });
    },
    [updateSearchParams],
  );

  const resetFilters = useCallback(() => {
    updateSearchParams((params) => {
      params.delete("locations");
      params.delete("themes");
      params.delete("page");
      params.delete("page_size");
      params.delete("sort_by");
      params.delete("sort_direction");
    });
  }, [updateSearchParams]);

  return {
    filters,
    isPending,
    setLocations,
    setThemes,
    setPage,
    setPageSize,
    setSort,
    resetFilters,
  };
}

export type UseOpportunityFiltersReturn = ReturnType<
  typeof useOpportunityFilters
>;
