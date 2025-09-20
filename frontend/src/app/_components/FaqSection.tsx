"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

type FaqItem = {
  question: string;
  answer: React.ReactNode;
  value?: string;
};

const defaultItems: FaqItem[] = [
  {
    question: "What is Vocatio?",
    answer: (
      <p>
        Vocatio is a platform that turns volunteering and service into a
        trackable, gamified journey—with verified hours, role-based skill tags,
        and lightweight portfolios you can share on applications. Think of it as Indeed for volunteering.
        We aim to make Vocatio the go-to-spot for volunteering easily.
      </p>
    ),
  },
  {
    question: "How does verification of hours work?",
    answer: (
      <p>
        Org leads sign off on your submissions in-app. We store the signed
        record and make it downloadable for schools, scholarships, and
        employers.
      </p>
    ),
  },
  {
    question: "Is Vocatio free?",
    answer: (
      <p>
        Yes, almost entirely. Why would a student pay to volunteer!
        For organizations and schools, we charge a small fee in order to handle
        any logistics. This including tracking of active or inactive volunteers, location logistics, and even marketing,
        Vocatio is a non-profit, and any fees we charge are reinvested into a better experience.
      
      </p>
    ),
  },
  {
    question: "Do you integrate with school systems?",
    answer: (
      <p>
        Yes. We support CSV exports today and are adding SIS/LMS integrations
        (Clever, ClassLink, X2Vol) on the roadmap.
      </p>
    ),
  },
  {
    question: "Can I use Vocatio for club or event hours?",
    answer: (
      <p>
        Absolutely—create an event, generate a check-in code or QR, and we
        handle attendance and hour attribution automatically.
      </p>
    ),
  },
];

function toJsonLd(items: FaqItem[]) {
  const pairs = items.map((it) => ({
    "@type": "Question",
    name: it.question,
    acceptedAnswer: {
      "@type": "Answer",
      text:
        (typeof it.answer === "string"
          ? it.answer
          : React.isValidElement(it.answer)
          ? // @ts-expect-error children access on simple <p>
            (it.answer.props?.children ?? "").toString()
          : String(it.answer)) || "",
    },
  }));
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: pairs,
  };
}

export default function FaqSection({
  items = defaultItems,
  defaultValue,
}: {
  items?: FaqItem[];
  defaultValue?: string;
}) {
  const prepared = items.map((it, i) => ({
    ...it,
    value: it.value ?? `item-${i + 1}`,
  }));
  const jsonLd = toJsonLd(prepared);

  return (
    <section
      id="faq"
      className="relative mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="mx-auto mb-8 flex max-w-2xl flex-col items-start gap-2 text-left">
        <span className="rounded-full border px-3 py-1 text-xs font-medium">
          FAQ
        </span>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Frequently asked questions
        </h2>
        <p className="text-muted-foreground">
          Everything you need to know about getting started with Vocatio.
        </p>
      </div>

      <Accordion
        type="single"
        collapsible
        defaultValue={defaultValue ?? prepared[0]?.value}
      >
        {prepared.map((item) => (
          <AccordionItem key={item.value} value={item.value!} className="border-b">
            <AccordionTrigger className="text-left text-base font-medium">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-8 flex items-center gap-3">
        <Button asChild>
          <a href="/signup">Get started</a>
        </Button>
        <Button variant="ghost" asChild>
          <a href="#contact">Still have questions?</a>
        </Button>
      </div>

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
