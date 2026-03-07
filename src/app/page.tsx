import Link from "next/link";

export default function Home() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-8 max-w-2xl">
                {/* IMC Logo Placeholder */}
                <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full gradient-fuchsia flex items-center justify-center">
                        <span className="text-white font-heading text-2xl font-bold">IMC</span>
                    </div>
                </div>

                <h1 className="text-fuchsia">
                    Project Scheduler
                </h1>

                <p className="text-text-secondary text-lg">
                    Multi-client project scheduling for Image Marketing Consultants.
                    Create, track, and share project timelines with your clients.
                </p>

                <div className="flex gap-4 justify-center">
                    <Link href="/login" className="btn-primary">
                        Sign In
                    </Link>
                    <Link href="/dashboard" className="btn-secondary">
                        Dashboard
                    </Link>
                </div>

                {/* Quick Stats Preview */}
                <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-border-light">
                    <div className="text-center">
                        <div className="text-3xl font-heading font-bold text-fuchsia">12</div>
                        <div className="text-sm text-text-secondary">Active Projects</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-heading font-bold text-orange">48</div>
                        <div className="text-sm text-text-secondary">Deliverables</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-heading font-bold text-bubblegum">8</div>
                        <div className="text-sm text-text-secondary">Clients</div>
                    </div>
                </div>
            </div>
        </main>
    );
}
