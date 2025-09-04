"use client";

import React from "react";
import Image, { StaticImageData } from "next/image";
import { motion } from "motion/react";
import { container, fadeInUp, fadeInSide } from "../lib/variants";
import MihirImage from "../../public/mihir-image.jpg";
import AugustinImage from "../../public/augustin-image.jpeg";
import { Card } from "./ui/card";

type Member = {
  name: string;
  title: string;
  image: StaticImageData;
  bio: string;
  phone?: string;
  links: { label: string; href: string }[];
};

const TEAM: Member[] = [
  {
    name: "Augustin Muyl",
    title: "Co-Founder",
    image: AugustinImage,
    bio:
      "Augustin is focused on design and user experience, ensuring Vocatio is simple, intuitive, and delightful for both volunteers and organizations. He has taken his experience in computer science to completely handle the technical front at Vocatio.",
    phone: "786-616-2355",
    links: [
      { label: "LinkedIn", href: "https://www.linkedin.com/in/augustinmuyl/" },
      { label: "Portfolio", href: "https://www.augustinmuyl.com/" },
    ],
  },
  {
    name: "Mihir Ganesan",
    title: "Co-Founder",
    image: MihirImage,
    bio:
      "Born in Silicon Valley with a passion for technology, Mihir thought of this idea as a means to satisfy high-school mandated volunteering hours. Tired of mundane volunteering opportunities, and the difficulty with finding them, he takes his experience in business and computer science to make volunteering fun and accessible.",
    phone: "408-859-0615",
    links: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/mihir-ganesan/" }],
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
            className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-8 items-stretch justify-items-center [direction:rtl]"
            variants={cardsContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {TEAM.map((member) => (
              <motion.div key={member.name} variants={fadeInSide} className="w-full flex justify-center">
                <Card className="w-full max-w-md h-full p-8 flex flex-col items-center text-text">
                  <Image
                    src={member.image}
                    alt={member.name}
                    className="h-32 w-32 rounded-full object-cover border border-border"
                  />
                  <h3 className="mt-4 text-xl font-semibold text-text">{member.name}</h3>
                  <p className="text-sm text-text-mute">{member.title}</p>
                  <p className="mt-3 text-center text-text-mute">
                    {member.bio}
                    <br />
                    <strong className="text-text">Contact Information</strong>
                    <br />
                    {member.phone}
                    <br />
                    {member.links.map((l, i) => (
                      <span key={l.href}>
                        <a
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline"
                        >
                          {l.label}
                        </a>
                        {i < member.links.length - 1 ? <span className="text-text-mute"> {" | "} </span> : null}
                      </span>
                    ))}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
