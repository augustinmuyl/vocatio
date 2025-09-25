"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { SearchIcon } from "lucide-react";

import { useOpportunityFilters } from "@/app/opportunities/_hooks/useOpportunityFilters";
import {
  OPPORTUNITY_LOCATIONS,
  OPPORTUNITY_LOCATION_LABELS,
  OPPORTUNITY_THEMES,
  OPPORTUNITY_THEME_LABELS,
} from "@/app/opportunities/_types";

export default function TopBar() {
  const {
    filters,
    setSearch: setSearchFilter,
    setLocations,
    setThemes,
  } = useOpportunityFilters();

  const { search } = filters;
  const [inputValue, setInputValue] = React.useState(search);

  React.useEffect(() => {
    setInputValue(search);
  }, [search]);

  const location = filters.locations[0] ?? null;
  const theme = filters.themes[0] ?? null;

  const locationOptions = OPPORTUNITY_LOCATIONS.map((value) => ({
    value,
    label: OPPORTUNITY_LOCATION_LABELS[value],
  }));

  const themeOptions = OPPORTUNITY_THEMES.map((value) => ({
    value,
    label: OPPORTUNITY_THEME_LABELS[value],
  }));
  return (
    <section className="px-6 sm:px-8 lg:px-12 pt-28 pb-8">
      <div className="mx-auto max-w-6xl text-left">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text leading-tight tracking-tight">
          Discover Community Service Opportunities
        </h1>
        <p className="mt-3 max-w-2xl text-base sm:text-lg text-text-mute">
          Explore curated, verified ways to contribute and earn hours that count
          toward graduation.
        </p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto] items-center gap-3">
          <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 opacity-50" />
            <Input
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  setSearchFilter(inputValue);
                }
              }}
              placeholder="Search opportunities..."
              aria-label="Search opportunities"
              className="pl-9 bg-background dark:bg-[oklh(0.15 0.005 264)] border border-border shadow-xs hover:bg-accent hover:text-accent-foreground dark:hover:bg-input/50"
            />
          </div>
          <div className="col-span-1 w-full">
            <Combobox
              options={locationOptions}
              value={location}
              onChange={(value) => setLocations(value ? [value] : null)}
              placeholder="Location"
              buttonWidthClassName="w-full lg:w-[200px]"
              contentClassName="w-[var(--radix-popover-trigger-width)] lg:w-[200px]"
            />
          </div>
          <div className="col-span-1 w-full">
            <Combobox
              options={themeOptions}
              value={theme}
              onChange={(value) => setThemes(value ? [value] : null)}
              placeholder="Theme"
              buttonWidthClassName="w-full lg:w-[200px]"
              contentClassName="w-[var(--radix-popover-trigger-width)] lg:w-[200px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
