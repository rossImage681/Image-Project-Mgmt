"use client";

import { useMemo } from "react";
import { formatDateISO, parseDateISO, getDateRange } from "@/lib/scheduling";

interface TimelineHeaderProps {
    startDate: string;
    endDate: string;
    dayWidth?: number;
}

/**
 * Timeline header showing dates across the Gantt chart
 */
export function TimelineHeader({
    startDate,
    endDate,
    dayWidth = 40,
}: TimelineHeaderProps) {
    const dates = useMemo(() => {
        const start = parseDateISO(startDate);
        const end = parseDateISO(endDate);
        return getDateRange(start, end);
    }, [startDate, endDate]);

    // Group dates by week
    const weeks = useMemo(() => {
        const weekMap = new Map<string, Date[]>();

        dates.forEach((date) => {
            // Get the Monday of this week
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1);
            const monday = new Date(date);
            monday.setDate(diff);
            const weekKey = formatDateISO(monday);

            if (!weekMap.has(weekKey)) {
                weekMap.set(weekKey, []);
            }
            weekMap.get(weekKey)!.push(date);
        });

        return Array.from(weekMap.entries());
    }, [dates]);

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return (
        <div className="sticky top-0 z-10 bg-surface border-b border-border-light">
            {/* Month row */}
            <div className="flex border-b border-border-light">
                <div className="w-48 flex-shrink-0 px-4 py-2 bg-surface">
                    <span className="text-sm font-medium text-text-secondary">Property</span>
                </div>
                <div className="flex">
                    {weeks.map(([weekKey, weekDates]) => {
                        const firstDate = weekDates[0];
                        const month = monthNames[firstDate.getMonth()];
                        const year = firstDate.getFullYear();

                        return (
                            <div
                                key={weekKey}
                                className="text-center border-l border-border-light"
                                style={{ width: weekDates.length * dayWidth }}
                            >
                                <span className="text-xs font-medium text-text-secondary">
                                    {month} {year}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Day row */}
            <div className="flex">
                <div className="w-48 flex-shrink-0 px-4 py-1 bg-surface">
                    <span className="text-xs text-text-secondary">Deliverable</span>
                </div>
                <div className="flex">
                    {dates.map((date) => {
                        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                        const dayNum = date.getDate();
                        const dayName = dayNames[date.getDay()];

                        return (
                            <div
                                key={formatDateISO(date)}
                                className={`text-center border-l border-border-light ${isWeekend ? "bg-gray-50" : ""
                                    }`}
                                style={{ width: dayWidth }}
                            >
                                <div className="text-[10px] text-text-secondary">{dayName}</div>
                                <div className={`text-xs font-medium ${isWeekend ? "text-text-secondary" : "text-text-primary"}`}>
                                    {dayNum}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
