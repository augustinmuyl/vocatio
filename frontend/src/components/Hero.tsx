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
            className="relative flex min-h-screen items-center pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-gray-50 via-light to-gray-100
            dark:bg-gradient-to-br dark:from-gray-950 dark:via-light dark:to-gray-900"
            variants={container}
            initial="hidden"
            animate="show"
        >
            <div className="container mx-auto flex flex-col-reverse lg:flex-col items-center px-4 sm:px-6">
                {/* Text Column */}
                <motion.div
                    className="w-full lg:w-2/3 text-center"
                    variants={container}
                >
                    <motion.h2
                        className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text leading-tight"
                        variants={fadeInUp}
                    >
                        The easiest way to find community service hours
                    </motion.h2>
                    <motion.p
                        className="mt-6 text-lg sm:text-xl text-text-mute"
                        variants={fadeInUp}
                    >
                        For students, parents, and organizations
                    </motion.p>
                    <motion.div
                        className="mt-8 flex flex-col sm:flex-row sm:justify-center gap-4"
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
                    className="w-full lg:w-2/3 mb-2 lg:mb-0 flex justify-center relative"
                    variants={fadeInUp}
                >
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                            className="w-full max-w-[21rem] sm:max-w-[24.5rem] md:max-w-[27.5rem] aspect-[1.4] m-4 [@media(min-width:340px)]:m-6 bg-white opacity-100 rounded-lg will-change-transform"
                        />
                    </div>
                    <Image
                        priority
                        src={DashboardMockup}
                        alt="Dashboard mockup with badges and stats"
                        width={850}
                        height={800}
                        className="relative z-10 w-full max-w-sm sm:max-w-md md:max-w-lg"
                    />
                </motion.div>
            </div>
        </motion.section>
    );
}
