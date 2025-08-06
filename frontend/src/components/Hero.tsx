"use client"

import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { motion } from "motion/react";
import { container, fadeInUp } from "../lib/variants";
import DashboardMockup from "../../public/dashboard-mockup-translucent.png"

export default function Hero() {
    return (
        <motion.section
            className="relative flex min-h-screen items-center bg-gradient-to-br from-gray-50 via-light to-gray-100
            dark:bg-gradient-to-br dark:from-gray-950 dark:via-light dark:to-gray-900"
            variants={container}
            initial="hidden"
            animate="show"
        >
            <div className="container mx-auto flex flex-col-reverse lg:flex-row items-center px-6">
                {/* Text Column */}
                <motion.div
                    className="w-full lg:w-1/2 text-center lg:text-left"
                    variants={container}
                >
                    <motion.h2
                        className="text-4xl lg:text-5xl font-extrabold text-text leading-tight"
                        variants={fadeInUp}
                    >
                        Graduate. Earn Scholarships. Track Community Hours.
                    </motion.h2>
                    <motion.p
                        className="mt-4 text-lg text-text-mute"
                        variants={fadeInUp}
                    >
                        The easiest way to discover and complete official community
                        service hours for high school students.
                    </motion.p>
                    <motion.div
                        className="mt-8 flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-4"
                        variants={fadeInUp}
                    >
                        <Button asChild size="lg">
                            <Link href="#waitlist">Join the Waitlist</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <Link href="#how-it-works">How It Works</Link>
                        </Button>
                    </motion.div>
                </motion.div>

                {/* Illustration Column */}
                <motion.div
                    className="w-full lg:w-1/2 mb-6 lg:mb-0 flex justify-center relative"
                    variants={fadeInUp}
                >
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                            className="w-104 aspect-square bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-50 will-change-transform"
                            variants={{
                                hidden: { scale: 0.8, opacity: 0 },
                                show: {
                                    scale: 1,
                                    opacity: 0.7,
                                    transition: { duration: 0.8, ease: "easeOut" },
                                },
                            }}
                        />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                            className="w-full max-w-98 aspect-[1.4] m-5 min-[374px]:m-6 bg-white opacity-100 rounded-lg will-change-transform"
                        />
                    </div>
                    <Image
                        priority
                        src={DashboardMockup}
                        alt="Dashboard mockup with badges and stats"
                        width={450}
                        height={400}
                        className="relative z-10"
                    />
                </motion.div>
            </div>
        </motion.section>
    );
}
