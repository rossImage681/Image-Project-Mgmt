import Link from "next/link";
import { Header } from "@/components/layout";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
    const supabase = createAdminClient();
    const { data: templatesData, error } = await supabase
        .from('templates')
        .select('*')
        .order('name');

    const templates = templatesData || [];

    return (
        <div>
            <Header
                title="Templates"
                subtitle="Manage reusable milestone patterns for deliverables"
                actions={
                    <button className="btn-primary">
                        + New Template
                    </button>
                }
            />

            <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                        <div key={template.id} className="card">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-heading font-semibold text-text-primary">
                                        {template.name}
                                    </h3>
                                    <p className="text-sm text-text-secondary capitalize">
                                        {template.deliverable_type}
                                    </p>
                                </div>
                                {template.is_default && (
                                    <span className="px-2 py-0.5 bg-fuchsia/10 text-fuchsia rounded-full text-xs font-medium">
                                        Default
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-text-secondary">Mode</span>
                                    <span className="font-medium">
                                        {template.is_duration_based ? "Duration-based" : "Milestone-pattern"}
                                    </span>
                                </div>
                                {template.is_duration_based && template.duration_days && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-text-secondary">Duration</span>
                                        <span className="font-medium">{template.duration_days} business days</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-text-secondary">Revision rounds</span>
                                    <span className="font-medium">{template.revision_rounds}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-text-secondary">Milestones</span>
                                    <span className="font-medium">{template.milestones_pattern.length}</span>
                                </div>
                            </div>

                            {/* Milestone Preview */}
                            <div className="p-3 bg-background rounded-lg mb-4">
                                <div className="text-xs font-medium text-text-secondary mb-2">Pattern Preview</div>
                                <div className="space-y-1">
                                    {template.milestones_pattern.slice(0, 3).map((m: any, i: number) => (
                                        <div key={i} className="flex items-center gap-2 text-xs">
                                            <div
                                                className={`w-2 h-2 rounded-full ${m.type === "final"
                                                    ? "bg-status-complete"
                                                    : m.type === "feedback_due"
                                                        ? "bg-orange"
                                                        : "bg-fuchsia"
                                                    }`}
                                            />
                                            <span className="text-text-primary">{m.name}</span>
                                            <span className="text-text-secondary ml-auto">+{m.offset_days}d</span>
                                        </div>
                                    ))}
                                    {template.milestones_pattern.length > 3 && (
                                        <div className="text-xs text-text-secondary">
                                            +{template.milestones_pattern.length - 3} more...
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button className="flex-1 btn-secondary text-sm py-2">Edit</button>
                                <button className="btn-secondary text-sm py-2 px-3">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Add Template Card */}
                    <div className="card border-dashed border-2 border-border-medium flex items-center justify-center min-h-[300px] hover:border-fuchsia/50 transition-colors cursor-pointer">
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-pale-pink/30 flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-fuchsia" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <div className="font-medium text-text-primary">Create Template</div>
                            <div className="text-sm text-text-secondary">Add a new milestone pattern</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
