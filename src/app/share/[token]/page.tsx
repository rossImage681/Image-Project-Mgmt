import { ClientHeader, ClientFooter } from "@/components/layout";
import { GanttTimeline } from "@/components/schedule";

// Mock data - same as internal view but for client share
const mockProject = {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Q1 2026 Property Campaign",
    client: { name: "Second Horizon Capital", accent_color: "#3B82F6" },
    start_date: "2026-02-01",
    end_date: "2026-03-27",
    status: "active",
    properties: [
        {
            id: "33333333-3333-3333-3333-333333333301",
            project_id: "22222222-2222-2222-2222-222222222222",
            name: "Chicago Ridge",
            sort_order: 1,
            group_name: null,
            accent_color: "#E52E7D",
            created_at: "2026-01-01",
            deliverables: [
                {
                    id: "44444444-4444-4444-4444-444444444401",
                    property_id: "33333333-3333-3333-3333-333333333301",
                    name: "Brochure",
                    type: "brochure" as const,
                    template_id: null,
                    duration_days: null,
                    phase1_days: 0,
                    start_date: "2026-01-27",
                    end_date: "2026-02-02",
                    status: "complete" as const,
                    dependencies: [],
                    internal_notes: null, // Hidden from client
                    created_at: "2026-01-01",
                    updated_at: "2026-01-01",
                    milestones: [
                        { id: "m1", deliverable_id: "d1", name: "Round 1 Delivered", type: "delivery" as const, scheduled_date: "2026-01-28", reviewers: [], is_feedback_due: false, completed_at: null, notes: null, created_at: "2026-01-01" },
                        { id: "m2", deliverable_id: "d1", name: "Final Delivered", type: "final" as const, scheduled_date: "2026-02-02", reviewers: [], is_feedback_due: false, completed_at: null, notes: null, created_at: "2026-01-01" },
                    ],
                },
                {
                    id: "44444444-4444-4444-4444-444444444402",
                    property_id: "33333333-3333-3333-3333-333333333301",
                    name: "Microsite",
                    type: "microsite" as const,
                    template_id: null,
                    duration_days: 7,
                    phase1_days: 0,
                    start_date: "2026-02-03",
                    end_date: "2026-02-11",
                    status: "in_progress" as const,
                    dependencies: [],
                    internal_notes: null,
                    created_at: "2026-01-01",
                    updated_at: "2026-01-01",
                    milestones: [
                        { id: "m3", deliverable_id: "d2", name: "Development Start", type: "delivery" as const, scheduled_date: "2026-02-03", reviewers: [], is_feedback_due: false, completed_at: null, notes: null, created_at: "2026-01-01" },
                        { id: "m4", deliverable_id: "d2", name: "Launch", type: "final" as const, scheduled_date: "2026-02-11", reviewers: [], is_feedback_due: false, completed_at: null, notes: null, created_at: "2026-01-01" },
                    ],
                },
            ],
        },
        {
            id: "33333333-3333-3333-3333-333333333302",
            project_id: "22222222-2222-2222-2222-222222222222",
            name: "Orange Park Mall",
            sort_order: 2,
            group_name: null,
            accent_color: "#FF4A29",
            created_at: "2026-01-01",
            deliverables: [
                {
                    id: "44444444-4444-4444-4444-444444444403",
                    property_id: "33333333-3333-3333-3333-333333333302",
                    name: "Brochure",
                    type: "brochure" as const,
                    template_id: null,
                    duration_days: null,
                    phase1_days: 0,
                    start_date: "2026-02-03",
                    end_date: "2026-02-10",
                    status: "planned" as const,
                    dependencies: [],
                    internal_notes: null,
                    created_at: "2026-01-01",
                    updated_at: "2026-01-01",
                    milestones: [],
                },
                {
                    id: "44444444-4444-4444-4444-444444444404",
                    property_id: "33333333-3333-3333-3333-333333333302",
                    name: "Microsite",
                    type: "microsite" as const,
                    template_id: null,
                    duration_days: 5,
                    phase1_days: 0,
                    start_date: "2026-02-12",
                    end_date: "2026-02-18",
                    status: "planned" as const,
                    dependencies: [],
                    internal_notes: null,
                    created_at: "2026-01-01",
                    updated_at: "2026-01-01",
                    milestones: [],
                },
            ],
        },
        {
            id: "33333333-3333-3333-3333-333333333303",
            project_id: "22222222-2222-2222-2222-222222222222",
            name: "Layton Hills Mall",
            sort_order: 3,
            group_name: null,
            accent_color: "#22C55E",
            created_at: "2026-01-01",
            deliverables: [
                {
                    id: "44444444-4444-4444-4444-444444444405",
                    property_id: "33333333-3333-3333-3333-333333333303",
                    name: "Brochure",
                    type: "brochure" as const,
                    template_id: null,
                    duration_days: null,
                    phase1_days: 0,
                    start_date: "2026-02-11",
                    end_date: "2026-02-18",
                    status: "planned" as const,
                    dependencies: [],
                    internal_notes: null,
                    created_at: "2026-01-01",
                    updated_at: "2026-01-01",
                    milestones: [],
                },
                {
                    id: "44444444-4444-4444-4444-444444444406",
                    property_id: "33333333-3333-3333-3333-333333333303",
                    name: "Microsite",
                    type: "microsite" as const,
                    template_id: null,
                    duration_days: 5,
                    phase1_days: 0,
                    start_date: "2026-02-19",
                    end_date: "2026-02-25",
                    status: "planned" as const,
                    dependencies: [],
                    internal_notes: null,
                    created_at: "2026-01-01",
                    updated_at: "2026-01-01",
                    milestones: [],
                },
            ],
        },
        {
            id: "33333333-3333-3333-3333-333333333304",
            project_id: "22222222-2222-2222-2222-222222222222",
            name: "Park Plaza",
            sort_order: 4,
            group_name: null,
            accent_color: "#8B5CF6",
            created_at: "2026-01-01",
            deliverables: [
                {
                    id: "44444444-4444-4444-4444-444444444407",
                    property_id: "33333333-3333-3333-3333-333333333304",
                    name: "Brochure",
                    type: "brochure" as const,
                    template_id: null,
                    duration_days: null,
                    phase1_days: 0,
                    start_date: "2026-02-19",
                    end_date: "2026-02-26",
                    status: "planned" as const,
                    dependencies: [],
                    internal_notes: null,
                    created_at: "2026-01-01",
                    updated_at: "2026-01-01",
                    milestones: [],
                },
                {
                    id: "44444444-4444-4444-4444-444444444408",
                    property_id: "33333333-3333-3333-3333-333333333304",
                    name: "Microsite",
                    type: "microsite" as const,
                    template_id: null,
                    duration_days: 5,
                    phase1_days: 0,
                    start_date: "2026-02-26",
                    end_date: "2026-03-04",
                    status: "planned" as const,
                    dependencies: [],
                    internal_notes: null,
                    created_at: "2026-01-01",
                    updated_at: "2026-01-01",
                    milestones: [],
                },
            ],
        },
    ],
};

