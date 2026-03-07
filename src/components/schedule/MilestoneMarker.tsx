"use client";

import { useMemo } from "react";
import { Milestone } from "@/types/database";

interface MilestoneMarkerProps {
    milestone: Milestone;
    dayWidth?: number;
    startDateOffset: number; // Days from timeline start
}

/**
 * Milestone marker - small dot/tick with hover tooltip
 */
export function MilestoneMarker({
    milestone,
    dayWidth = 40,
    startDateOffset,
}: MilestoneMarkerProps) {
    const typeStyles: Record<string, { bg: string; ring: string }> = {
        delivery: { bg: "bg-fuchsia", ring: "ring-fuchsia/30" },
        feedback_due: { bg: "bg-orange", ring: "ring-orange/30" },
        review: { bg: "bg-bubblegum", ring: "ring-bubblegum/30" },
        final: { bg: "bg-status-complete", ring: "ring-status-complete/30" },
    };

    const style = typeStyles[milestone.type] || typeStyles.delivery;
    const left = startDateOffset * dayWidth + dayWidth / 2;

    return (
        <div
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group`}
            style={{ left }}
        >
            {/* Marker dot */}
            <div
                className={`w-3 h-3 rounded-full ${style.bg} ring-2 ${style.ring} cursor-pointer transition-transform hover:scale-125`}
            />

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                <div className="bg-text-primary text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                    <div className="font-medium">{milestone.name}</div>
                    <div className="text-white/70 mt-0.5">
                        {new Date(milestone.scheduled_date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                        })}
                    </div>
                    {milestone.reviewers && milestone.reviewers.length > 0 && (
                        <div className="text-white/70 mt-1">
                            Reviewers: {milestone.reviewers.join(", ")}
                        </div>
                    )}
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-text-primary" />
            </div>
        </div>
    );
}
