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
        <section id="about" className="pb-20 pt-20">
            <div className="container mx-auto px-6 flex justify-center">
                <motion.div
                    className="p-10 max-w-4xl w-full flex flex-col items-center"
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.3 }}
                >

                    {/* Title */}
                    <motion.h2
                        className="text-3xl md:text-4xl font-bold text-text mb-6 text-center"
                        variants={fadeInUp}
                    >
                        Why Voluntier?
                    </motion.h2>

                    {/* Description */}
                    <motion.p
                        className="text-lg md:text-xl text-text-mute text-left mb-6"
                        variants={fadeInUp}
                    >
                        Voluntier is the only platform dedicated to helping
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
                        className="flex flex-wrap justify-center gap-4 mt-2"
                        variants={container}
                    >
                        {BENEFITS.map((text) => (
                            <motion.span
                                key={text}
                                className="inline-flex items-center text-base text-text bg-light rounded-full px-4 py-2 shadow-sm hover:bg-primary/70 transition"
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
