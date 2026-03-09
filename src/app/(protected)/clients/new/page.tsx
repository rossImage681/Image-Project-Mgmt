import { Header } from "@/components/layout";
import { createClient } from "@/app/actions/clients";
import Link from "next/link";

export const dynamic = "force-dynamic";

const COLOR_OPTIONS = [
    { hex: "#E52E7D", label: "Fuchsia" },
    { hex: "#7C3AED", label: "Violet" },
    { hex: "#0EA5E9", label: "Sky" },
    { hex: "#10B981", label: "Emerald" },
    { hex: "#F59E0B", label: "Amber" },
    { hex: "#EF4444", label: "Red" },
    { hex: "#EC4899", label: "Pink" },
    { hex: "#6366F1", label: "Indigo" },
];

export default function NewClientPage({
    searchParams,
}: {
    searchParams: { error?: string };
}) {
    const errorMsg =
        searchParams.error === "name_required"
            ? "Client name is required."
            : searchParams.error === "create_failed"
            ? "Failed to create client. Please try again."
            : null;

    return (
        <div>
            <Header
                title="New Client"
                subtitle="Add a client to your roster"
                actions={
                    <Link href="/clients" className="btn-secondary">
                        Cancel
                    </Link>
                }
            />

            <div className="p-8 max-w-lg">
                {errorMsg && (
                    <div className="mb-6 px-4 py-3 rounded-lg bg-poppy-red/10 text-poppy-red text-sm">
                        {errorMsg}
                    </div>
                )}

                <form action={createClient} className="space-y-6">
                    {/* Name */}
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-text-primary mb-1.5"
                        >
                            Client Name <span className="text-fuchsia">*</span>
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            placeholder="e.g. Second Horizon Capital"
                            className="input w-full"
                            autoFocus
                        />
                    </div>

                    {/* Accent Color */}
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-3">
                            Accent Color
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {COLOR_OPTIONS.map((c, i) => (
                                <label key={c.hex} className="cursor-pointer">
                                    <input
                                        type="radio"
                                        name="accent_color"
                                        value={c.hex}
                                        defaultChecked={i === 0}
                                        className="sr-only peer"
                                    />
                                    <span
                                        className="block w-8 h-8 rounded-full ring-2 ring-transparent peer-checked:ring-white peer-checked:ring-offset-2 peer-checked:ring-offset-background transition-all"
                                        style={{ backgroundColor: c.hex }}
                                        title={c.label}
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="submit" className="btn-primary">
                            Create Client
                        </button>
                        <Link href="/clients" className="btn-secondary">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
