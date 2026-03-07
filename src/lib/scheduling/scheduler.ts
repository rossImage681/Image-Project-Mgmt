/**
 * Core Scheduling Logic
 * 
 * Handles two scheduling modes:
 * 1. Duration mode: start + durationBusinessDays → end
 * 2. Milestone-pattern mode: generates milestones from template offsets
 */

import {
    BusinessDayRules,
    DeliverableDependency,
    MilestonePatternItem,
    CreateMilestoneInput,
} from "@/types/database";
import {
    addBusinessDays,
    formatDateISO,
    parseDateISO,
    DEFAULT_BUSINESS_DAY_RULES,
} from "./businessDays";

export interface ScheduleResult {
    startDate: string;
    endDate: string;
    milestones: CreateMilestoneInput[];
}

export interface DurationScheduleInput {
    startDate: string;
    durationDays: number;
    rules?: BusinessDayRules;
}

export interface MilestonePatternInput {
    baseDate: string; // The "Round 1 Delivered" date (offset 0)
    pattern: MilestonePatternItem[];
    deliverableId: string;
    rules?: BusinessDayRules;
    reviewers?: string[];
}

/**
 * Calculate schedule using duration mode
 * Returns start date, computed end date
 */
export function calculateDurationSchedule(
    input: DurationScheduleInput
): { startDate: string; endDate: string } {
    const { startDate, durationDays, rules = DEFAULT_BUSINESS_DAY_RULES } = input;

    const start = parseDateISO(startDate);
    const end = addBusinessDays(start, durationDays - 1, rules); // -1 because start date counts as day 1

    return {
        startDate,
        endDate: formatDateISO(end),
    };
}

/**
 * Generate milestones from a template pattern
 * Returns array of milestone inputs ready to insert
 */
export function calculateMilestonePattern(
    input: MilestonePatternInput
): CreateMilestoneInput[] {
    const {
        baseDate,
        pattern,
        deliverableId,
        rules = DEFAULT_BUSINESS_DAY_RULES,
        reviewers = [],
    } = input;

    const base = parseDateISO(baseDate);

    return pattern.map((item) => {
        const scheduledDate = addBusinessDays(base, item.offset_days, rules);

        return {
            deliverable_id: deliverableId,
            name: item.name,
            type: item.type,
            scheduled_date: formatDateISO(scheduledDate),
            reviewers: reviewers,
            is_feedback_due: item.is_feedback_due,
        };
    });
}

/**
 * Resolve the complete schedule for a deliverable
 * Handles both duration-based and milestone-pattern templates
 */
export function resolveDeliverableSchedule(options: {
    deliverableId: string;
    startDate: string;
    templatePattern?: MilestonePatternItem[];
    durationDays?: number;
    isDurationBased: boolean;
    rules?: BusinessDayRules;
    reviewers?: string[];
}): ScheduleResult {
    const {
        deliverableId,
        startDate,
        templatePattern = [],
        durationDays = 0,
        isDurationBased,
        rules = DEFAULT_BUSINESS_DAY_RULES,
        reviewers = [],
    } = options;

    if (isDurationBased) {
        // Duration mode: calculate end date from duration
        const { endDate } = calculateDurationSchedule({
            startDate,
            durationDays,
            rules,
        });

        // For duration-based, create simple start/end milestones if no pattern
        const milestones: CreateMilestoneInput[] = templatePattern.length > 0
            ? calculateMilestonePattern({
                baseDate: startDate,
                pattern: templatePattern,
                deliverableId,
                rules,
                reviewers,
            })
            : [
                {
                    deliverable_id: deliverableId,
                    name: "Start",
                    type: "delivery",
                    scheduled_date: startDate,
                    reviewers,
                    is_feedback_due: false,
                },
                {
                    deliverable_id: deliverableId,
                    name: "Complete",
                    type: "final",
                    scheduled_date: endDate,
                    reviewers,
                    is_feedback_due: false,
                },
            ];

        return {
            startDate,
            endDate,
            milestones,
        };
    } else {
        // Milestone-pattern mode: generate milestones from pattern
        const milestones = calculateMilestonePattern({
            baseDate: startDate,
            pattern: templatePattern,
            deliverableId,
            rules,
            reviewers,
        });

        // End date is the last milestone
        const lastMilestone = milestones[milestones.length - 1];
        const endDate = lastMilestone?.scheduled_date ?? startDate;

        return {
            startDate,
            endDate,
            milestones,
        };
    }
}

/**
 * Calculate start date based on dependencies
 * Returns the earliest date after all dependencies are satisfied
 */
export function calculateDependentStartDate(
    dependencies: DeliverableDependency[],
    milestonesByDeliverable: Map<string, { type: string; scheduled_date: string }[]>,
    rules: BusinessDayRules = DEFAULT_BUSINESS_DAY_RULES
): string | null {
    if (dependencies.length === 0) {
        return null;
    }

    let latestDate: Date | null = null;

    for (const dep of dependencies) {
        const depMilestones = milestonesByDeliverable.get(dep.deliverable_id);
        if (!depMilestones) continue;

        // Find the specific milestone type we depend on
        const targetMilestone = depMilestones.find(
            (m) => m.type === dep.milestone_type
        );
        if (!targetMilestone) continue;

        const milestoneDate = parseDateISO(targetMilestone.scheduled_date);

        if (!latestDate || milestoneDate > latestDate) {
            latestDate = milestoneDate;
        }
    }

    if (!latestDate) {
        return null;
    }

    // Start on the next business day after the dependency
    const startDate = addBusinessDays(latestDate, 1, rules);
    return formatDateISO(startDate);
}
