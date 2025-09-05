import AboutUs from "./AboutUs";
import Footer from "./Footer";
import Navbar from "./Navbar";

export default function AboutUsPage() {
    return (
        <div className="flex flex-col">
            <Navbar />
            <AboutUs />
            <Footer />
        </div>
    )
}
