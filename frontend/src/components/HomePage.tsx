import Navbar from './Navbar'
import Hero from './Hero'
import About from './About'
import Footer from './Footer'
import HowItWorks from './HowItWorks'
import Waitlist from './Waitlist'

export default function HomePage() {
    return (
        <div className="min-h-screen flex flex-col gap-20">
            <Navbar />
            <Hero />
            <About />
            <HowItWorks />
            <Waitlist />
            <Footer />
        </div>
    )
}

