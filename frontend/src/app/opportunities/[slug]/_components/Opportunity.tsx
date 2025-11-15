"use client"
import Link from "next/link";

import Logo from "../../../../../public/logo.png";
import Volunteering_Mock from "../../../../../public/volunteering.webp";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  OPPORTUNITY_LOCATION_LABELS,
  OPPORTUNITY_THEME_LABELS,
  type OpportunityDetail,
  type OpportunityLocation,
  type OpportunityTheme,
} from "@/app/opportunities/_types";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

const DAY_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};

const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "2-digit",
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

function formatDate(value: string, timezone: string): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    ...DAY_FORMAT,
    timeZone: timezone,
  });
  return formatter.format(new Date(value));
}

function formatDateRange(start: string, end: string, timezone: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (Number.isNaN(startDate.valueOf()) || Number.isNaN(endDate.valueOf())) {
    return formatDate(start, timezone);
  }

  const partsFormatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone: timezone,
  });

  const startParts = Object.fromEntries(
    partsFormatter
      .formatToParts(startDate)
      .filter(
        (part) =>
          part.type === "year" || part.type === "month" || part.type === "day",
      )
      .map((part) => [part.type, part.value]),
  );
  const endParts = Object.fromEntries(
    partsFormatter
      .formatToParts(endDate)
      .filter(
        (part) =>
          part.type === "year" || part.type === "month" || part.type === "day",
      )
      .map((part) => [part.type, part.value]),
  );

  const sameDay =
    startParts.year === endParts.year &&
    startParts.month === endParts.month &&
    startParts.day === endParts.day;

  if (sameDay) {
    return formatDate(start, timezone);
  }

  return `${formatDate(start, timezone)} - ${formatDate(end, timezone)}`;
}

function formatTime(value: string, timezone: string): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    ...TIME_FORMAT,
    timeZone: timezone,
  });
  return formatter.format(new Date(value));
}

function formatTimeRange(start: string, end: string, timezone: string): string {
  return `${formatTime(start, timezone)} - ${formatTime(end, timezone)}`;
}

function formatTotalHours(opportunity: OpportunityDetail): string {
  if (opportunity.communityHours != null) {
    return `${opportunity.communityHours} hour${opportunity.communityHours === 1 ? "" : "s"}`;
  }

  const start = new Date(opportunity.startAt);
  const end = new Date(opportunity.endAt);
  const diffInHours = (end.getTime() - start.getTime()) / 3_600_000;

  if (Number.isFinite(diffInHours) && diffInHours > 0) {
    const rounded = Math.round(diffInHours * 10) / 10;
    return `${rounded} hour${rounded === 1 ? "" : "s"}`;
  }

  return "Not specified";
}

const THEME_BADGE_CLASSES: Partial<Record<OpportunityTheme, string>> = {
  COMMUNITY_SERVICE: "bg-green-100 text-green-800",
  ENVIRONMENT: "bg-emerald-100 text-emerald-800",
  EDUCATION: "bg-indigo-100 text-indigo-800",
  HEALTH: "bg-rose-100 text-rose-800",
  ARTS: "bg-fuchsia-100 text-fuchsia-800",
  STEM: "bg-blue-100 text-blue-800",
  SPORTS: "bg-orange-100 text-orange-800",
  ADVOCACY: "bg-yellow-100 text-yellow-800",
};

