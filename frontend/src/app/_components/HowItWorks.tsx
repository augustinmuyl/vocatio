"use client";

import React from "react";
import {
  Search,
  ClipboardList,
  Award,
  FileText,
  Users,
  Handshake,
} from "lucide-react";
import { container, fadeInSide, fadeInUp } from "@/lib/variants";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const primarySteps = [
  {
    number: 1,
    title: "Find approved hours",
    icon: Search,
    description: (
      <>
        Search real,{" "}
        <span className="text-secondary font-semibold">approved</span> community
        service opportunities near you.
      </>
    ),
  },
  {
    number: 2,
    title: "Track progress",
    icon: Award,
    description: (
      <>Log hours and automatically see progress toward key milestones.</>
    ),
  },
  {
    number: 3,
    title: "Export documentation",
    icon: FileText,
    description: <>Download school-ready reports and forms in seconds.</>,
  },
];

const supportive = [
  {
    icon: ClipboardList,
    description: (
      <>
        See exactly how many{" "}
        <span className="text-secondary font-semibold">official</span> hours are
        offered per activity.
      </>
    ),
  },
  {
    icon: Users,
    description: (
      <>
        Parents: find{" "}
        <span className="text-secondary font-semibold">approved</span>{" "}
        opportunities and track family hours.
      </>
    ),
  },
  {
    icon: Handshake,
    description: (
      <>
        Organizations: list your{" "}
        <span className="text-secondary font-semibold">approved</span> hours and
        reach local students.
      </>
    ),
  },
];

const HowItWorks = () => {
  const MotionCard = motion(Card);
  return (
    <section id="how-it-works" className="scroll-mt-24 py-24 md:py-32">
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.h2
          className="text-3xl sm:text-4xl md:text-5xl text-center font-bold"
          variants={fadeInUp}
        >
          How Vocatio Works
        </motion.h2>
        <motion.p
          className="mt-4 sm:mt-6 max-w-3xl mx-auto text-center text-base sm:text-lg text-text-mute"
          variants={fadeInUp}
        >
          Simple steps from search to documentation — built for students,
          parents, and organizations to stay aligned without the busywork.
        </motion.p>

        {/* CTA (compact, above cards) */}
        <motion.div
          className="mt-6 sm:mt-8 flex items-center justify-center"
          variants={fadeInUp}
        >
          <Button asChild variant="outline" size="lg">
            <a href="#waitlist">Join the Waitlist</a>
          </Button>
        </motion.div>

        {/* Primary numbered steps */}
        <motion.div
          className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          variants={container}
        >
          {primarySteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <MotionCard
                key={idx}
                variants={fadeInSide}
                className="flex-col h-full p-7 sm:p-8"
              >
                <div className="flex items-center justify-between w-full mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold">
                      {step.number}
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-text">
                      {step.title}
                    </h3>
                  </div>
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                </div>
                <p className="text-base text-text-mute leading-relaxed">
                  {step.description}
                </p>
              </MotionCard>
            );
          })}
        </motion.div>

        {/* Supportive features */}
        <motion.div
          className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          variants={container}
        >
          {supportive.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <MotionCard
                key={idx}
                variants={fadeInSide}
                className="min-h-[120px] p-6"
              >
                <Icon className="w-6 h-6 text-primary flex-shrink-0 mr-3 mt-1" />
                <p className="text-base text-text-mute leading-relaxed">
                  {feature.description}
                </p>
              </MotionCard>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HowItWorks;
