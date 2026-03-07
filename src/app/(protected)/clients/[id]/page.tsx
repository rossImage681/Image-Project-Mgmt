import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        draft: "bg-text-secondary/20 text-text-secondary",
        active: "bg-status-complete/20 text-status-complete",
        on_hold: "bg-orange/20 text-orange",
        completed: "bg-status-planned/20 text-status-planned",
        archived: "bg-border-medium text-text-secondary",
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>
            {status ? status.replace("_", " ") : "Unknown"}
        </span>
    );
}

export default async function ClientDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: clientData } = await supabase
        .from("clients")
        .select(`
            id,
            name,
            accent_color,
            projects (
                id,
                name,
                status,
                start_date,
                end_date,
                properties (id)
            )
        `)
        .eq("id", id)
        .single();

    if (!clientData) notFound();

    const formatDate = (d: string) =>
        d
            ? new Date(d).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  timeZone: "UTC",
              })
            : "N/A";

    const projects = (clientData.projects || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        start_date: formatDate(p.start_date),
        end_date: formatDate(p.end_date),
        properties_count: (p.properties || []).length,
    }));

    const activeCount = projects.filter((p) => p.status === "active").length;
    const accentColor = clientData.accent_color || "#E52E7D";
    const initials = clientData.name
        .split(" ")
        .slice(0, 2)
        .map((w: string) => w[0])
        .join("")
        .toUpperCase();

    return (
        <div>
            <Header
                title={clientData.name}
                subtitle={`${activeCount} active project${activeCount !== 1 ? "s" : ""} · ${projects.length} total`}
                actions={
                    <Link href="/projects/new" className="btn-primary">
                        + New Project
                    </Link>
                }
            />

            <div className="p-8 space-y-8">
                {/* Client card */}
                <div className="card flex items-center gap-6 relative overflow-hidden">
                    <div
                        className="absolute top-0 left-0 bottom-0 w-1"
                        style={{ backgroundColor: accentColor }}
                    />
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xl ml-3"
                        style={{ backgroundColor: accentColor }}
                    >
                        {initials}
                    </div>
                    <div>
                        <div className="text-2xl font-heading font-bold text-text-primary">{clientData.name}</div>
                        <div className="text-sm text-text-secondary mt-1">{projects.length} project{projects.length !== 1 ? "s" : ""}</div>
                    </div>
                </div>

                {/* Projects list */}
                <div>
                    <h2 className="text-lg font-heading font-semibold mb-4">Projects</h2>
                    <div className="space-y-3">
                        {projects.map((project) => (
                            <Link
                                key={project.id}
                                href={`/projects/${project.id}`}
                                className="card flex items-center justify-between hover:border-fuchsia/30 hover:shadow-sm transition-all group"
                            >
                                <div>
                                    <div className="font-medium text-text-primary group-hover:text-fuchsia transition-colors">
                                        {project.name}
                                    </div>
                                    <div className="text-sm text-text-secondary mt-0.5">
                                        {project.start_date} – {project.end_date} · {project.properties_count} propert{project.properties_count !== 1 ? "ies" : "y"}
                                    </div>
                                </div>
                                <StatusBadge status={project.status} />
                            </Link>
                        ))}
                        {projects.length === 0 && (
                            <div className="text-text-secondary text-sm">No projects yet.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