function formatDescription(description: string): string[] {
  return description
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function containsHtmlContent(value: string): boolean {
  return /<\/?[a-z][^>]*>/i.test(value);
}

function sanitizeHtmlContent(content: string): string {
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    return content;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(content, "text/html");
  doc.querySelectorAll("script, style, iframe, object, embed").forEach((node) => {
    node.remove();
  });

  return doc.body?.innerHTML ?? "";
}

function OpportunityDetails({
  opportunity,
}: {
  opportunity: OpportunityDetail;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-text mb-2">Details</h2>
      <ul className="space-y-2 text-text-mute">
        <li>
          <strong>Date:</strong>{" "}
          {formatDateRange(
            opportunity.startAt,
            opportunity.endAt,
            opportunity.timezone,
          )}
        </li>
        <li>
          <strong>Time:</strong>{" "}
          {formatTimeRange(
            opportunity.startAt,
            opportunity.endAt,
            opportunity.timezone,
          )}
        </li>
        <li>
          <strong>Total Hours:</strong> {formatTotalHours(opportunity)}
        </li>
        <li>
          <strong>Address:</strong>{" "}
          {opportunity.address
            ? `${opportunity.address}${opportunity.zipCode ? `, ${opportunity.zipCode}` : ""}`
            : opportunity.location === "REMOTE"
              ? "Remote opportunity"
              : "Not provided"}
        </li>
      </ul>
    </section>
  );
}

function OpportunityDescription({ description }: { description: string }) {
  const isHtml = containsHtmlContent(description);
  const htmlDescription = isHtml ? sanitizeHtmlContent(description) : "";
  const paragraphs = isHtml ? [] : formatDescription(description);

  return (
    <section className="flex flex-col">
      <h2 className="text-xl font-semibold text-text mb-2">Description</h2>
      <div className="space-y-4 text-base leading-relaxed text-text-mute">
        {isHtml ? (
          htmlDescription ? (
            <div dangerouslySetInnerHTML={{ __html: htmlDescription }} />
          ) : (
            <p>Details coming soon.</p>
          )
        ) : paragraphs.length > 0 ? (
          paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
        ) : (
          <p>Details coming soon.</p>
        )}
      </div>
    </section>
  );
}

function getTitleInitial(title: string): string {
  const trimmed = title.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "O";
}

function OpportunityOrganizer({
  opportunity,
}: {
  opportunity: OpportunityDetail;
}) {
  const initial = getTitleInitial(opportunity.title);
  console.log(initial);

  return (
    <section className="pt-6 border-t border-border">
      <h2 className="text-xl font-semibold text-text mb-3">Organizer</h2>
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-text-mute font-semibold overflow-hidden">
          <Image src={Logo} alt="icon" />
        </div>
        <div className="space-y-1 text-sm text-text-mute">
          <p className="text-base font-medium text-text">Vocatio</p>
          <p>Contact: Mihir Ganesan</p>
          <p className="text-text-mute">📧 hi@vocatio.app</p>
        </div>
      </div>
    </section>
  );
}

export default function Opportunity({
  opportunity,
}: {
  opportunity: OpportunityDetail;
}) {
  const locationLabel = formatEnumLabel(opportunity.location);

  return (
    <main className="px-6 sm:px-8 lg:px-12 pt-28 pb-8 min-h-screen">
      <div className="mx-auto flex max-w-5xl justify-center">
        <article className="w-full max-w-4xl rounded-2xl p-6 sm:p-8 space-y-6 border border-border bg-muted/40 shadow-custom">
          <Link
            href="/opportunities"
            className="flex items-center gap-1 translate-y-4 text-text-mute transition-colors duration-300 hover:text-text"
          >
            <ArrowLeft size={18} /> All Opportunities
          </Link>
          <header className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold text-text">
                {opportunity.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-text-mute">📍 {locationLabel}</span>
                {opportunity.themes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {opportunity.themes.map((theme) => (
                      <Badge
                        key={theme}
                        variant="secondary"
                        className={`rounded-full px-[10px] py-[3px] text-xs ${THEME_BADGE_CLASSES[theme] ??
                          "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {formatEnumLabel(theme)}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              {opportunity.signupUrl ? (
                <Button asChild>
                  <Link
                    href={opportunity.signupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    prefetch={false}
                  >
                    Sign Up
                  </Link>
                </Button>
              ) : null}
              <Button type="button" variant="outline"
                onClick={
                  () =>
                    toast.success("Opportunity saved!", {
                      description: "Check your dashboard for more information",
                    })
                }
              >
                Save
              </Button>
            </div>
            <Image
              src={Volunteering_Mock}
              className="rounded-md shadow-card w-full"
              alt=""
            />
          </header>

          <OpportunityDescription description={opportunity.description} />
          <OpportunityDetails opportunity={opportunity} />
          <OpportunityOrganizer opportunity={opportunity} />
        </article>
      </div>
    </main >
  );
}
