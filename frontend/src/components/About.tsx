"use client"

import { motion } from "motion/react";
import { container, fadeInUp } from "../lib/variants";

const BENEFITS = [
    "Official opportunities only",
    "Track real hours, not guesswork",
    "Instant documentation for schools",
];

export default function About() {
    return (
        <section id="about" className="scroll-mt-24 py-20 md:py-28 bg-light">
            <div className="container mx-auto px-4 sm:px-6 flex justify-center">
                <motion.div
                    className="max-w-4xl w-full flex flex-col items-center text-center"
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.3 }}
                >

                    {/* Title */}
                    <motion.h2
                        className="text-3xl sm:text-4xl md:text-5xl font-bold text-text mb-8"
                        variants={fadeInUp}
                    >
                        Why Vocatio?
                    </motion.h2>

                    {/* Description */}
                    <motion.p
                        className="text-lg sm:text-xl text-text-mute mb-8"
                        variants={fadeInUp}
                    >
                        Vocatio is the only platform dedicated to helping
                        high school students—and their parents—find
                        <span className="font-semibold text-secondary">
                            {" official, verified "}
                        </span>
                        community service opportunities that{" "}
                        <span className="italic font-medium">count</span> for graduation,
                        state scholarships, and college applications.
                        <br className="hidden sm:block" />
                        <span className="block mt-4">
                            <span className="font-semibold text-primary">
                                No more spreadsheet chaos, confusing paperwork,
                            </span>{" "}
                            or missed deadlines. Everything you need—organized and in one
                            place.
                        </span>
                    </motion.p>

                    {/* Benefit Chips */}
                    <motion.div
                        className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-4"
                        variants={container}
                    >
                        {BENEFITS.map((text) => (
                            <motion.span
                                key={text}
                                className="inline-flex items-center text-base text-text bg-bg rounded-full px-4 py-2 shadow-custom hover:bg-primary/70 transition-colors"
                                variants={fadeInUp}
                            >
                                <span className="mr-2 text-green-500">✔</span>
                                {text}
                            </motion.span>
                        ))}
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
