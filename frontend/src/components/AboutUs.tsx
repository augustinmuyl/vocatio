"use client";

import React from "react";
import Image, { StaticImageData } from "next/image";
import { motion } from "motion/react";
import { container, fadeInUp, fadeInSide } from "../lib/variants";
import MihirImage from "../../public/mihir-image.jpg";
import AugustinImage from "../../public/augustin-image.jpeg";
import { Card } from "./ui/card";
import { Linkedin, Github, Globe } from "lucide-react";

type LinkType = "linkedin" | "portfolio" | "github";

type Member = {
  name: string;
  title: string;
  image: StaticImageData;
  bio: string;
  links: { type: LinkType; href: string }[];
};

const TEAM: Member[] = [
  {
    name: "Augustin Muyl",
    title: "Co-Founder, Technical Lead",
    image: AugustinImage,
    bio:
      "Augustin grew up across cultures and brings a pragmatic, full‑stack mindset to building Vocatio. He ships fast, reliable features and keeps the platform simple so students and orgs can connect without friction.",
    links: [
      { type: "linkedin", href: "https://www.linkedin.com/in/augustinmuyl/" },
      { type: "github", href: "https://github.com/augustinmuyl/" },
      { type: "portfolio", href: "https://www.augustinmuyl.com/" },
    ],
  },
  {
    name: "Mihir Ganesan",
    title: "Co-Founder, Product Lead",
    image: MihirImage,
    bio:
      "Mihir thought of this idea after seeing how hard it is to find verified service that actually counts. He focuses on simple, credible pathways from interest to impact by working closely with students, parents, and schools.",
    links: [{ type: "linkedin", href: "https://www.linkedin.com/in/mihir-ganesan/" }],
  },

];

// Slight delay specifically for cards entrance
const cardsContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
    },
  },
};

export default function AboutUs() {
  return (
    <main className="min-h-screen w-full flex flex-col">
      {/* Hero */}
      <section className="px-6 sm:px-8 lg:px-12 py-16 sm:py-20">
        <motion.div
          className="pt-16 mx-auto max-w-6xl text-center"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-text mb-8 leading-tight tracking-tight"
            variants={fadeInUp}
          >
            Meet the <span className="text-primary">Vocatio</span> Team
          </motion.h1>
          <motion.p
            className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-text-mute"
            variants={fadeInUp}
          >
            We’re two founders passionate about connecting people to purpose. Together, we’re building Vocatio as the
            <span className="text-secondary"> go-to hub</span> for volunteering.
          </motion.p>
        </motion.div>
      </section>

      {/* Team Section */}
      <section className="px-6 sm:px-8 lg:px-12 pb-16">
        <div className="mx-auto max-w-[964px]">
          <motion.div
            className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-8 items-stretch sm:justify-items-center"
            variants={cardsContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {TEAM.map((member, idx) => (
              <motion.div
                key={member.name}
                variants={fadeInSide}
                className={`w-full flex justify-center ${idx === 0 ? "sm:order-2" : "sm:order-1"}`}
              >
                <Card className="w-full max-w-md h-full p-8 flex flex-col items-center text-text">
                  <Image
                    src={member.image}
                    alt={member.name}
                    className="h-32 w-32 rounded-full object-cover object-top border border-border"
                  />
                  <h3 className="mt-4 text-xl font-semibold text-text">{member.name}</h3>
                  <p className="text-sm text-text-mute">{member.title}</p>
                  <p className="mt-3 text-center text-text-mute leading-relaxed">{member.bio}</p>
                  {member.links?.length ? (
                    <div className="mt-auto pt-4 flex items-center gap-4">
                      {member.links.map((l) => {
                        const Icon = l.type === "linkedin" ? Linkedin : l.type === "github" ? Github : Globe;
                        const label =
                          l.type === "linkedin"
                            ? "LinkedIn"
                            : l.type === "github"
                              ? "GitHub"
                              : "Portfolio";
                        return (
                          <a
                            key={l.href}
                            href={l.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${member.name} ${label}`}
                            className="text-text hover:text-primary transition-colors"
                          >
                            <Icon className="h-5 w-5" />
                          </a>
                        );
                      })}
                    </div>
                  ) : null}
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
