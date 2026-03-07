import Link from "next/link";
import { Header } from "@/components/layout";
import { createAdminClient } from "@/lib/supabase/server";

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        active: "bg-status-complete/20 text-status-complete",
        completed: "bg-status-complete/20 text-status-complete",
        draft: "bg-status-planned/20 text-status-planned",
        in_progress: "bg-status-progress/20 text-status-progress",
        planned: "bg-status-planned/20 text-status-planned",
        on_hold: "bg-orange/20 text-orange",
        blocked: "bg-status-blocked/20 text-status-blocked",
    };

    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.planned}`}>
            {status ? status.replace("_", " ") : "Unknown"}
        </span>
    );
}

export default async function DashboardPage() {
    const supabase = createAdminClient();

    // 1. Active Projects Count
    const { count: activeProjectsCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

    // 2. Deliverables Due This Week
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const { count: deliverablesDueCount } = await supabase
        .from('deliverables')
        .select('*', { count: 'exact', head: true })
        .gte('end_date', today.toISOString().split('T')[0])
        .lte('end_date', nextWeek.toISOString().split('T')[0])
        .neq('status', 'complete');

    // 3. Pending Reviews
    const { count: pendingReviewsCount } = await supabase
        .from('milestones')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'review')
        .is('completed_at', null);

    // 4. Completed projects (total)
    const { count: completedProjectsCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

    const stats = [
        { label: "Active Projects", value: activeProjectsCount?.toString() || "0", color: "fuchsia" },
        { label: "Deliverables Due Next 7 Days", value: deliverablesDueCount?.toString() || "0", color: "orange" },
        { label: "Pending Reviews", value: pendingReviewsCount?.toString() || "0", color: "bubblegum" },
        { label: "Completed Projects", value: completedProjectsCount?.toString() || "0", color: "status-complete" },
    ];

    // Fetch recent projects
    const { data: recentProjectsData } = await supabase
        .from('projects')
        .select(`
            id,
            name,
            status,
            end_date,
            clients (name),
            properties (
                deliverables (status)
            )
        `)
        .in('status', ['active', 'on_hold', 'draft'])
        .order('updated_at', { ascending: false })
        .limit(4);

    const recentProjects = (recentProjectsData || []).map((project: any) => {
        let totalDeliverables = 0;
        let completedDeliverables = 0;

        project.properties?.forEach((prop: any) => {
            prop.deliverables?.forEach((del: any) => {
                totalDeliverables++;
                if (del.status === 'complete') completedDeliverables++;
            });
        });

        const progress = totalDeliverables > 0 ? Math.round((completedDeliverables / totalDeliverables) * 100) : 0;
        const dateStr = project.end_date ? new Date(project.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : 'N/A';

        return {
            id: project.id,
            name: project.name,
            client: project.clients?.name || 'Unknown Client',
            status: project.status,
            progress,
            dueDate: dateStr,
        };
    });

    // Fetch upcoming deliverables
    const { data: upcomingDeliverablesData } = await supabase
        .from('deliverables')
        .select(`
            id,
            name,
            status,
            end_date,
            properties (name)
        `)
        .neq('status', 'complete')
        .order('end_date', { ascending: true })
        .limit(5);

    const upcomingDeliverables = (upcomingDeliverablesData || []).map((del: any) => {
        const dateStr = del.end_date ? new Date(del.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }) : 'N/A';
        return {
            name: del.name,
            date: dateStr,
            status: del.status,
            property: del.properties?.name || 'Unknown Property',
        };
    });

    return (
        <div>
            <Header
                title="Dashboard"
                subtitle="Welcome back! Here's what's happening with your projects."
                actions={
                    <Link href="/projects/new" className="btn-primary">
                        + New Project
                    </Link>
                }
            />

            <div className="p-8 space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-6">
                    {stats.map((stat) => (
                        <div key={stat.label} className="card">
                            <div className={`text-3xl font-heading font-bold text-${stat.color}`}>
                                {stat.value}
                            </div>
                            <div className="text-sm text-text-secondary mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {/* Recent Projects */}
                    <div className="col-span-2 card">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-heading font-semibold">Recent Projects</h2>
                            <Link href="/projects" className="text-sm text-fuchsia hover:text-bubblegum transition-colors">
                                View all →
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {recentProjects.map((project) => (
                                <Link
                                    key={project.id}
                                    href={`/projects/${project.id}`}
                                    className="block p-4 rounded-lg border border-border-light hover:border-fuchsia/30 hover:bg-pale-pink/5 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <div className="font-medium text-text-primary">{project.name}</div>
                                            <div className="text-sm text-text-secondary">{project.client}</div>
                                        </div>
                                        <StatusBadge status={project.status} />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 bg-border-light rounded-full h-2 overflow-hidden">
                                            <div
                                                className="h-full bg-fuchsia rounded-full transition-all"
                                                style={{ width: `${project.progress}%` }}
                                            />
                                        </div>
                                        <div className="text-sm text-text-secondary">{project.progress}%</div>
                                        <div className="text-sm text-text-secondary">Due {project.dueDate}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming Deliverables */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-heading font-semibold">Upcoming</h2>
                            <Link href="/portfolio" className="text-sm text-fuchsia hover:text-bubblegum transition-colors">
                                View all →
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {upcomingDeliverables.map((item, i) => (
                                <div
                                    key={i}
                                    className="p-3 rounded-lg border border-border-light"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="font-medium text-text-primary text-sm">{item.name}</div>
                                        <StatusBadge status={item.status} />
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-text-secondary">
                                        <span>{item.property}</span>
                                        <span>{item.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card">
                    <h2 className="text-lg font-heading font-semibold mb-4">Quick Actions</h2>
                    <div className="flex gap-4">
                        <Link
                            href="/projects/new"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border-light hover:border-fuchsia/30 hover:bg-pale-pink/5 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-lg bg-fuchsia/10 flex items-center justify-center">
                                <svg className="w-5 h-5 text-fuchsia" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <div>
                                <div className="font-medium text-text-primary">New Project</div>
                                <div className="text-sm text-text-secondary">Start a new client project</div>
                            </div>
                        </Link>
                        <Link
                            href="/templates"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border-light hover:border-fuchsia/30 hover:bg-pale-pink/5 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-lg bg-orange/10 flex items-center justify-center">
                                <svg className="w-5 h-5 text-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <div className="font-medium text-text-primary">Manage Templates</div>
                                <div className="text-sm text-text-secondary">Edit milestone patterns</div>
                            </div>
                        </Link>
                        <Link
                            href="/portfolio"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border-light hover:border-fuchsia/30 hover:bg-pale-pink/5 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-lg bg-bubblegum/10 flex items-center justify-center">
                                <svg className="w-5 h-5 text-bubblegum" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                </svg>
                            </div>
                            <div>
                                <div className="font-medium text-text-primary">Portfolio Gantt</div>
                                <div className="text-sm text-text-secondary">View all projects timeline</div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
