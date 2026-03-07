import { Header } from "@/components/layout";
import { createAdminClient } from "@/lib/supabase/server";
import { createProject } from "@/app/actions/projects";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_OPTIONS = [
    { value: "draft", label: "Draft" },
    { value: "active", label: "Active" },
    { value: "on_hold", label: "On Hold" },
    { value: "completed", label: "Completed" },
];

export default async function NewProjectPage() {
    const supabase = createAdminClient();

    const { data: clientsData } = await supabase
        .from("clients")
        .select("id, name")
        .order("name");

    const clients = clientsData || [];

    return (
        <div>
            <Header
                title="New Project"
                subtitle="Create a new client project"
                actions={
                    <Link href="/projects" className="btn-secondary">
                        Cancel
                    </Link>
                }
            />

            <div className="p-8 max-w-2xl">
                <form action={createProject} className="space-y-6">
                    {/* Project Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1.5">
                            Project Name <span className="text-fuchsia">*</span>
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            placeholder="e.g. Second Horizon Capital – Spring 2026"
                            className="input w-full"
                        />
                    </div>

                    {/* Client */}
                    <div>
                        <label htmlFor="client_id" className="block text-sm font-medium text-text-primary mb-1.5">
                            Client <span className="text-fuchsia">*</span>
                        </label>
                        <select id="client_id" name="client_id" required className="input w-full">
                            <option value="">Select a client...</option>
                            {clients.map((c: any) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="start_date" className="block text-sm font-medium text-text-primary mb-1.5">
                                Start Date <span className="text-fuchsia">*</span>
                            </label>
                            <input
                                id="start_date"
                                name="start_date"
                                type="date"
                                required
                                className="input w-full"
                            />
                        </div>
                        <div>
                            <label htmlFor="end_date" className="block text-sm font-medium text-text-primary mb-1.5">
                                End Date <span className="text-fuchsia">*</span>
                            </label>
                            <input
                                id="end_date"
                                name="end_date"
                                type="date"
                                required
                                className="input w-full"
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-text-primary mb-1.5">
                            Status
                        </label>
                        <select id="status" name="status" defaultValue="draft" className="input w-full">
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="submit" className="btn-primary">
                            Create Project
                        </button>
                        <Link href="/projects" className="btn-secondary">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
