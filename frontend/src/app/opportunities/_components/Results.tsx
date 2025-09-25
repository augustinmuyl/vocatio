"use client";

import { useCallback, useMemo } from "react";
import type { MouseEvent } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BadgeCheck as BadgeCheckIcon } from "lucide-react";
import { useOpportunityFilters } from "@/app/opportunities/_hooks/useOpportunityFilters";
import { useOpportunities } from "@/app/opportunities/_hooks/useOpportunities";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function Results() {
  const { filters, setPage, isPending } = useOpportunityFilters();
  const { search, page, pageSize, sortBy, sortDirection, locations, themes } =
    filters;

  const { opportunities, total, isLoading, error } = useOpportunities({
    search,
    page,
    pageSize,
    sortBy,
    sortDirection,
    locations,
    themes,
  });

  const filterKey = [
    search,
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

  const totalPages = useMemo(() => {
    if (pageSize <= 0) {
      return 0;
    }
    if (total <= 0) {
      return 0;
    }
    return Math.max(1, Math.ceil(total / pageSize));
  }, [pageSize, total]);

  const paginationRange = useMemo(() => {
    if (totalPages <= 0) {
      return [] as Array<number | "ellipsis">;
    }

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const range: Array<number | "ellipsis"> = [];
    const add = (value: number | "ellipsis") => {
      if (range[range.length - 1] !== value) {
        range.push(value);
      }
    };

    const delta = 2;
    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);

    add(1);

    if (left > 2) {
      add("ellipsis");
    } else {
      for (let current = 2; current < left; current += 1) {
        add(current);
      }
    }

    for (let current = left; current <= right; current += 1) {
      add(current);
    }

    if (right < totalPages - 1) {
      add("ellipsis");
    } else {
      for (let current = right + 1; current < totalPages; current += 1) {
        add(current);
      }
    }

    add(totalPages);

    return range;
  }, [page, totalPages]);

  const isPageTransitionDisabled = isLoading || isPending;
  const canGoToPrevious = page > 1;
  const canGoToNext = totalPages > 0 ? page < totalPages : false;
  const shouldShowPagination = totalPages > 1 || page > 1;

  const handlePageChange = useCallback(
    (nextPage: number) => {
      if (
        isPageTransitionDisabled ||
        nextPage === page ||
        nextPage < 1 ||
        (totalPages > 0 && nextPage > totalPages && nextPage > page)
      ) {
        return;
      }

      setPage(nextPage);
    },
    [isPageTransitionDisabled, page, setPage, totalPages],
  );

  const createPageClickHandler = useCallback(
    (nextPage: number, disabled: boolean) =>
      (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        if (disabled) {
          return;
        }
        handlePageChange(nextPage);
      },
    [handlePageChange],
  );

  const skeletonCards = useMemo(() => {
    const count = Math.min(Math.max(pageSize, 1), 12);
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

  return (
    <main className="w-full px-6 sm:px-8 lg:px-12 pb-16">
      <div className="mx-auto max-w-6xl">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {hasSummary || isLoading ? (
          <p className="mb-4 ml-1 text-sm text-text-mute">
            Showing {startItem}-{endItem} of {total} opportunities
          </p>
        ) : null}
        {!error && !isLoading && opportunities.length === 0 ? (
          <p className="text-sm text-text-mute">
            No opportunities available yet.
          </p>
        ) : null}
        <div
          key={isLoading ? "loading" : filterKey}
          className="grid grid-cols-1 md:grid-cols-2 items-stretch gap-6 lg:gap-8"
        >
          {isLoading
            ? skeletonCards
            : opportunities.map((opportunity) => (
                <div key={opportunity.id} className="h-full">
                  <Link
                    href={`/opportunities/${opportunity.slug}`}
                    className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <Card className="relative flex h-full min-h-[200px] flex-col gap-3 p-6 text-text transition-shadow hover:shadow-lg focus-visible:shadow-lg">
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

                      <p className="text-text-mute line-clamp-2">
                        {opportunity.preview || "Details coming soon."}
                      </p>

                      <p className="mt-auto pt-4 text-text-mute">
                        {opportunity.communityHours ?? 0} hours · Counts for
                        Graduation
                      </p>
                    </Card>
                  </Link>
                </div>
              ))}
        </div>
        {shouldShowPagination ? (
          <div className="mt-10">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    aria-disabled={!canGoToPrevious || isPageTransitionDisabled}
                    tabIndex={
                      !canGoToPrevious || isPageTransitionDisabled
                        ? -1
                        : undefined
                    }
                    className={
                      !canGoToPrevious || isPageTransitionDisabled
                        ? "pointer-events-none opacity-50"
                        : undefined
                    }
                    onClick={createPageClickHandler(
                      page - 1,
                      !canGoToPrevious || isPageTransitionDisabled,
                    )}
                  />
                </PaginationItem>
                {paginationRange.map((item, index) => (
                  <PaginationItem key={`${item}-${index}`}>
                    {item === "ellipsis" ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href="#"
                        size="default"
                        isActive={item === page}
                        aria-disabled={isPageTransitionDisabled}
                        tabIndex={isPageTransitionDisabled ? -1 : undefined}
                        className={
                          isPageTransitionDisabled
                            ? "pointer-events-none opacity-50"
                            : undefined
                        }
                        onClick={createPageClickHandler(
                          item,
                          isPageTransitionDisabled,
                        )}
                      >
                        {item}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    aria-disabled={!canGoToNext || isPageTransitionDisabled}
                    tabIndex={
                      !canGoToNext || isPageTransitionDisabled ? -1 : undefined
                    }
                    className={
                      !canGoToNext || isPageTransitionDisabled
                        ? "pointer-events-none opacity-50"
                        : undefined
                    }
                    onClick={createPageClickHandler(
                      page + 1,
                      !canGoToNext || isPageTransitionDisabled,
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        ) : null}
      </div>
    </main>
  );
}
