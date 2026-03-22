import http from "node:http";
import type { LogEntry, LoggerOptions, Logger, SubLogger, TimeFormat, Theme } from "./types.js";
import { hasTimestamp } from "./timestamp.js";
import { resolveTheme, formatEntry } from "./themes.js";
import { cleanByAge, sortLogs } from "./filters.js";
import { createEventBus } from "./events.js";
import { createServer } from "./server.js";

// ── Main export ──

/**
 * Creates a new logger instance with the given options.
 *
 * @param options - Configuration for max entries, theme, TTL, CORS, etc
 * @returns A fully configured {@link Logger} instance
 */
export function createLogger(options: LoggerOptions = {}): Logger {
    const maxEntries = options.maxEntries ?? 1000;
    const cors = options.cors ?? "*";
    const defaultOrder = options.order ?? "asc";
    const defaultSort = options.sort ?? "timestamp";
    const consolePrint = options.console ?? true;
    const maxAge = options.maxAge ?? null;
    const theme: Theme | null = resolveTheme(options.theme ?? "colored");
    const timeFormat: TimeFormat = options.timeFormat ?? "time";

    let logs: LogEntry[] = [];
    const { on, off, emit } = createEventBus();

    // ── TTL cleanup ──

    function cleanup(): void {
        if (maxAge) {
            logs = cleanByAge(logs, maxAge);
        }
    }

    // ── Core ──

    function log(entry: LogEntry, groupName?: string): LogEntry | null {
        if (!entry || typeof entry !== "object") return null;

        const record: LogEntry = hasTimestamp(entry)
            ? { ...entry }
            : { timestamp: Date.now(), ...entry };

        if (groupName) record._group = groupName;

        logs.push(record);
        cleanup();

        if (logs.length > maxEntries) {
            logs = logs.slice(-maxEntries);
        }

        if (consolePrint && theme) {
            process.stdout.write(formatEntry(record, theme, groupName, timeFormat) + "\n");
        }

        emit("log", record);
        return record;
    }

    function request(
        req: http.IncomingMessage,
        res: http.ServerResponse,
        extras: LogEntry = {},
    ): LogEntry | null {
        return log({
            method: req.method,
            url: req.url,
            status: res.statusCode,
            ...extras,
        });
    }

    function print(entry: LogEntry): void {
        if (theme) {
            process.stdout.write(
                formatEntry(entry, theme, entry?._group as string | undefined, timeFormat) + "\n",
            );
        }
    }

    function entries(): LogEntry[] {
        cleanup();
        return sortLogs([...logs], defaultSort, defaultOrder);
    }

    function clear(): void {
        logs = [];
        emit("clear");
    }

    // ── Groups ──

    function group(name: string): SubLogger {
        return {
            log: (entry: LogEntry) => log(entry, name),
            request: (req: http.IncomingMessage, res: http.ServerResponse, extras: LogEntry = {}) =>
                log({ method: req.method, url: req.url, status: res.statusCode, ...extras }, name),
            print: (entry: LogEntry) => {
                if (theme) {
                    process.stdout.write(formatEntry(entry, theme, name, timeFormat) + "\n");
                }
            },
        };
    }

    // ── HTTP server ──

    function serve(port: number = 3000): http.Server {
        return createServer(
            {
                getLogs: () => [...logs],
                cleanup,
                defaultSort,
                defaultOrder,
                cors,
            },
            port,
        );
    }

    return { log, request, print, entries, clear, serve, group, on, off };
}
