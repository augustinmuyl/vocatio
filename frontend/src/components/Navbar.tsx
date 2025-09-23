"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Menu, X, Moon, Sun, CircleCheckBig } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { menuVariants } from "@/lib/variants";
import { useTheme } from "next-themes";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <header className="fixed top-0 z-50 w-full py-3 lg:py-[9px]">
      <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-5 md:px-8 lg:justify-start">
        {/* Desktop */}
        <div className="mr-5 inline-flex shrink-0 rounded lg:mr-7 z-20">
          <Link href="/" className="flex items-center gap-1 shrink-0 pb-[3px]">
            <CircleCheckBig width={20} className="text-text block" />
            <h1 className="text-xl font-semibold text-text leading-none">
              Vocatio
            </h1>
          </Link>
        </div>

        <nav className="relative hidden md:flex text-text-mute z-20">
          <Link
            href="/about-us"
            className="inline-flex items-center font-medium tracking-tight transition-colors duration-300 [&_svg]:shrink-0 relative gap-x-1.5 rounded-md px-3.75 py-4 text-text-mute hover:text-text"
          >
            <span className="relative text-sm leading-none font-medium tracking-tight">
              About Us
            </span>
          </Link>
          <Link
            href="/opportunities"
            className="inline-flex items-center font-medium tracking-tight transition-colors duration-300 [&_svg]:shrink-0 relative gap-x-1.5 rounded-md px-3.75 py-4 text-text-mute hover:text-text"
          >
            <span className="relative text-sm leading-none font-medium tracking-tight">
              Opportunities
            </span>
          </Link>
        </nav>

        <div className="flex grow items-center justify-end gap-x-3.5">
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              resolvedTheme === "dark" ? setTheme("light") : setTheme("dark")
            }
            className="relative z-20"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          </Button>

          <Button asChild size="sm" className="hidden md:inline-flex z-20">
            <Link href="/#waitlist">Join Waitlist</Link>
          </Button>

          {/* Mobile Hamburger */}
          <button
            type="button"
            className={`md:hidden focus:outline-none z-50 ${isMenuOpen ? "text-white/90" : "text-text"}`}
            aria-label="Toggle menu"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden fixed inset-0 bg-[rgba(0,0,0,0.85)] flex flex-col justify-center items-center z-40"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {[
              { href: "/about-us", label: "About Us" },
              { href: "/#waitlist", label: "Join Waitlist" },
            ].map((link, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="mb-6 last:mb-0"
              >
                <Link
                  href={link.href}
                  className="text-white/90 text-2xl hover:opacity-80"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <div
        className="
                pointer-events-none absolute top-0 z-10 h-20
                w-full bg-[linear-gradient(180deg,bg-light/40_0%,bg-light_100%)]
                mask-[linear-gradient(to_bottom,black_65%,rgba(0,0,0,0.88)_75%,transparent_100%)]
                backdrop-blur-2xl"
      ></div>
    </header>
  );
}
