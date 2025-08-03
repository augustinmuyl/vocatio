const BENEFITS = [
    "Official opportunities only",
    "Track real hours, not guesswork",
    "Instant documentation for schools",
];

export default function AboutSection() {
    return (
        <section
            id="about"
            className="py-20"
        >
            <div className="container mx-auto px-6 flex justify-center">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm p-10 max-w-2xl w-full flex flex-col items-center">

                    {/* Title */}
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
                        Why Voluntier?
                    </h2>

                    {/* Description */}
                    <p className="text-lg md:text-xl text-gray-700 text-center mb-6">
                        Voluntier is the only platform dedicated to helping
                        high school students—and their parents—find
                        <span className="font-semibold text-indigo-600">
                            {" official, verified "}
                        </span>
                        community service opportunities that{" "}
                        <span className="italic font-medium">count</span> for graduation,
                        state scholarships, and college applications.
                        <br className="hidden sm:block" />
                        <span className="block mt-4">
                            <span className="font-semibold text-blue-500">
                                No more spreadsheet chaos, confusing paperwork,
                            </span>{" "}
                            or missed deadlines. Everything you need—organized and in one
                            place.
                        </span>
                    </p>

                    {/* Benefit Chips */}
                    <div className="flex flex-wrap justify-center gap-4 mt-2">
                        {BENEFITS.map((text) => (
                            <span
                                key={text}
                                className="inline-flex items-center text-base text-gray-700 bg-white rounded-full px-4 py-2 shadow-sm hover:bg-blue-100 transition"
                            >
                                <span className="mr-2 text-green-500">✔</span>
                                {text}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
