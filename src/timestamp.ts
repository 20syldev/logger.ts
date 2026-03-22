import type { LogEntry } from "./types.js";

// ── Timestamp detection ──

export const timestampKeys: string[] = [
    "timestamp",
    "time",
    "date",
    "created",
    "createdat",
    "created_at",
    "updated",
    "updatedat",
    "updated_at",
];

/**
 * Checks whether the entry contains a recognized timestamp key.
 *
 * @param entry - The log entry to inspect
 * @returns `true` if a timestamp field is found
 */
export function hasTimestamp(entry: LogEntry): boolean {
    return Object.keys(entry).some((key) => timestampKeys.includes(key.toLowerCase()));
}

/**
 * Extracts the timestamp value from a log entry as a Unix millisecond epoch.
 *
 * @param entry - The log entry to read
 * @returns The timestamp in milliseconds, or `0` if none is found
 */
export function getTimestampValue(entry: LogEntry): number {
    for (const key of Object.keys(entry)) {
        if (timestampKeys.includes(key.toLowerCase())) {
            const val = entry[key];
            return typeof val === "number" ? val : new Date(val as string).getTime();
        }
    }
    return 0;
}
