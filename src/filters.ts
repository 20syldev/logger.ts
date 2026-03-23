import type { LogEntry } from "./types.js";
import { getTimestampValue } from "./timestamp.js";

// ── TTL cleanup ──

/**
 * Removes entries older than the given TTL.
 *
 * @param logs - The log entries to filter
 * @param maxAge - Maximum age in seconds
 * @returns Entries that are still within the TTL window
 */
export function cleanByAge(logs: LogEntry[], maxAge: number): LogEntry[] {
    const cutoff = Date.now() - maxAge * 1000;
    return logs.filter((entry) => {
        const ts = getTimestampValue(entry);
        return ts >= cutoff;
    });
}

// ── Sorting & filtering ──

/**
 * Sorts log entries by a given field and order.
 *
 * @param logs - The log entries to sort
 * @param sort - The field name to sort by
 * @param order - Sort direction (`"asc"` or `"desc"`)
 * @returns A new sorted array of entries
 */
export function sortLogs(logs: LogEntry[], sort: string, order: "asc" | "desc"): LogEntry[] {
    if (!sort) return order === "desc" ? [...logs].reverse() : [...logs];
    const sorted = [...logs].sort((a, b) => {
        const aVal = a[sort];
        const bVal = b[sort];
        if (aVal === bVal) return 0;
        if (aVal === undefined) return 1;
        if (bVal === undefined) return -1;
        if (typeof aVal === "number" && typeof bVal === "number") return aVal - bVal;
        return String(aVal).localeCompare(String(bVal));
    });
    return order === "desc" ? sorted.reverse() : sorted;
}

/**
 * Filters log entries by exact key-value matches.
 *
 * @param logs - The log entries to filter
 * @param filters - Key-value pairs that entries must match
 * @returns Entries matching all filter criteria
 */
export function filterLogs(logs: LogEntry[], filters: Record<string, string>): LogEntry[] {
    if (Object.keys(filters).length === 0) return [...logs];
    return logs.filter((entry) =>
        Object.entries(filters).every(([key, value]) => String(entry[key]) === value),
    );
}
