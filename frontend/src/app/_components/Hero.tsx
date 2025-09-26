"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { container, fadeInUp } from "@/lib/variants";
import BrowsingMockup from "../../../public/browsing_mockup.png";
import BrowsingMockupLight from "../../../public/browsing_mockup_light.png";

export default function Hero() {
  return (
    <motion.section
      className="relative flex min-h-screen lg:pt-48"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="container mx-auto flex flex-col-reverse lg:flex-col items-center justify-center lg:justify-start lg:gap-16 px-4 sm:px-6">
        {/* Text Column */}
        <motion.div
          className="w-full lg:w-2/3 text-center"
          variants={container}
        >
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text leading-tight"
            variants={fadeInUp}
          >
            The easiest way to find community service hours
          </motion.h1>
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
              <Link href="/opportunities">Browse Opportunities</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#waitlist">Get Early Access</Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Illustration Column */}
        <motion.div
          className="w-full mb-6 lg:mb-0 flex justify-center relative overflow-visible"
          variants={fadeInUp}
        >
          <Image
            priority
            src={BrowsingMockup}
            alt="Browsing approved community service opportunities"
            className="hidden dark:block relative z-10 w-full max-w-sm sm:max-w-md md:max-w-xl lg:max-w-4xl xl:max-w-5xl rounded-2xl md:rounded-3xl border-4 shadow-custom pointer-events-none"
          />
          <Image
            priority
            src={BrowsingMockupLight}
            alt="Browsing approved community service opportunities"
            className="dark:hidden relative z-10 w-full max-w-sm sm:max-w-md md:max-w-xl lg:max-w-4xl xl:max-w-5xl rounded-2xl md:rounded-3xl border-4 shadow-custom pointer-events-none"
          />
        </motion.div>
      </div>
      <div
        className="min-h-screen w-full absolute top-0 z-[-10] bg-gradient-to-br from-gray-50 via-light to-gray-100
            dark:bg-gradient-to-br dark:from-gray-950 dark:via-light dark:to-gray-900"
      />
    </motion.section>
  );
}
