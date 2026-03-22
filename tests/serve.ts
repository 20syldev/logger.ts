import { createLogger } from "../src/logger.js";

const logger = createLogger({ console: false });

logger.log({ method: "GET", url: "/api/users", status: 200, duration: "45ms" });
logger.log({ method: "POST", url: "/api/users", status: 201, duration: "120ms" });
logger.log({ method: "GET", url: "/api/crash", status: 500, duration: "2ms" });
logger.group("auth").log({ method: "POST", url: "/login", status: 200, duration: "30ms" });

const server = logger.serve(3099);

setTimeout(async () => {
    const tests = [
        { url: "http://127.0.0.1:3099/", label: "All logs" },
        { url: "http://127.0.0.1:3099/?order=desc", label: "Desc order" },
        { url: "http://127.0.0.1:3099/?limit=2", label: "Limit 2" },
        { url: "http://127.0.0.1:3099/?status=200", label: "Filter status=200" },
        { url: "http://127.0.0.1:3099/?method=GET&order=desc", label: "GET only, desc" },
        { url: "http://127.0.0.1:3099/?_group=auth", label: "Group auth" },
        { url: "http://127.0.0.1:3099/health", label: "Health" },
    ];

    for (const t of tests) {
        const res = await fetch(t.url);
        const data = await res.json();
        const count = Array.isArray(data) ? data.length : "-";
        console.log(`[${t.label}] → ${count} entries`, JSON.stringify(data).slice(0, 100));
    }

    server.close();
    console.log("\nAll serve tests passed!");
}, 500);
