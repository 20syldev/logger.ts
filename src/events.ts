import type { LogEntry, LoggerEvent, EventCallback } from "./types.js";

// ── Event bus ──

export interface EventBus {
    on(event: LoggerEvent, callback: EventCallback): void;
    off(event: LoggerEvent, callback: EventCallback): void;
    emit(event: LoggerEvent, data?: LogEntry): void;
}

export function createEventBus(): EventBus {
    const listeners = new Map<LoggerEvent, EventCallback[]>();

    function on(event: LoggerEvent, callback: EventCallback): void {
        if (!listeners.has(event)) listeners.set(event, []);
        listeners.get(event)!.push(callback);
    }

    function off(event: LoggerEvent, callback: EventCallback): void {
        if (!listeners.has(event)) return;
        const cbs = listeners.get(event)!.filter((cb) => cb !== callback);
        listeners.set(event, cbs);
    }

    function emit(event: LoggerEvent, data?: LogEntry): void {
        if (!listeners.has(event)) return;
        for (const cb of listeners.get(event)!) {
            cb(data);
        }
    }

    return { on, off, emit };
}
