import Image from 'next/image'
import { Button } from "./ui/button";
import Link from 'next/link';

export default function Hero() {
    return (
        <section className="relative flex min-h-[80vh] items-center pt-24">
            <div className="container mx-auto flex flex-col-reverse lg:flex-row items-center px-6">
                {/* Text Column */}
                <div className="w-full lg:w-1/2 text-center lg:text-left">
                    <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                        Graduate. Earn Scholarships. Track Community Hours.
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">
                        The easiest way to discover and complete official community service hours for high school students.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-4">
                        <Button asChild size="lg">
                            <Link href="#waitlist">Join the Waitlist</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <Link href="#how-it-works">How It Works</Link>
                        </Button>
                    </div>
                </div>

                {/* Illustration Column */}
                <div className="w-full lg:w-1/2 mb-12 lg:mb-0 flex justify-center relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div
                            className="w-80 h-80 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-50 will-change-transform"
                        ></div>
                    </div>
                    <Image
                        priority
                        src="/illustrations/dashboard-mockup.png"
                        alt="Dashboard mockup with badges and stats"
                        width={500}
                        height={400}
                        className="relative z-10"
                    />
                </div>
            </div>
        </section>
    )
}