export default async function SharePage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params;
    const project = mockProject; // In production, validate token and fetch from Supabase

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <ClientHeader />

            <main className="flex-1 flex flex-col">
                {/* Project Header */}
                <div className="bg-white border-b border-border-light px-6 py-6 max-w-7xl mx-auto w-full">
                    <h1 className="text-2xl font-heading font-bold text-text-primary">
                        {project.name}
                    </h1>
                    <p className="text-text-secondary mt-1">
                        {project.client.name} • {project.start_date} – {project.end_date}
                    </p>
                </div>

                {/* Legend */}
                <div className="px-6 py-3 bg-white border-b border-border-light max-w-7xl mx-auto w-full">
                    <div className="flex items-center gap-6 text-xs text-text-secondary">
                        <span>Status:</span>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-fuchsia opacity-40" />
                            <span>Planned</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-fuchsia" />
                            <span>In Progress</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-fuchsia opacity-40" />
                            <span>Complete</span>
                        </div>
                    </div>
                </div>

                {/* Gantt Timeline */}
                <div className="flex-1 bg-white max-w-7xl mx-auto w-full overflow-hidden">
                    <GanttTimeline
                        startDate={project.start_date}
                        endDate={project.end_date}
                        properties={project.properties}
                        dayWidth={40}
                        isClientView={true}
                    />
                </div>
            </main>

            <ClientFooter />
        </div>
    );
}
