"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BadgeCheck as BadgeCheckIcon } from "lucide-react";
import { motion } from "motion/react";
import { container, fadeInSide } from "@/lib/variants";

type Opportunity = {
  id: string;
  title: string;
  description: string;
  hours: number;
  approved: boolean;
};

const MOCK_DATA: Opportunity[] = [
  {
    id: "park-cleanup",
    title: "Park Cleanup at Riverside",
    description: "Help restore the riverside park with local volunteers.",
    hours: 4,
    approved: true,
  },
  {
    id: "tutoring-elementary",
    title: "Tutoring Elementary School Students",
    description: "Assist children with reading and math skills.",
    hours: 2,
    approved: true,
  },
  {
    id: "community-garden",
    title: "Community Garden Maintenance",
    description: "Support sustainable gardening initiatives.",
    hours: 3,
    approved: true,
  },
  {
    id: "shelter-meals",
    title: "Serve Meals at Local Shelter",
    description: "Help prepare and serve meals at the shelter.",
    hours: 5,
    approved: true,
  },
];
const cardsContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.6,
    },
  },
};

export default function Results() {
  return (
    <main className="w-full px-6 sm:px-8 lg:px-12 pb-16">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 items-stretch gap-6 lg:gap-8"
          variants={cardsContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {MOCK_DATA.map((opportunity) => (
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
                  {opportunity.description}
                </p>

                <p className="mt-auto pt-4 text-text-mute">
                  {opportunity.hours} hours · Counts for Graduation
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}

export { MOCK_DATA };
