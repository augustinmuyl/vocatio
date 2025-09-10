"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BadgeCheck as BadgeCheckIcon } from "lucide-react";

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

export default function Results() {
  return (
    <main className="min-h-screen w-full px-6 sm:px-8 lg:px-12 pt-28 pb-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {MOCK_DATA.map((opportunity) => (
            <Card key={opportunity.id} className="relative flex flex-col p-6 text-text">
              {opportunity.approved ? (
                <Badge
                  className="absolute top-4 right-4 rounded-lg border-transparent bg-success/45 text-text"
                  aria-label="Approved opportunity"
                >
                  <BadgeCheckIcon />
                  Approved
                </Badge>
              ) : null}

              <div>
                <h3 className="text-xl font-semibold leading-snug">{opportunity.title}</h3>
                <p className="mt-2 text-text-mute">
                  {opportunity.description}
                </p>
              </div>

              <p className="mt-6 text-text-mute">
                {opportunity.hours} hours · Counts for Graduation
              </p>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}

export { MOCK_DATA };
