"use client";

import { motion } from "motion/react";
import { container, fadeInUp } from "@/lib/variants";

const BENEFITS = [
  "Official opportunities only",
  "Track real hours, not guesswork",
  "Instant documentation for schools",
];

const STATS = [
  { label: "Verified orgs", value: "250+" },
  { label: "Opportunities listed", value: "1,200+" },
  { label: "School-ready docs", value: "Instant" },
  { label: "Districts tracked", value: "50+" },
];

export default function About() {
  return (
    <section id="about" className="scroll-mt-24 py-24 md:py-32 lg:mt-32">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Left: Copy */}
          <motion.div className="lg:col-span-7" variants={container}>
            <motion.h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-text mb-6 sm:mb-8"
              variants={fadeInUp}
            >
              Why Vocatio?
            </motion.h2>

            <motion.p
              className="text-lg sm:text-xl/10 text-text-mute"
              variants={fadeInUp}
            >
              Vocatio helps students and parents find
              <span className="font-semibold text-secondary">
                {" "}
                official, verified{" "}
              </span>
              community service opportunities that
              <span className="italic font-medium"> count</span> for graduation,
              scholarships, and college applications.
            </motion.p>
            <motion.p
              className="mt-4 text-base sm:text-lg text-text-mute"
              variants={fadeInUp}
            >
              No more spreadsheet chaos, confusing paperwork, or missed
              deadlines. Everything you need—organized, searchable, and ready to
              share.
            </motion.p>

            {/* Benefit Chips */}
            <motion.div
              className="flex flex-wrap justify-start gap-3 sm:gap-4 mt-6 sm:mt-8"
              variants={container}
            >
              {BENEFITS.map((text) => (
                <motion.span
                  key={text}
                  className="inline-flex items-center text-base md:text-lg text-text bg-bg rounded-full px-5 py-2.5 shadow-custom ring-1 ring-border hover:bg-primary/70 transition-colors"
                  variants={fadeInUp}
                >
                  <span className="mr-2 text-green-500 pointer-events-none">
                    ✔
                  </span>
                  <p className="pointer-events-none">{text}</p>
                </motion.span>
              ))}
            </motion.div>

            {/* By the numbers */}
            <motion.div
              className="mt-8 sm:mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4"
              variants={container}
            >
              {STATS.map((s) => (
                <motion.div
                  key={s.label}
                  className="text-left"
                  variants={fadeInUp}
                >
                  <div className="text-2xl sm:text-3xl font-extrabold text-text">
                    {s.value}
                  </div>
                  <div className="text-sm sm:text-base text-text-mute">
                    {s.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Visual panel */}
          <motion.div className="lg:col-span-5" variants={fadeInUp}>
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-3xl border border-border bg-gradient shadow-custom overflow-hidden">
              {/* Decorative glows */}
              <div className="absolute -top-10 -left-10 h-40 w-40 bg-primary/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-secondary/20 rounded-full blur-2xl" />

              {/* Content placeholder */}
              <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <span className="inline-flex items-center rounded-full bg-bg/70 backdrop-blur px-3 py-1 text-xs font-medium text-text ring-1 ring-border shadow-custom">
                    Preview
                  </span>
                </div>
                <div className="self-start">
                  <h3 className="text-xl sm:text-2xl font-semibold text-text">
                    Smart tracking & documentation
                  </h3>
                  <p className="mt-2 text-sm sm:text-base text-text-mute max-w-sm">
                    Log hours, stay on top of milestones, and export
                    school-ready reports in seconds.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
