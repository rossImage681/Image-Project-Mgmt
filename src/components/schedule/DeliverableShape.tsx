"use client";

import { Deliverable, Milestone } from "@/types/database";
import { MilestoneMarker } from "./MilestoneMarker";
import { parseDateISO, getBusinessDaysBetween } from "@/lib/scheduling";

interface DeliverableShapeProps {
    deliverable: Deliverable & { milestones?: Milestone[] };
    timelineStartDate: string;
    dayWidth?: number;
    accentColor?: string;
    isExpanded?: boolean;
    onClick?: () => void;
}

/**
 * Deliverable shape - colorful pill/tile/blob representing a deliverable on the timeline
 */
export function DeliverableShape({
    deliverable,
    timelineStartDate,
    dayWidth = 40,
    accentColor = "#E52E7D",
    isExpanded = false,
    onClick,
}: DeliverableShapeProps) {
    if (!deliverable.start_date || !deliverable.end_date) {
        return null;
    }

    const timelineStart = parseDateISO(timelineStartDate);
    const deliverableStart = parseDateISO(deliverable.start_date);
    const deliverableEnd = parseDateISO(deliverable.end_date);

    // Calculate position and width
    const startOffset = Math.floor(
        (deliverableStart.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    const duration = Math.floor(
        (deliverableEnd.getTime() - deliverableStart.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    const left = startOffset * dayWidth;
    const width = duration * dayWidth;

    // Phase 1 (pre-work) styling
    const isPhase1 = deliverable.phase1_days > 0;
    const phase1Width = deliverable.phase1_days * dayWidth;

    // Status styles
    const statusStyles: Record<string, string> = {
        planned: "opacity-60",
        in_progress: "opacity-100",
        blocked: "opacity-100 ring-2 ring-status-blocked",
        complete: "opacity-40",
    };

    return (
        <div
            className={`absolute h-8 rounded-lg cursor-pointer transition-all duration-300 ${isExpanded ? "h-12 shadow-lg z-10" : "hover:shadow-md"
                } ${statusStyles[deliverable.status]}`}
            style={{
                left,
                width,
                backgroundColor: accentColor,
                top: isExpanded ? -4 : 0,
            }}
            onClick={onClick}
        >
            {/* Phase 1 overlay (lower opacity) */}
            {isPhase1 && (
                <div
                    className="absolute inset-y-0 left-0 bg-black/30 rounded-l-lg"
                    style={{ width: phase1Width }}
                />
            )}

            {/* Label */}
            <div className="absolute inset-0 flex items-center px-2 overflow-hidden">
                <span className="text-xs font-medium text-white truncate">
                    {deliverable.name}
                </span>
            </div>

            {/* Milestones (shown when expanded) */}
            {isExpanded && deliverable.milestones && (
                <div className="absolute -bottom-4 left-0 right-0 h-4">
                    {deliverable.milestones.map((milestone) => {
                        const milestoneDate = parseDateISO(milestone.scheduled_date);
                        const milestoneOffset = Math.floor(
                            (milestoneDate.getTime() - deliverableStart.getTime()) / (1000 * 60 * 60 * 24)
                        );
                        return (
                            <MilestoneMarker
                                key={milestone.id}
                                milestone={milestone}
                                dayWidth={dayWidth}
                                startDateOffset={milestoneOffset}
                            />
                        );
                    })}
                </div>
            )}

            {/* Status indicator */}
            {deliverable.status === "in_progress" && (
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white animate-pulse" />
            )}
            {deliverable.status === "blocked" && (
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-status-blocked" />
            )}
        </div>
    );
}
