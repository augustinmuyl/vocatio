export default function About() {
    return (
        <section
            id="about"
            className="py-20"
        >
            <div className="container mx-auto px-6 flex flex-col items-center">
                <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                    Why Voluntier?
                </h3>
                <p className="text-lg text-gray-700 max-w-2xl text-center mb-6">
                    Voluntier is the only platform focused on helping high school students—and their parents—find <span className="font-semibold text-indigo-600">verified</span> community service opportunities that count toward graduation, state scholarships, and college applications.
                    <br className="hidden sm:block" />
                    <span className="block mt-4">
                        <span className="font-semibold text-blue-500">No more spreadsheet chaos, confusing paperwork,</span> or missing out on your diploma or Bright Futures. Everything you need, in one place.
                    </span>
                </p>
                {/* Optional: add a checkmark row */}
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                    <span className="inline-flex items-center text-sm text-gray-600 bg-gray-100 rounded-full px-3 py-1">
                        ✅ Official opportunities only
                    </span>
                    <span className="inline-flex items-center text-sm text-gray-600 bg-gray-100 rounded-full px-3 py-1">
                        ✅ Track real hours, not guesswork
                    </span>
                    <span className="inline-flex items-center text-sm text-gray-600 bg-gray-100 rounded-full px-3 py-1">
                        ✅ Instant school documentation
                    </span>
                </div>
            </div>
        </section>
    )
}
