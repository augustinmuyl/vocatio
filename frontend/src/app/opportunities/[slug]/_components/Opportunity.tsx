import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  OPPORTUNITY_LOCATION_LABELS,
  OPPORTUNITY_THEME_LABELS,
  type OpportunityDetail,
  type OpportunityLocation,
  type OpportunityTheme,
} from "@/app/opportunities/_types";

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  dateStyle: "medium",
  timeStyle: "short",
};

const DAY_FORMAT: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
};

function formatEnumLabel(value: string): string {
  if (value in OPPORTUNITY_LOCATION_LABELS) {
    return OPPORTUNITY_LOCATION_LABELS[value as OpportunityLocation];
  }
  if (value in OPPORTUNITY_THEME_LABELS) {
    return OPPORTUNITY_THEME_LABELS[value as OpportunityTheme];
  }

  return value
    .toLowerCase()
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function formatDateTime(value: string, timezone: string): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    ...DATE_FORMAT,
    timeZone: timezone,
  });
  return formatter.format(new Date(value));
}

function formatDate(value: string, timezone: string): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    ...DAY_FORMAT,
    timeZone: timezone,
  });
  return formatter.format(new Date(value));
}

function formatDescription(description: string): string[] {
  return description
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function OpportunityDetails({
  opportunity,
}: {
  opportunity: OpportunityDetail;
}) {
  const sameDay =
    formatDate(opportunity.startAt, opportunity.timezone) ===
    formatDate(opportunity.endAt, opportunity.timezone);

  return (
    <Card className="p-6 text-text">
      <dl className="grid gap-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-text-mute">
            Starts
          </dt>
          <dd className="text-base font-medium">
            {formatDateTime(opportunity.startAt, opportunity.timezone)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-text-mute">
            Ends
          </dt>
          <dd className="text-base font-medium">
            {formatDateTime(opportunity.endAt, opportunity.timezone)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-text-mute">
            Timezone
          </dt>
          <dd className="text-base font-medium">{opportunity.timezone}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-text-mute">
            Community Hours
          </dt>
          <dd className="text-base font-medium">
            {opportunity.communityHours != null
              ? `${opportunity.communityHours} hours`
              : "Not specified"}
          </dd>
        </div>
        {opportunity.address ? (
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-text-mute">
              Address
            </dt>
            <dd className="text-base font-medium">
              {opportunity.address}
              {opportunity.zipCode ? `, ${opportunity.zipCode}` : ""}
            </dd>
          </div>
        ) : null}
        {sameDay ? null : (
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-text-mute">
              Duration
            </dt>
            <dd className="text-base font-medium">
              {formatDate(opportunity.startAt, opportunity.timezone)} –{" "}
              {formatDate(opportunity.endAt, opportunity.timezone)}
            </dd>
          </div>
        )}
      </dl>
    </Card>
  );
}

function OpportunityDescription({ description }: { description: string }) {
  const paragraphs = formatDescription(description);

  return (
    <Card className="p-6 text-text">
      <h2 className="text-lg font-semibold">About this opportunity</h2>
      <div className="mt-4 space-y-4 text-base leading-relaxed text-text-mute">
        {paragraphs.length > 0 ? (
          paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
        ) : (
          <p>Details coming soon.</p>
        )}
      </div>
    </Card>
  );
}

export default function Opportunity({
  opportunity,
}: {
  opportunity: OpportunityDetail;
}) {
  return (
    <main className="flex-1 bg-background pt-24 pb-16">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 sm:px-8 lg:px-0">
        <div className="space-y-6">
          <Link
            href="/opportunities"
            className="text-sm font-medium text-text-mute hover:text-text"
          >
            ← Back to opportunities
          </Link>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                {formatEnumLabel(opportunity.location)}
              </Badge>
              {opportunity.themes.map((theme) => (
                <Badge key={theme} variant="outline">
                  {formatEnumLabel(theme)}
                </Badge>
              ))}
            </div>
            <h1 className="text-3xl font-semibold leading-tight text-text sm:text-4xl">
              {opportunity.title}
            </h1>
            <p className="text-sm text-text-mute">
              Updated{" "}
              {formatDateTime(opportunity.updatedAt, opportunity.timezone)}
            </p>
          </div>
          {opportunity.signupUrl ? (
            <Button asChild size="sm">
              <Link
                href={opportunity.signupUrl}
                target="_blank"
                rel="noopener noreferrer"
                prefetch={false}
              >
                Sign up
              </Link>
            </Button>
          ) : null}
        </div>
        <OpportunityDetails opportunity={opportunity} />
        <OpportunityDescription description={opportunity.description} />
      </div>
    </main>
  );
}
