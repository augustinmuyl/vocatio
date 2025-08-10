import React from 'react';
import { Mail, ShieldX, Facebook, Twitter, Instagram } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-bg border-t border-border">
            <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between">
                {/* Contact Link */}
                <div className="flex items-center space-x-2 mb-4 md:mb-0">
                    <Mail className="w-5 h-5 text-text" />
                    <Link href="/" className="text-text hover:text-primary">
                        contact@voluntier.org
                    </Link>
                </div>
                {/* Privacy Policy */}
                <div className="flex items-center space-x-2 mb-4 md:mb-0">
                    <ShieldX className="w-5 h-5 text-text" />
                    <Link href="/" className="text-text hover:text-primary">
                        Privacy Policy
                    </Link>
                </div>
                {/* Social Icons */}
                <div className="flex items-center space-x-4">
                    <Link href="/" aria-label="Vocatio on Facebook" className="text-text hover:text-primary">
                        <Facebook className="w-5 h-5" />
                    </Link>
                    <Link href="/" aria-label="Vocatio on Twitter" className="text-text hover:text-primary">
                        <Twitter className="w-5 h-5" />
                    </Link>
                    <Link href="/" aria-label="Vocatio on Instagram" className="text-text hover:text-primary">
                        <Instagram className="w-5 h-5" />
                    </Link>
                </div>
            </div>
            <div className="bg-light text-text-mute text-center py-3">
                © 2025 Vocatio. All rights reserved.
            </div>
        </footer>
    );
}

