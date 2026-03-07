"use client";

import { useState, useMemo } from "react";
import { Property, Deliverable, Milestone } from "@/types/database";
import { TimelineHeader } from "./TimelineHeader";
import { DeliverableShape } from "./DeliverableShape";
import { DetailDrawer } from "./DetailDrawer";
import { parseDateISO, getDateRange } from "@/lib/scheduling";

interface GanttTimelineProps {
    startDate: string;
    endDate: string;
    properties: (Property & {
        deliverables: (Deliverable & { milestones?: Milestone[] })[];
    })[];
    dayWidth?: number;
    isClientView?: boolean;
}

/**
 * Main Gantt timeline component
 */
export function GanttTimeline({
    startDate,
    endDate,
    properties,
    dayWidth = 40,
    isClientView = false,
}: GanttTimelineProps) {
    const [expandedDeliverableId, setExpandedDeliverableId] = useState<string | null>(null);
    const [selectedDeliverable, setSelectedDeliverable] = useState<
        (Deliverable & { milestones?: Milestone[] }) | null
    >(null);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

    const dates = useMemo(() => {
        const start = parseDateISO(startDate);
        const end = parseDateISO(endDate);
        return getDateRange(start, end);
    }, [startDate, endDate]);

    const timelineWidth = dates.length * dayWidth;

    const handleDeliverableClick = (
        deliverable: Deliverable & { milestones?: Milestone[] },
        property: Property
    ) => {
        if (expandedDeliverableId === deliverable.id) {
            // Already expanded, open drawer
            setSelectedDeliverable(deliverable);
            setSelectedProperty(property);
        } else {
            // Expand the deliverable
            setExpandedDeliverableId(deliverable.id);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Timeline Container */}
            <div className="flex-1 overflow-auto">
                <TimelineHeader
                    startDate={startDate}
                    endDate={endDate}
                    dayWidth={dayWidth}
                />

                {/* Rows */}
                <div>
                    {properties.map((property, propertyIndex) => (
                        <div
                            key={property.id}
                            className={`flex border-b border-border-light ${propertyIndex % 2 === 0 ? "bg-surface" : "bg-surface-raised"}
                                }`}
                        >
                            {/* Property Label */}
                            <div className="w-48 flex-shrink-0 px-4 py-3 border-r border-border-light">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: property.accent_color || "#E52E7D" }}
                                    />
                                    <span className="font-medium text-sm text-text-primary truncate">
                                        {property.name}
                                    </span>
                                </div>
                            </div>

                            {/* Timeline Area */}
                            <div
                                className="relative"
                                style={{ width: timelineWidth, minHeight: 56 }}
                            >
                                {/* Weekend backgrounds */}
                                {dates.map((date, i) => {
                                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                    if (!isWeekend) return null;
                                    return (
                                        <div
                                            key={i}
                                            className="absolute inset-y-0 bg-gray-100/50"
                                            style={{ left: i * dayWidth, width: dayWidth }}
                                        />
                                    );
                                })}

                                {/* Deliverables */}
                                <div className="absolute inset-0 py-3 px-1">
                                    {property.deliverables.map((deliverable) => (
                                        <DeliverableShape
                                            key={deliverable.id}
                                            deliverable={deliverable}
                                            timelineStartDate={startDate}
                                            dayWidth={dayWidth}
                                            accentColor={property.accent_color || "#E52E7D"}
                                            isExpanded={expandedDeliverableId === deliverable.id}
                                            onClick={() => handleDeliverableClick(deliverable, property)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail Drawer */}
            <DetailDrawer
                isOpen={!!selectedDeliverable}
                onClose={() => {
                    setSelectedDeliverable(null);
                    setSelectedProperty(null);
                }}
                deliverable={selectedDeliverable || undefined}
                property={selectedProperty || undefined}
                isClientView={isClientView}
            />
        </div>
    );
}
