import Image from 'next/image'
import { Button } from "./ui/button";

export default function Hero() {
    return (
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
    )
}
