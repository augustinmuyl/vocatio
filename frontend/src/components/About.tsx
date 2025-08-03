"use client"

import { motion, useReducedMotion } from "motion/react";
import { container, fadeInUp } from "../lib/variants";

const BENEFITS = [
    "Official opportunities only",
    "Track real hours, not guesswork",
    "Instant documentation for schools",
];

export default function About() {
    const shouldReduce = useReducedMotion();

    return (
        <section id="about" className="py-20">
            <div className="container mx-auto px-6 flex justify-center">
                <motion.div
                    className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm p-10 max-w-2xl w-full flex flex-col items-center"
                    variants={container}
                    initial={shouldReduce ? undefined : "hidden"}
                    whileInView={shouldReduce ? undefined : "show"}
                    viewport={{ once: true, amount: 0.3 }}
                >

                    {/* Title */}
                    <motion.h2
                        className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center"
                        variants={fadeInUp}
                    >
                        Why Voluntier?
                    </motion.h2>

                    {/* Description */}
                    <motion.p
                        className="text-lg md:text-xl text-gray-700 text-center mb-6"
                        variants={fadeInUp}
                    >
                        Voluntier is the only platform dedicated to helping
                        high school students—and their parents—find
                        <span className="font-semibold text-indigo-600">
                            {" official, verified "}
                        </span>
                        community service opportunities that{" "}
                        <span className="italic font-medium">count</span> for graduation,
                        state scholarships, and college applications.
                        <br className="hidden sm:block" />
                        <span className="block mt-4">
                            <span className="font-semibold text-blue-500">
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
                                className="inline-flex items-center text-base text-gray-700 bg-white rounded-full px-4 py-2 shadow-sm hover:bg-blue-100 transition"
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
