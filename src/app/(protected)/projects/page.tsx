import Link from "next/link";
import { Header } from "@/components/layout";
import { createAdminClient } from "@/lib/supabase/server";

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

// Ensure the page is dynamic
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
    const supabase = createAdminClient();

    // Fetch projects with related data
    const { data: projectsData } = await supabase
        .from('projects')
        .select(`
            id,
            name,
            status,
            start_date,
            end_date,
            clients (name, accent_color),
            properties (
                id,
                deliverables (id)
            )
        `)
        .order('updated_at', { ascending: false });

    // Format the project data
    const projects = (projectsData || []).map((project: any) => {
        let deliverablesCount = 0;

        project.properties?.forEach((prop: any) => {
            deliverablesCount += (prop.deliverables?.length || 0);
        });

        const formatDate = (dateString: string) => {
            if (!dateString) return 'N/A';
            return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
        };

        return {
            id: project.id,
            name: project.name,
            client: {
                name: project.clients?.name || 'Unknown Client',
                accent_color: project.clients?.accent_color || '#E52E7D', // default fallback
            },
            status: project.status,
            start_date: formatDate(project.start_date),
            end_date: formatDate(project.end_date),
            properties_count: project.properties?.length || 0,
            deliverables_count: deliverablesCount,
        };
    });

    return (
        <div>
            <Header
                title="Projects"
                subtitle="Manage all client projects and their schedules"
                actions={
                    <Link href="/projects/new" className="btn-primary">
                        + New Project
                    </Link>
                }
            />

            <div className="p-8">
                {/* Filters */}
                <div className="flex items-center gap-4 mb-6">
                    <select className="input w-48">
                        <option value="">All Clients</option>
                        {/* Note: In a full implementation, you'd fetch unique clients to populate this dropdown dynamically */}
                        <option value="1">Second Horizon Capital</option>
                        <option value="2">Apex Investments</option>
                        <option value="3">Meridian Group</option>
                    </select>
                    <select className="input w-36">
                        <option value="">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="on_hold">On Hold</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* New Project Card */}
                    <Link
                        href="/projects/new"
                        className="card border-dashed border-2 border-border-medium hover:border-fuchsia/50 flex flex-col items-center justify-center min-h-[220px] group transition-colors"
                    >
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-pale-pink/30 flex items-center justify-center mx-auto mb-3 group-hover:bg-fuchsia/20 transition-colors">
                                <svg className="w-6 h-6 text-fuchsia" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <div className="font-medium text-text-primary">Create New Project</div>
                            <div className="text-sm text-text-secondary mt-1">Start a new client project</div>
                        </div>
                    </Link>

                    {projects.map((project) => (
                        <Link
                            key={project.id}
                            href={`/projects/${project.id}`}
                            className="card hover:shadow-md hover:border-fuchsia/30 transition-all group relative overflow-hidden flex flex-col"
                            style={{ minHeight: '220px' }}
                        >
                            {/* Client Color Header */}
                            <div
                                className="absolute top-0 left-0 right-0 h-1"
                                style={{ backgroundColor: project.client.accent_color }}
                            />

                            <div className="flex-1 mt-2">
                                <div className="flex items-start justify-between mb-3 gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-heading font-semibold text-lg text-text-primary group-hover:text-fuchsia transition-colors truncate">
                                            {project.name}
                                        </h3>
                                        <p className="text-sm text-text-secondary truncate mt-0.5" title={project.client.name}>
                                            {project.client.name}
                                        </p>
                                    </div>
                                    <div className="shrink-0 mt-0.5">
                                        <StatusBadge status={project.status} />
                                    </div>
                                </div>

                                <div className="text-sm flex flex-col gap-1.5 text-text-secondary mt-5">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-border-medium" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span>{project.start_date} – {project.end_date}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 pt-4 mt-4 border-t border-border-light text-sm text-text-secondary">
                                <div className="flex items-center gap-2" title="Properties">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <span>{project.properties_count}</span>
                                </div>
                                <div className="flex items-center gap-2" title="Deliverables">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <span>{project.deliverables_count}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
