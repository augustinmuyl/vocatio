import Navbar from "./Navbar";
import { Card } from "./ui/card";

export default function BrowsePage() {
    return (
        <div className="flex flex-col">
            <Navbar />

            <div className="mt-30 w-full max-w-2/3 flex flex-col gap-4 justify-center items-center">
                <div className="flex gap-4">
                    <Card className="rounded-lg">Search opportunities...</Card>
                    <Card>Location ^</Card>
                    <Card>Theme ^</Card>
                </div>
                <div>
                    <Card >hello</Card>
                    <Card >hello</Card>
                    <Card >hello</Card>
                </div>
            </div>
        </div>
    )
}
