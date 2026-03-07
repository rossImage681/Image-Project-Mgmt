/**
 * Business Day Calculation Utilities
 * 
 * Provides functions to work with business days, skipping weekends
 * and optionally custom holidays.
 */

import { BusinessDayRules } from "@/types/database";

/**
 * Default business day rules: Monday-Friday, no holidays
 */
export const DEFAULT_BUSINESS_DAY_RULES: BusinessDayRules = {
    workdays: [1, 2, 3, 4, 5], // Monday = 1, Friday = 5
    holidays: [],
};

/**
 * Check if a date is a business day according to the given rules
 */
export function isBusinessDay(
    date: Date,
    rules: BusinessDayRules = DEFAULT_BUSINESS_DAY_RULES
): boolean {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Convert JS day (0-6, Sunday=0) to ISO day (1-7, Monday=1)
    const isoDay = dayOfWeek === 0 ? 7 : dayOfWeek;

    // Check if it's a workday
    if (!rules.workdays.includes(isoDay)) {
        return false;
    }

    // Check if it's a holiday
    const dateStr = formatDateISO(date);
    if (rules.holidays.includes(dateStr)) {
        return false;
    }

    return true;
}

/**
 * Add N business days to a date
 * Positive days = forward, negative days = backward
 */
export function addBusinessDays(
    date: Date,
    days: number,
    rules: BusinessDayRules = DEFAULT_BUSINESS_DAY_RULES
): Date {
    const result = new Date(date);
    const direction = days >= 0 ? 1 : -1;
    let remaining = Math.abs(days);

    while (remaining > 0) {
        result.setDate(result.getDate() + direction);
        if (isBusinessDay(result, rules)) {
            remaining--;
        }
    }

    return result;
}

/**
 * Count business days between two dates (inclusive of start, exclusive of end)
 */
export function getBusinessDaysBetween(
    start: Date,
    end: Date,
    rules: BusinessDayRules = DEFAULT_BUSINESS_DAY_RULES
): number {
    let count = 0;
    const current = new Date(start);

    while (current < end) {
        if (isBusinessDay(current, rules)) {
            count++;
        }
        current.setDate(current.getDate() + 1);
    }

    return count;
}

/**
 * Get the next business day on or after the given date
 */
export function getNextBusinessDay(
    date: Date,
    rules: BusinessDayRules = DEFAULT_BUSINESS_DAY_RULES
): Date {
    const result = new Date(date);

    while (!isBusinessDay(result, rules)) {
        result.setDate(result.getDate() + 1);
    }

    return result;
}

/**
 * Get the previous business day on or before the given date
 */
export function getPreviousBusinessDay(
    date: Date,
    rules: BusinessDayRules = DEFAULT_BUSINESS_DAY_RULES
): Date {
    const result = new Date(date);

    while (!isBusinessDay(result, rules)) {
        result.setDate(result.getDate() - 1);
    }

    return result;
}

/**
 * Format a Date to ISO date string (YYYY-MM-DD)
 */
export function formatDateISO(date: Date): string {
    return date.toISOString().split("T")[0];
}

/**
 * Parse an ISO date string to a Date object (at midnight local time)
 */
export function parseDateISO(dateStr: string): Date {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
}

/**
 * Get an array of all dates between start and end (inclusive)
 */
export function getDateRange(start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    const current = new Date(start);

    while (current <= end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    return dates;
}

/**
 * Get an array of all business days between start and end (inclusive)
 */
export function getBusinessDayRange(
    start: Date,
    end: Date,
    rules: BusinessDayRules = DEFAULT_BUSINESS_DAY_RULES
): Date[] {
    return getDateRange(start, end).filter((date) => isBusinessDay(date, rules));
}
