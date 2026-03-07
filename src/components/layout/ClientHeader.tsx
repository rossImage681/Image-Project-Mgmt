import Link from "next/link";

/**
 * Client-facing header - subtle IMC branding
 */
export function ClientHeader() {
    return (
        <header className="bg-white border-b border-border-light px-6 py-3">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                {/* Small IMC Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full gradient-fuchsia flex items-center justify-center">
                        <span className="text-white font-heading text-sm font-bold">IMC</span>
                    </div>
                    <span className="text-sm text-text-secondary">Project Schedule</span>
                </div>

                {/* Minimal nav */}
                <div className="text-sm text-text-secondary">
                    Powered by Image Marketing
                </div>
            </div>
        </header>
    );
}
