/**
 * Template Utilities
 * 
 * Provides functions to work with reusable milestone templates
 */

import {
    Template,
    MilestonePatternItem,
    MilestoneType,
    DeliverableType,
} from "@/types/database";

/**
 * Default brochure template - 2 rounds
 */
export const BROCHURE_2_ROUNDS_TEMPLATE: Omit<Template, "id" | "created_at" | "updated_at"> = {
    name: "Brochure – 2 rounds",
    deliverable_type: "brochure",
    is_duration_based: false,
    duration_days: null,
    revision_rounds: 2,
    milestones_pattern: [
        { name: "Round 1 Delivered", offset_days: 0, type: "delivery", is_feedback_due: false },
        { name: "Round 1 Feedback Due", offset_days: 1, type: "feedback_due", is_feedback_due: true },
        { name: "Round 2 Delivered", offset_days: 3, type: "delivery", is_feedback_due: false },
        { name: "Round 2 Feedback Due", offset_days: 5, type: "feedback_due", is_feedback_due: true },
        { name: "Final Delivered", offset_days: 6, type: "final", is_feedback_due: false },
    ],
    spacing_rules: { round_spacing: 2, feedback_spacing: 1 },
    is_default: true,
};

/**
 * Default microsite template - standard (7 days)
 */
export const MICROSITE_STANDARD_TEMPLATE: Omit<Template, "id" | "created_at" | "updated_at"> = {
    name: "Microsite – standard",
    deliverable_type: "microsite",
    is_duration_based: true,
    duration_days: 7,
    revision_rounds: 2,
    milestones_pattern: [
        { name: "Development Start", offset_days: 0, type: "delivery", is_feedback_due: false },
        { name: "Review Ready", offset_days: 5, type: "review", is_feedback_due: false },
        { name: "Launch", offset_days: 7, type: "final", is_feedback_due: false },
    ],
    spacing_rules: { round_spacing: 2, feedback_spacing: 1 },
    is_default: true,
};

/**
 * Default microsite template - short (5 days)
 */
export const MICROSITE_SHORT_TEMPLATE: Omit<Template, "id" | "created_at" | "updated_at"> = {
    name: "Microsite – short",
    deliverable_type: "microsite",
    is_duration_based: true,
    duration_days: 5,
    revision_rounds: 1,
    milestones_pattern: [
        { name: "Development Start", offset_days: 0, type: "delivery", is_feedback_due: false },
        { name: "Review Ready", offset_days: 3, type: "review", is_feedback_due: false },
        { name: "Launch", offset_days: 5, type: "final", is_feedback_due: false },
    ],
    spacing_rules: { round_spacing: 1, feedback_spacing: 1 },
    is_default: false,
};

/**
 * All default templates
 */
export const DEFAULT_TEMPLATES = [
    BROCHURE_2_ROUNDS_TEMPLATE,
    MICROSITE_STANDARD_TEMPLATE,
    MICROSITE_SHORT_TEMPLATE,
];

/**
 * Generate a custom milestone pattern based on revision rounds
 */
export function generateMilestonePattern(options: {
    revisionRounds: number;
    roundSpacing: number;
    feedbackSpacing: number;
    includeFinal?: boolean;
}): MilestonePatternItem[] {
    const {
        revisionRounds,
        roundSpacing,
        feedbackSpacing,
        includeFinal = true,
    } = options;

    const pattern: MilestonePatternItem[] = [];
    let currentOffset = 0;

    for (let round = 1; round <= revisionRounds; round++) {
        // Delivery
        pattern.push({
            name: `Round ${round} Delivered`,
            offset_days: currentOffset,
            type: "delivery",
            is_feedback_due: false,
        });

        currentOffset += feedbackSpacing;

        // Feedback due
        pattern.push({
            name: `Round ${round} Feedback Due`,
            offset_days: currentOffset,
            type: "feedback_due",
            is_feedback_due: true,
        });

        currentOffset += roundSpacing;
    }

    // Final delivery
    if (includeFinal) {
        pattern.push({
            name: "Final Delivered",
            offset_days: currentOffset,
            type: "final",
            is_feedback_due: false,
        });
    }

    return pattern;
}

/**
 * Calculate total duration of a milestone pattern in business days
 */
export function calculatePatternDuration(pattern: MilestonePatternItem[]): number {
    if (pattern.length === 0) return 0;

    const lastOffset = Math.max(...pattern.map((m) => m.offset_days));
    return lastOffset + 1; // +1 because day 0 counts as day 1
}

/**
 * Get template by deliverable type
 */
export function getDefaultTemplateForType(
    type: DeliverableType
): Omit<Template, "id" | "created_at" | "updated_at"> | null {
    switch (type) {
        case "brochure":
            return BROCHURE_2_ROUNDS_TEMPLATE;
        case "microsite":
            return MICROSITE_STANDARD_TEMPLATE;
        default:
            return null;
    }
}

/**
 * Validate that a milestone pattern is well-formed
 */
export function validateMilestonePattern(pattern: MilestonePatternItem[]): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (pattern.length === 0) {
        errors.push("Pattern must have at least one milestone");
    }

    // Check for duplicate offsets with same type
    const seen = new Set<string>();
    for (const item of pattern) {
        const key = `${item.offset_days}-${item.type}`;
        if (seen.has(key)) {
            errors.push(`Duplicate milestone at offset ${item.offset_days} with type ${item.type}`);
        }
        seen.add(key);
    }

    // Check that offsets are non-negative
    for (const item of pattern) {
        if (item.offset_days < 0) {
            errors.push(`Offset cannot be negative: ${item.name}`);
        }
    }

    // Check for final milestone
    const hasFinal = pattern.some((m) => m.type === "final");
    if (!hasFinal) {
        errors.push("Pattern should include a final milestone");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
