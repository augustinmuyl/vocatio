import { Button } from "./ui/button";

export default function Navbar() {
    return (
        <header className="fixed top-0 z-50 w-full bg-white shadow-sm">
            <div className="container mx-auto flex items-center justify-between py-4 px-6">
                <h1 className="text-2xl font-bold text-gray-900">Voluntier</h1>
                <nav className="hidden md:flex space-x-6 text-gray-700">
                    <a href="#features" className="hover:text-gray-900">Features</a>
                    <a href="#pricing" className="hover:text-gray-900">Pricing</a>
                    <a href="#" className="hover:text-gray-900">Sign In</a>
                </nav>
                <Button size="default" className="hidden md:inline-flex">
                    Sign Up
                </Button>
                <button className="md:hidden text-gray-700 focus:outline-none">
                    {/* Mobile menu icon */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-6 w-6"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
        </header>
    )
}
