import Navbar from './Navbar'
import Hero from './Hero'

export default function HomePage() {
    return (
        <div className="min-h-screen scroll-smooth">
            {/* Sticky Navbar */}
            <Navbar />

            {/* Hero Section */}
            <Hero />
        </div>
    )
}

