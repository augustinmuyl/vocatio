"use client"

import { useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const menuVariants = {
    hidden: {
        x: '100%',
    },
    visible: {
        x: 0,
        transition: {
            when: 'beforeChildren',
            staggerChildren: 0.1,
            type: "tween"
        },
    },
    exit: {
        x: '100%',
        transition: {
            when: 'afterChildren',
            type: "tween"
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen(prev => !prev);
    };

    return (
        <header className="fixed top-0 z-50 w-full bg-white shadow-sm">
            <div className="container mx-auto flex items-center justify-between py-4 px-6">
                <Link href="/" className="text-2xl font-bold text-gray-900">
                    VolunTier
                </Link>

                {/* Desktop */}
                <nav className="hidden md:flex space-x-6 text-gray-700">
                    <Link href="#about" className="hover:text-gray-900">About</Link>
                    <Link href="#how-it-works" className="hover:text-gray-900">How It Works</Link>
                </nav>
                <Button asChild size="default" className="hidden md:inline-flex">
                    <Link href="#waitlist">Join Waitlist</Link>
                </Button>

                {/* Mobile Hamburger */}
                <button
                    type="button"
                    className={`md:hidden focus:outline-none z-50 ${isMenuOpen ? 'text-white' : 'text-gray-700'}`}
                    aria-label="Toggle menu"
                    onClick={toggleMenu}
                >
                    {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
                </button>
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

