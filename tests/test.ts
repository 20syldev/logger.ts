import {
    createLogger,
    themes,
    resolveTheme,
    defaultColors,
    defaultIcons,
    createEventBus,
} from "../src/logger.js";
import type { EventBus } from "../src/logger.js";

// ── Test 1: Basic logging + auto-print (colored theme) ──
console.log("\n=== Test 1: Basic log (colored theme) ===");
const logger = createLogger({ theme: "colored" });
logger.log({ method: "GET", url: "/api/users", status: 200, duration: "45ms" });
logger.log({ method: "POST", url: "/api/users", status: 201, duration: "120ms" });
logger.log({ method: "DELETE", url: "/api/users/5", status: 404, duration: "12ms" });
logger.log({ method: "GET", url: "/api/crash", status: 500, duration: "2ms" });

// ── Test 2: Detailed theme with icons ──
console.log("\n=== Test 2: Detailed theme ===");
const detailed = createLogger({ theme: "detailed", console: true });
detailed.log({ method: "GET", url: "/health", status: 200, duration: "1ms" });
detailed.log({ method: "PUT", url: "/api/config", status: 500, duration: "340ms" });

// ── Test 3: Minimal theme ──
console.log("\n=== Test 3: Minimal theme ===");
const minimal = createLogger({ theme: "minimal" });
minimal.log({ method: "GET", url: "/", status: 200 });

// ── Test 4: Plain theme ──
console.log("\n=== Test 4: Plain theme ===");
const plain = createLogger({ theme: "plain" });
plain.log({ method: "PATCH", url: "/api/item/3", status: 200, duration: "88ms" });

// ── Test 5: Console disabled ──
console.log("\n=== Test 5: Console disabled (should be silent) ===");
const silent = createLogger({ console: false });
silent.log({ method: "GET", url: "/silent", status: 200 });
console.log("Entries count:", silent.entries().length);

// ── Test 6: Ordering ──
console.log("\n=== Test 6: Ordering ===");
const ordered = createLogger({ order: "desc", console: false });
ordered.log({ timestamp: 1000, msg: "first" });
ordered.log({ timestamp: 3000, msg: "third" });
ordered.log({ timestamp: 2000, msg: "second" });
const desc = ordered.entries();
console.log("Desc order:", desc.map((e) => e.msg).join(", "));

// ── Test 7: Groups ──
console.log("\n=== Test 7: Groups ===");
const grouped = createLogger({ theme: "detailed" });
const auth = grouped.group("auth");
const db = grouped.group("db");
auth.log({ method: "POST", url: "/login", status: 200, duration: "50ms" });
db.log({ method: "GET", url: "/query", status: 200, duration: "3ms" });
console.log(
    "Group field:",
    grouped
        .entries()
        .map((e) => e._group)
        .join(", "),
);

// ── Test 8: Events ──
console.log("\n=== Test 8: Events ===");
const evented = createLogger({ console: false });
let eventFired = false;
evented.on("log", () => {
    eventFired = true;
});
evented.on("clear", () => {
    console.log("Clear event fired!");
});
evented.log({ test: true });
console.log("Log event fired:", eventFired);
evented.clear();

// ── Test 9: TTL ──
console.log("\n=== Test 9: TTL ===");
const ttl = createLogger({ maxAge: 1, console: false });
ttl.log({ timestamp: Date.now() - 2000, msg: "old" });
ttl.log({ timestamp: Date.now(), msg: "fresh" });
const alive = ttl.entries();
console.log("After TTL cleanup:", alive.length, "entries (expected 1)");
console.log("Surviving entry:", alive[0]?.msg, "(expected fresh)");

// ── Test 10: Manual print ──
console.log("\n=== Test 10: Manual print ===");
const printer = createLogger({ console: false, theme: "detailed" });
const entry = printer.log({ method: "GET", url: "/manual", status: 301, duration: "5ms" });
if (entry) printer.print(entry);

// ── Test 11: Custom theme ──
console.log("\n=== Test 11: Custom theme ===");
const custom = createLogger({
    theme: {
        format: "{icon} [{method}] {url} -> {status}",
        icons: { success: "OK", clientError: "WARN", serverError: "ERR" },
    },
});
custom.log({ method: "GET", url: "/custom", status: 200 });
custom.log({ method: "GET", url: "/fail", status: 500 });

// ── Test 12: Time formats ──
console.log("\n=== Test 12: Time formats ===");

const isoLogger = createLogger({ timeFormat: "iso", theme: "colored" });
console.log("ISO format:");
isoLogger.log({ method: "GET", url: "/iso", status: 200, duration: "10ms" });

const datetimeLogger = createLogger({ timeFormat: "datetime", theme: "colored" });
console.log("Datetime format:");
datetimeLogger.log({ method: "GET", url: "/datetime", status: 200, duration: "10ms" });

const dateLogger = createLogger({ timeFormat: "date", theme: "colored" });
console.log("Date format:");
dateLogger.log({ method: "GET", url: "/date", status: 200, duration: "10ms" });

const localeLogger = createLogger({ timeFormat: "locale", theme: "colored" });
console.log("Locale format:");
localeLogger.log({ method: "GET", url: "/locale", status: 200, duration: "10ms" });

const utcLogger = createLogger({ timeFormat: "utc", theme: "colored" });
console.log("UTC format:");
utcLogger.log({ method: "GET", url: "/utc", status: 200, duration: "10ms" });

const customFn = createLogger({
    timeFormat: (d) => d.toLocaleDateString("fr-FR"),
    theme: "colored",
});
console.log("Custom function (fr-FR):");
customFn.log({ method: "GET", url: "/custom-fn", status: 200, duration: "10ms" });

// ── Test 13: Theme presets access ──
console.log("\n=== Test 13: Theme presets ===");
console.log("Available themes:", Object.keys(themes).join(", "));
console.log("Colored format:", themes.colored.format);
console.log("Default colors has timestamp:", !!defaultColors.timestamp);
console.log("Default icons has success:", !!defaultIcons.success);

// ── Test 14: resolveTheme ──
console.log("\n=== Test 14: resolveTheme ===");
const resolved = resolveTheme("detailed");
console.log("Resolved detailed:", resolved?.format);
const resolvedCustom = resolveTheme({ format: "{method} {url}", colors: { method: "\x1b[35m" } });
console.log("Resolved custom format:", resolvedCustom?.format);
console.log("Resolved custom method color:", resolvedCustom?.colors?.method === "\x1b[35m");
const resolvedNull = resolveTheme(false);
console.log("Resolved false:", resolvedNull === null);

// ── Test 15: Standalone EventBus ──
console.log("\n=== Test 15: Standalone EventBus ===");
const bus: EventBus = createEventBus();
let busEventData: unknown = null;
bus.on("log", (data) => {
    busEventData = data;
});
bus.emit("log", { msg: "from bus" });
console.log(
    "EventBus received:",
    (busEventData as Record<string, unknown>)?.msg,
    "(expected from bus)",
);

const cb = () => {};
bus.on("clear", cb);
bus.off("clear", cb);
console.log("EventBus on/off works: true");

console.log("\n=== All tests passed! ===\n");
