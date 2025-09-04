"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Moon, Sun, CircleCheckBig } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { menuVariants } from "@/lib/variants";
import { useTheme } from "next-themes";

const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", isRoute: true },
    { href: "/about", label: "About Us", isRoute: true },           // ← route, not hash
    { href: "/#how-it-works", label: "How It Works", isRoute: false },
  ];

  return (
    <header className="fixed top-0 z-50 w-full py-3 lg:py-[9px]">
      <div className="container mx-auto flex items-center justify-between px-5 md:px-8 w-full max-w-7xl relative">
        <Link href="/" className="flex items-center gap-3 z-20">
          <CircleCheckBig className="text-primary" />
          <h1 className="text-2xl font-bold text-text">Vocatio</h1>
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex space-x-6 text-text-mute z-20">
          {navItems.map((item) => {
            const active = item.isRoute && pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`hover:text-text ${active ? "text-text font-semibold" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => (resolvedTheme === "dark" ? setTheme("light") : setTheme("dark"))}
            className="relative z-20"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          </Button>

          <Button asChild size="default" className="hidden md:inline-flex z-20">
            <Link href="/#waitlist">Join Waitlist</Link>
          </Button>

          {/* Mobile Hamburger */}
          <button
            type="button"
            className={`md:hidden focus:outline-none z-50 ${isMenuOpen ? "text-white/90" : "text-text"}`}
            aria-label="Toggle menu"
            onClick={(e) => { e.stopPropagation(); setIsMenuOpen((p) => !p); }}
          >
            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden fixed inset-0 bg-[rgba(0,0,0,0.85)] flex flex-col justify-center items-center z-40"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {navItems
              .concat([{ href: "/#waitlist", label: "Join Waitlist", isRoute: false }])
              .map((link, idx) => (
                <motion.div key={idx} variants={itemVariants} className="mb-6 last:mb-0">
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

      <div className="pointer-events-none absolute top-0 z-10 h-20 w-full bg-[linear-gradient(180deg,bg-light/40_0%,bg-light_100%)] mask-[linear-gradient(to_bottom,black_65%,rgba(0,0,0,0.88)_75%,transparent_100%)] backdrop-blur-2xl" />
    </header>
  );
}
