"use client";

import { Deliverable, Milestone, Property } from "@/types/database";

interface DetailDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    deliverable?: Deliverable & { milestones?: Milestone[] };
    property?: Property;
    isClientView?: boolean;
}

/**
 * Right-side drawer with full details for a deliverable
 */
export function DetailDrawer({
    isOpen,
    onClose,
    deliverable,
    property,
    isClientView = false,
}: DetailDrawerProps) {
    if (!isOpen || !deliverable) return null;

    const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
        planned: { bg: "bg-status-planned/20", text: "text-status-planned", label: "Planned" },
        in_progress: { bg: "bg-status-progress/20", text: "text-status-progress", label: "In Progress" },
        blocked: { bg: "bg-status-blocked/20", text: "text-status-blocked", label: "Blocked" },
        complete: { bg: "bg-status-complete/20", text: "text-status-complete", label: "Complete" },
    };

    const milestoneTypeStyles: Record<string, string> = {
        delivery: "bg-fuchsia",
        feedback_due: "bg-orange",
        review: "bg-bubblegum",
        final: "bg-status-complete",
    };

    const status = statusStyles[deliverable.status] || statusStyles.planned;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 z-40"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 bottom-0 w-96 bg-surface shadow-xl z-50 animate-drawer-slide overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-surface border-b border-border-light px-6 py-4 flex items-center justify-between">
                    <h2 className="text-lg font-heading font-semibold">Deliverable Details</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-text-secondary hover:text-text-primary hover:bg-pale-pink/20 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Deliverable Name & Status */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                                {status.label}
                            </span>
                            <span className="text-xs text-text-secondary capitalize">{deliverable.type}</span>
                        </div>
                        <h3 className="text-xl font-heading font-bold text-text-primary">
                            {deliverable.name}
                        </h3>
                        {property && (
                            <p className="text-sm text-text-secondary mt-1">{property.name}</p>
                        )}
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">Start Date</label>
                            <p className="text-sm font-medium text-text-primary mt-1">
                                {deliverable.start_date
                                    ? new Date(deliverable.start_date).toLocaleDateString("en-US", {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                    })
                                    : "—"}
                            </p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">End Date</label>
                            <p className="text-sm font-medium text-text-primary mt-1">
                                {deliverable.end_date
                                    ? new Date(deliverable.end_date).toLocaleDateString("en-US", {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                    })
                                    : "—"}
                            </p>
                        </div>
                    </div>

                    {/* Duration */}
                    {deliverable.duration_days && (
                        <div>
                            <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">Duration</label>
                            <p className="text-sm font-medium text-text-primary mt-1">
                                {deliverable.duration_days} business days
                            </p>
                        </div>
                    )}

                    {/* Milestones */}
                    {deliverable.milestones && deliverable.milestones.length > 0 && (
                        <div>
                            <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">Milestones</label>
                            <div className="mt-2 space-y-2">
                                {deliverable.milestones.map((milestone) => (
                                    <div
                                        key={milestone.id}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-background"
                                    >
                                        <div
                                            className={`w-2.5 h-2.5 rounded-full ${milestoneTypeStyles[milestone.type] || milestoneTypeStyles.delivery}`}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-text-primary">{milestone.name}</div>
                                            <div className="text-xs text-text-secondary">
                                                {new Date(milestone.scheduled_date).toLocaleDateString("en-US", {
                                                    weekday: "short",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </div>
                                        </div>
                                        {milestone.reviewers && milestone.reviewers.length > 0 && (
                                            <div className="flex -space-x-1">
                                                {milestone.reviewers.map((reviewer, i) => (
                                                    <div
                                                        key={i}
                                                        className="w-6 h-6 rounded-full bg-bubblegum/20 flex items-center justify-center text-xs font-medium text-bubblegum border-2 border-background"
                                                    >
                                                        {reviewer}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Dependencies */}
                    {deliverable.dependencies && deliverable.dependencies.length > 0 && (
                        <div>
                            <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">Dependencies</label>
                            <div className="mt-2">
                                <p className="text-sm text-text-secondary">
                                    {deliverable.dependencies.length} dependency(ies)
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Internal Notes (hidden in client view) */}
                    {!isClientView && deliverable.internal_notes && (
                        <div>
                            <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">Internal Notes</label>
                            <p className="text-sm text-text-primary mt-1 p-3 bg-orange/5 rounded-lg border-l-2 border-orange">
                                {deliverable.internal_notes}
                            </p>
                        </div>
                    )}

                    {/* Actions (hidden in client view) */}
                    {!isClientView && (
                        <div className="pt-4 border-t border-border-light space-y-2">
                            <button className="w-full btn-primary">Edit Deliverable</button>
                            <button className="w-full btn-secondary">Update Status</button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
