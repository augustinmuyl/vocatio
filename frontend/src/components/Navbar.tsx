"use client"

import { useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Menu, X, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { menuVariants } from "@/lib/variants";
import { useTheme } from "next-themes";

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { resolvedTheme, setTheme } = useTheme()

    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen(prev => !prev);
    };

    return (
        <header className="fixed top-0 z-50 w-full bg-light border-b-border shadow-custom">
            <div className="container mx-auto flex items-center justify-between py-4 px-6">
                <Link href="/" className="text-2xl font-bold text-secondary">
                    Vocatio
                </Link>

                {/* Desktop */}
                <nav className="hidden md:flex space-x-6 text-text-mute">
                    <Link href="#about" className="hover:text-text">About</Link>
                    <Link href="#how-it-works" className="hover:text-text">How It Works</Link>
                </nav>

                <div className="flex items-center gap-2">
                    <Button
                        variant='outline'
                        size="icon"
                        onClick={() => resolvedTheme === "dark" ? setTheme("light") : setTheme("dark")}
                        className="relative"
                    >
                        <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                    </Button>

                    <Button asChild size="default" className="hidden md:inline-flex">
                        <Link href="#waitlist">Join Waitlist</Link>
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
                            { href: '#about', label: 'About' },
                            { href: '#how-it-works', label: 'How It Works' },
                            { href: '#waitlist', label: 'Join Waitlist' },
                        ].map((link, idx) => (
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
        </header>
    );
}

