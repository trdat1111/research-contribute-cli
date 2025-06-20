#!/usr/bin/env node

import { fetchTopDailyDev } from "./auto-dailydev.js";
import { triggerWorkflow } from "./trigger.js";
import cron from "node-cron";

// 🧪 One-time run at HH:mm (1 minutes from now)
const now = new Date();
now.setMinutes(now.getMinutes() + 1);
const targetMinute = now.getMinutes();
const targetHour = now.getHours();
const cronTime = `${targetMinute} ${targetHour} * * *`;

async function runOnce() {
    try {
        const article = await fetchTopDailyDev();
        console.log("[AUTO] Picked article:", article.picked);
        await triggerWorkflow([article.picked]);
    } catch (err) {
        console.error("[AUTO] Failed:", err.message);
    }
}

cron.schedule(cronTime, runOnce, {
    timezone: "Asia/Ho_Chi_Minh",
});

console.log(`🕒 Waiting to run at ${targetHour}:${String(targetMinute).padStart(2, "0")} today...`);
