"use client";

import React from "react";
import { motion } from "motion/react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { container, fadeInUp } from "@/lib/variants";

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

const MotionAccordionItem = motion(AccordionItem);

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
    <section id="faq" className="scroll-mt-24 py-24 md:py-32">
      <motion.div
        className="container mx-auto px-4 sm:px-6"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.div className="mx-auto flex max-w-4xl flex-col items-center text-center" variants={container}>
          <motion.span
            className="inline-flex items-center rounded-full bg-bg px-3 py-1 text-xs font-medium uppercase tracking-wide text-text ring-1 ring-border"
            variants={fadeInUp}
          >
            FAQ
          </motion.span>
          <motion.h2
            className="mt-4 text-3xl font-bold text-text sm:text-4xl md:text-5xl"
            variants={fadeInUp}
          >
            Frequently asked questions
          </motion.h2>
          <motion.p className="mt-4 max-w-2xl text-base text-text-mute sm:text-lg" variants={fadeInUp}>
            Everything you need to know about getting started with Vocatio.
          </motion.p>
        </motion.div>

        <motion.div
          className="my-8 mb-16 flex flex-col items-center justify-center gap-3 sm:flex-row"
          variants={fadeInUp}
        >
          <Button variant="outline" size="lg" asChild>
            <a href="mailto:hi@vocatio.app">Still have questions?</a>
          </Button>
        </motion.div>

        <motion.div className="mx-auto mt-10 max-w-4xl sm:mt-12" variants={container}>
          <Accordion
            type="single"
            collapsible
            defaultValue={defaultValue ?? prepared[0]?.value}
            className="space-y-4"
          >
            {prepared.map((item) => (
              <MotionAccordionItem
                key={item.value}
                value={item.value!}
                className="overflow-hidden rounded-2xl border border-border bg-muted/40 px-4 shadow-custom hover:bg-background transition-all sm:px-6"
                variants={fadeInUp}
              >
                <AccordionTrigger className="text-left text-base font-semibold text-text sm:text-lg hover:cursor-pointer ">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-text-mute">
                  {item.answer}
                </AccordionContent>
              </MotionAccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/*
        <motion.div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row" variants={fadeInUp}>
          <Button asChild size="lg">
            <a href="/signup">Get started</a>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="#contact">Still have questions?</a>
          </Button>
        </motion.div>
        */}
      </motion.div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
