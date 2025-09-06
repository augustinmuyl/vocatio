export default function Features() {
    return (
        <section id="about" className="h-[60vh] flex justify-center items-center">
            <div className="container mx-auto px-4 sm:px-6 flex justify-between text-center">
                <div className="w-full max-w-1/4">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text mb-8">Discover Opportunities</h1>
                    <p className="text-lg sm:text-xl text-text-mute mb-8">Find verified community service activities near you</p>
                </div>
                <div className="w-full max-w-1/4">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text mb-8">Track your Progress</h1>
                    <p className="text-lg sm:text-xl text-text-mute mb-8">Monitor hours and your progress towards requirements</p>
                </div>
                <div className="w-full max-w-1/4">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text mb-8">Generate Reports</h1>
                    <p className="text-lg sm:text-xl text-text-mute mb-8">Automatically create documentation for schools</p>
                </div>
            </div>
        </section>
    )
}

