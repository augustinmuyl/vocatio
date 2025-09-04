import React from "react";
import Image, { StaticImageData } from "next/image";
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

export default function AboutUs() {
  return (
    <main className="min-h-screen w-full flex flex-col">
      {/* Hero */}
      <section className="px-6 sm:px-8 lg:px-12 py-16 sm:py-20">
        <div className="pt-16 mx-auto max-w-6xl text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text mb-8 leading-tight tracking-tight">
            Meet the <span className="text-primary">Vocatio</span> Team
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-text-mute">
            We’re two founders passionate about connecting people to purpose. Together, we’re building Vocatio as the
            <span className="text-secondary"> go-to hub</span> for volunteering.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className="px-6 sm:px-8 lg:px-12 pb-16">
        <div className="mx-auto max-w-[964px]">
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-8 items-stretch justify-items-center [direction:rtl]">
            {TEAM.map((member) => (
              <Card
                key={member.name}
                className="w-full max-w-md h-full p-8 flex flex-col items-center text-text"
              >
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
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
