import { Header } from "@/components/layout";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        active: "bg-status-complete/20 text-status-complete",
        on_hold: "bg-orange/20 text-orange",
        completed: "bg-status-planned/20 text-status-planned",
        draft: "bg-text-secondary/20 text-text-secondary",
        blocked: "bg-status-blocked/20 text-status-blocked",
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.active}`}>
            {status ? status.replace("_", " ") : "Unknown"}
        </span>
    );
}

export default async function PortfolioPage() {
    const supabase = createAdminClient();

    // 1. Fetch active projects with related properties and deliverables
    const { data: projectsData } = await supabase
        .from('projects')
        .select(`
            id,
            name,
            start_date,
            end_date,
            status,
            clients (name, accent_color),
            properties (
                id,
                name,
                accent_color,
                deliverables (id, end_date, status)
            )
        `)
        .in('status', ['active', 'on_hold', 'draft'])
        .order('start_date', { ascending: true });

    // Format the project data
    const portfolioProjects = (projectsData || []).map((project: any) => {
        const clientData = Array.isArray(project.clients) ? project.clients[0] : project.clients;

        const formattedProperties = (project.properties || []).map((prop: any) => ({
            name: prop.name,
            accent_color: prop.accent_color || clientData?.accent_color || '#E52E7D',
            deliverablesCount: prop.deliverables?.length || 0,
        }));

        const formatDate = (dateString: string) => {
            if (!dateString) return 'N/A';
            return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
        };

        return {
            id: project.id,
            name: project.name,
            client: clientData?.name || 'Unknown Client',
            clientColor: clientData?.accent_color || '#3B82F6',
            start_date: formatDate(project.start_date),
            end_date: formatDate(project.end_date),
            status: project.status,
            properties: formattedProperties,
        };
    });

    // 2. Compute Summary Stats
    let totalProjects = projectsData?.length || 0;
    let totalProperties = 0;
    let totalDeliverables = 0;
    let dueThisWeek = 0;

    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    projectsData?.forEach((project: any) => {
        totalProperties += (project.properties?.length || 0);

        project.properties?.forEach((prop: any) => {
            totalDeliverables += (prop.deliverables?.length || 0);

            prop.deliverables?.forEach((del: any) => {
                if (del.status !== 'complete' && del.end_date) {
                    const end = new Date(del.end_date);
                    if (end >= today && end <= nextWeek) {
                        dueThisWeek++;
                    }
                }
            });
        });
    });

    return (
        <div>
            <Header
                title="Portfolio"
                subtitle="All active projects across all clients at a glance"
            />

            <div className="p-8 space-y-6">
                {/* Filters */}
                <div className="flex items-center gap-4">
                    <select className="input w-48">
                        <option value="">All Clients</option>
                        {/* Static options for now */}
                        <option value="1">Second Horizon Capital</option>
                        <option value="2">Apex Investments</option>
                        <option value="3">Meridian Group</option>
                    </select>
                    <select className="input w-36">
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="on_hold">On Hold</option>
                        <option value="draft">Draft</option>
                    </select>
                    <select className="input w-40">
                        <option value="">All Types</option>
                        <option value="brochure">Brochure</option>
                        <option value="microsite">Microsite</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Filter by reviewer..."
                        className="input w-48"
                    />
                </div>

                {/* Portfolio Table/Gantt */}
                <div className="card p-0 overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-gray-50 border-b border-border-light px-6 py-3 flex items-center">
                        <div className="w-72 font-medium text-sm text-text-secondary">Project / Property</div>
                        <div className="flex-1 font-medium text-sm text-text-secondary">Timeline</div>
                        <div className="w-24 text-center font-medium text-sm text-text-secondary">Status</div>
                    </div>

                    {/* Projects */}
                    {portfolioProjects.length === 0 && (
                        <div className="p-8 text-center text-text-secondary">
                            No active projects found.
                        </div>
                    )}

                    {portfolioProjects.map((project) => (
                        <div key={project.id} className="border-b border-border-light last:border-b-0">
                            {/* Project Row */}
                            <div className="flex items-center px-6 py-4 bg-white hover:bg-pale-pink/5 transition-colors">
                                <div className="w-72 pr-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full shrink-0"
                                            style={{ backgroundColor: project.clientColor }}
                                        />
                                        <div className="min-w-0">
                                            <div className="font-medium text-text-primary truncate" title={project.name}>{project.name}</div>
                                            <div className="text-sm text-text-secondary truncate" title={project.client}>{project.client}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="h-6 relative">
                                        {/* Simplified timeline bar */}
                                        <div
                                            className="absolute h-4 rounded-lg top-1"
                                            style={{
                                                backgroundColor: project.clientColor,
                                                left: "0%",
                                                width: "60%",
                                                opacity: project.status === "on_hold" ? 0.4 : 1,
                                            }}
                                        />
                                    </div>
                                    <div className="text-xs text-text-secondary mt-1">
                                        {project.start_date} – {project.end_date}
                                    </div>
                                </div>
                                <div className="w-24 text-center">
                                    <StatusBadge status={project.status} />
                                </div>
                            </div>

                            {/* Property Rows */}
                            {project.properties.map((property: any, i: number) => (
                                <div
                                    key={i}
                                    className="flex items-center px-6 py-3 pl-12 bg-gray-50/50 border-t border-border-light"
                                >
                                    <div className="w-72 pr-4">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-2 h-2 rounded-full shrink-0"
                                                style={{ backgroundColor: property.accent_color }}
                                            />
                                            <span className="text-sm text-text-primary truncate" title={property.name}>{property.name}</span>
                                            <span className="text-xs text-text-secondary shrink-0">
                                                ({property.deliverablesCount} del.)
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        {/* Simplified property timeline */}
                                        <div className="flex gap-1">
                                            {Array.from({ length: Math.min(property.deliverablesCount, 10) }).map((_, j) => (
                                                <div
                                                    key={j}
                                                    className="h-3 rounded"
                                                    style={{
                                                        backgroundColor: property.accent_color,
                                                        width: `${Math.max(100 / Math.max(property.deliverablesCount, 1) - 2, 5)}%`,
                                                        opacity: j === 0 ? 1 : 0.6,
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="w-24" />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-4 gap-6">
                    <div className="card text-center">
                        <div className="text-3xl font-heading font-bold text-fuchsia">{totalProjects}</div>
                        <div className="text-sm text-text-secondary">Active Projects</div>
                    </div>
                    <div className="card text-center">
                        <div className="text-3xl font-heading font-bold text-orange">{totalProperties}</div>
                        <div className="text-sm text-text-secondary">Properties</div>
                    </div>
                    <div className="card text-center">
                        <div className="text-3xl font-heading font-bold text-bubblegum">{totalDeliverables}</div>
                        <div className="text-sm text-text-secondary">Deliverables</div>
                    </div>
                    <div className="card text-center">
                        <div className="text-3xl font-heading font-bold text-status-complete">{dueThisWeek}</div>
                        <div className="text-sm text-text-secondary">Due This Week</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
