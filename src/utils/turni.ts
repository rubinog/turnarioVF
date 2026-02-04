import { differenceInCalendarDays, addDays } from 'date-fns';

export type Section = 'A' | 'B' | 'C' | 'D';
export type ShiftInfo = {
    section: Section;
    skip: number;
};

/**
 * Formats decimal hours to HH:MM format
 * Example: 12.5 => "12:30", 12 => "12:00"
 */
export const formatHours = (decimalHours: number): string => {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// Reference: 01/01/2025 -> A3
// Note: Month in Date constructor is 0-indexed (0=Jan)
const REF_DATE = new Date(2025, 0, 1);
const REF_SECTION_INDEX = 0; // A=0, B=1, C=2, D=3
const REF_SKIP = 3;

const SECTIONS: Section[] = ['A', 'B', 'C', 'D'];

/**
 * Calculates the Day Shift (08:00 - 20:00) for a given date.
 */
export const getDayShift = (date: Date): ShiftInfo => {
    const diffDays = differenceInCalendarDays(date, REF_DATE);

    // Section rotates every day: A -> B -> C -> D
    let sectionIdx = (REF_SECTION_INDEX + diffDays) % 4;
    if (sectionIdx < 0) sectionIdx += 4;

    // Skip rotates every 4 days.
    // floor(diffDays / 4) adds to the skip
    const cycleShift = Math.floor(diffDays / 4);

    // Calculate 0-based skip index (0-7 corresponding to 1-8)
    let skipIdx = (REF_SKIP - 1 + cycleShift) % 8;
    if (skipIdx < 0) skipIdx += 8;

    const skip = skipIdx + 1;

    return {
        section: SECTIONS[sectionIdx],
        skip
    };
};

/**
 * Calculates the Night Shift (20:00 - 08:00) for a given date.
 * Rule: Night shift of Day X corresponds to the team that worked Day X-1.
 */
export const getNightShift = (date: Date): ShiftInfo => {
    const prevDate = addDays(date, -1);
    return getDayShift(prevDate);
};

export const formatShift = (shift: ShiftInfo) => `${shift.section}${shift.skip}`;
