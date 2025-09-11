"use client";

import { motion } from "motion/react";
import { container, fadeInUp } from "@/lib/variants";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import * as React from "react";
import { SearchIcon } from "lucide-react";

export default function TopBar() {
  const [search, setSearch] = React.useState("");
  const [location, setLocation] = React.useState<string | null>(null);
  const [theme, setTheme] = React.useState<string | null>(null);

  const locationOptions = [
    { value: "nyc", label: "New York" },
    { value: "mia", label: "Miami" },
    { value: "remote", label: "Remote" },
    { value: "other", label: "Other" },
  ];

  const themeOptions = [
    { value: "environment", label: "Environment" },
    { value: "education", label: "Education" },
    { value: "community", label: "Community" },
    { value: "health", label: "Health" },
    { value: "arts", label: "Arts & Culture" },
  ];
  return (
    <section className="px-6 sm:px-8 lg:px-12 pt-28 pb-8">
      <motion.div
        className="mx-auto max-w-6xl text-left"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-text leading-tight tracking-tight"
          variants={fadeInUp}
        >
          Discover Community Service Opportunities
        </motion.h1>
        <motion.p
          className="mt-3 max-w-2xl text-base sm:text-lg text-text-mute"
          variants={fadeInUp}
        >
          Explore curated, verified ways to contribute and earn hours that count toward graduation.
        </motion.p>

        <motion.div
          className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto] items-center gap-3"
          variants={fadeInUp}
        >
          <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 opacity-50" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search opportunities..."
              aria-label="Search opportunities"
              className="pl-9 bg-background dark:bg-[oklh(0.15 0.005 264)] border border-border shadow-xs hover:bg-accent hover:text-accent-foreground dark:hover:bg-input/50"
            />
          </div>
          <div className="col-span-1 w-full">
            <Combobox
              options={locationOptions}
              value={location}
              onChange={(v) => setLocation(v)}
              placeholder="Location"
              buttonWidthClassName="w-full lg:w-[200px]"
              contentClassName="w-[var(--radix-popover-trigger-width)] lg:w-[200px]"
            />
          </div>
          <div className="col-span-1 w-full">
            <Combobox
              options={themeOptions}
              value={theme}
              onChange={(v) => setTheme(v)}
              placeholder="Theme"
              buttonWidthClassName="w-full lg:w-[200px]"
              contentClassName="w-[var(--radix-popover-trigger-width)] lg:w-[200px]"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
