import Navbar from './Navbar'
import Hero from './Hero'
import About from './About'
import Footer from './Footer'
import HowItWorks from './HowItWorks'

export default function HomePage() {
    return (
        <div className="min-h-screen">
            <Navbar />
            <Hero />
            <About />
            <HowItWorks />
            <Footer />
        </div>
    )
}

