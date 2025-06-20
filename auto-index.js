#!/usr/bin/env node

import { fetchTopDailyDev } from "./auto-dailydev.js";
import { triggerWorkflow } from "./trigger.js";
import cron from "node-cron";
import fs from "fs/promises";
import path from "path";

const LOG_DIR = "./logs";
const MAX_RETRIES = 2;

function getTimestamp() {
    return new Date().toISOString();
}

function getTodayLogPath() {
    const date = new Date().toISOString().split("T")[0];
    return path.join(LOG_DIR, `${date}.log`);
}

async function log(message) {
    const line = `[${getTimestamp()}] ${message}\n`;
    await fs.mkdir(LOG_DIR, { recursive: true });
    await fs.appendFile(getTodayLogPath(), line);
    console.log(line.trim());
}

async function runOnce(label, retry = 0) {
    try {
        const article = await fetchTopDailyDev();
        await log(`[${label}] ✅ Picked: ${article.picked.title} — ${article.picked.url}`);
        await triggerWorkflow([article.picked]);
        await log(`[${label}] ✅ Workflow triggered`);
    } catch (err) {
        await log(`[${label}] ❌ Error: ${err.message}`);

        if (retry < MAX_RETRIES) {
            const delay = 3000 * (retry + 1);
            await log(`[${label}] 🔁 Retrying in ${delay / 1000}s...`);
            await new Promise((res) => setTimeout(res, delay));
            await runOnce(label, retry + 1);
        } else {
            await log(`[${label}] ❌ Failed after ${MAX_RETRIES + 1} attempts`);
        }
    }
}

// 🔁 Schedules

cron.schedule("0 13 * * *", () => runOnce("1PM"), {
    timezone: "Asia/Ho_Chi_Minh",
});

cron.schedule(
    "0 17 * * *",
    () => {
        if (Math.random() < 0.5) runOnce("5PM");
    },
    { timezone: "Asia/Ho_Chi_Minh" }
);

cron.schedule(
    "30 17 * * *",
    () => {
        if (Math.random() < 0.3) runOnce("5:30PM");
    },
    { timezone: "Asia/Ho_Chi_Minh" }
);

console.log("🕒 Scheduled: 13:00 (always), 17:00 (50%), 17:30 (30%)");
