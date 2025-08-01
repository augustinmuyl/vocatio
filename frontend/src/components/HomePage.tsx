'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function HomePage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Sticky Header */}
            <header className="fixed top-0 z-50 w-full bg-white shadow-sm">
                <div className="container mx-auto flex items-center justify-between py-4 px-6">
                    <h1 className="text-2xl font-bold text-gray-900">Voluntier</h1>
                    <nav className="hidden md:flex space-x-6 text-gray-700">
                        <a href="#features" className="hover:text-gray-900">Features</a>
                        <a href="#pricing" className="hover:text-gray-900">Pricing</a>
                        <a href="#" className="hover:text-gray-900">Sign In</a>
                    </nav>
                    <Button size="default" className="hidden md:inline-flex">
                        Sign Up
                    </Button>
                    <button className="md:hidden text-gray-700 focus:outline-none">
                        {/* Mobile menu icon */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="h-6 w-6"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative flex min-h-[80vh] items-center pt-24">
                <div className="container mx-auto flex flex-col-reverse lg:flex-row items-center px-6">
                    {/* Text Column */}
                    <div className="w-full lg:w-1/2 text-center lg:text-left">
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                            Turn Volunteering Into Adventure
                        </h2>
                        <p className="mt-4 text-lg text-gray-600">
                            Connect with local organizations, track your impact, and earn rewards on Voluntier.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-4">
                            <Button size="lg">
                                Get Started
                            </Button>
                            <Button variant="outline" size="lg">
                                See Demo
                            </Button>
                        </div>
                    </div>

                    {/* Illustration Column */}
                    <div className="w-full lg:w-1/2 mb-12 lg:mb-0 flex justify-center relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-80 h-80 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-50 animate-pulse"></div>
                        </div>
                        <Image
                            src="/illustrations/dashboard-mockup.png"
                            alt="Dashboard mockup with badges and stats"
                            width={500}
                            height={400}
                            className="relative z-10"
                        />
                    </div>
                </div>
            </section>
        </div>
    )
}

