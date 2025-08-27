import Navbar from "./Navbar";
import { Card } from "./ui/card";

export default function BrowsePage() {
    return (
        <div className="flex flex-col">
            <Navbar />

            <div className="mt-30 w-full max-w-2/3 flex gap-4 justify-center">

                <Card >hello</Card>
                <Card >hello</Card>
                <Card >hello</Card>
            </div>
        </div>
    )
}
