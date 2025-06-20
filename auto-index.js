#!/usr/bin/env node

import { fetchTopDailyDev } from "./test-dailydev.js";
import { triggerWorkflow } from "./trigger.js";
import cron from "node-cron";

async function runOnce() {
    try {
        const article = await fetchTopDailyDev();
        console.log("[AUTO] Picked article:", article);
        await triggerWorkflow([article]);
    } catch (err) {
        console.error("[AUTO] Failed:", err.message);
    }
}

// 🧪 One-time run at 16:50 (Asia/Ho_Chi_Minh)
cron.schedule("45 10 * * *", runOnce, {
    timezone: "Asia/Ho_Chi_Minh",
});

console.log("🕒 Waiting to run at 16:50 today...");
