import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout";
import { GanttTimeline } from "@/components/schedule";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProjectSchedulePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = createAdminClient();

    // Fetch project with all related nested data for the Gantt Chart
    const { data: projectData, error } = await supabase
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
                sort_order,
                accent_color,
                deliverables (
                    id,
                    name,
                    type,
                    start_date,
                    end_date,
                    status,
                    phase1_days,
                    milestones (
                        id,
                        name,
                        type,
                        scheduled_date,
                        is_feedback_due,
                        completed_at
                    )
                )
            )
        `)
        .eq('id', id)
        .single();

    if (error || !projectData) {
        console.error("Error fetching project:", error);
        notFound();
    }

    // Sort properties by sort_order
    const sortedProperties = (projectData.properties || []).sort((a: any, b: any) =>
        (a.sort_order || 0) - (b.sort_order || 0)
    );

    // Format the data to match the expected structure
    const clientData = Array.isArray(projectData.clients) ? projectData.clients[0] : projectData.clients;

    const project = {
        id: projectData.id,
        name: projectData.name,
        client: {
            name: clientData?.name || 'Unknown Client',
            accent_color: clientData?.accent_color || '#3B82F6'
        },
        start_date: projectData.start_date,
        end_date: projectData.end_date,
        status: projectData.status,
        properties: sortedProperties.map((prop: any) => ({
            ...prop,
            deliverables: (prop.deliverables || []).sort((a: any, b: any) => {
                // Sort deliverables by start date
                if (!a.start_date) return 1;
                if (!b.start_date) return -1;
                return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
            }).map((del: any) => ({
                ...del,
                milestones: (del.milestones || []).sort((a: any, b: any) => {
                    // Sort milestones by scheduled date
                    if (!a.scheduled_date) return 1;
                    if (!b.scheduled_date) return -1;
                    return new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime();
                })
            }))
        }))
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
    };

    const totalDeliverables = project.properties.reduce((acc: number, p: any) => acc + (p.deliverables?.length || 0), 0);

    return (
        <div className="flex flex-col h-screen">
            <Header
                title={project.name}
                subtitle={project.client.name}
                actions={
                    <div className="flex gap-2">
                        <button className="btn-secondary flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            Share
                        </button>
                        <Link href={`/projects/${id}/edit`} className="btn-primary flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </Link>
                    </div>
                }
            />

            {/* Status Pills */}
            <div className="px-8 py-4 border-b border-border-light bg-white flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-text-secondary">Project:</span>
                    <span className="px-2 py-0.5 bg-status-complete/20 text-status-complete rounded-full text-xs font-medium capitalize">
                        {project.status ? project.status.replace("_", " ") : "Unknown"}
                    </span>
                </div>
                <div className="text-sm text-text-secondary">
                    {formatDate(project.start_date)} – {formatDate(project.end_date)}
                </div>
                <div className="text-sm text-text-secondary">
                    {project.properties.length} properties • {totalDeliverables} deliverables
                </div>
            </div>

            {/* Legend */}
            <div className="px-8 py-3 bg-background flex items-center gap-6 text-xs">
                <span className="text-text-secondary">Status:</span>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-fuchsia opacity-40" />
                    <span>Planned</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-fuchsia" />
                    <span>In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-fuchsia opacity-40 ring-2 ring-status-blocked" />
                    <span>Blocked</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-fuchsia opacity-40" />
                    <span>Complete</span>
                </div>
                <span className="ml-4 text-text-secondary">Milestones:</span>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-fuchsia" />
                    <span>Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange" />
                    <span>Feedback Due</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-status-complete" />
                    <span>Final</span>
                </div>
            </div>

            {/* Gantt Timeline */}
            <div className="flex-1 overflow-hidden">
                <GanttTimeline
                    startDate={project.start_date}
                    endDate={project.end_date}
                    properties={project.properties as any}
                    dayWidth={40}
                    isClientView={false}
                />
            </div>
        </div>
    );
}
