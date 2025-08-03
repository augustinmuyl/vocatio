import Navbar from './Navbar'
import Hero from './Hero'
import About from './About'

export default function HomePage() {
    return (
        <div className="min-h-screen scroll-smooth">
            <Navbar />
            <Hero />
            <About />
        </div>
    )
}

