#!/usr/bin/env node

import { fetchTopDailyDev } from "./auto-dailydev.js";
import { triggerWorkflow } from "./trigger.js";
import cron from "node-cron";

async function runOnce(label) {
    try {
        const article = await fetchTopDailyDev();
        console.log(`[AUTO ${label}] Picked article:`, article.picked);
        await triggerWorkflow([article.picked]);
    } catch (err) {
        console.error(`[AUTO ${label}] Failed:`, err.message);
    }
}

// 🎯 Always run at 1PM
cron.schedule("0 13 * * *", () => runOnce("1PM"), {
    timezone: "Asia/Ho_Chi_Minh",
});

// 🎯 50% chance to run at 5PM
cron.schedule(
    "0 17 * * *",
    () => {
        if (Math.random() < 0.5) runOnce("5PM");
    },
    { timezone: "Asia/Ho_Chi_Minh" }
);

// 🎯 30% chance to run at 5:30PM
cron.schedule(
    "30 17 * * *",
    () => {
        if (Math.random() < 0.3) runOnce("5:30PM");
    },
    { timezone: "Asia/Ho_Chi_Minh" }
);

console.log("🕒 Auto daily.dev trigger scheduled at 13:00, optional at 17:00 & 17:30");
