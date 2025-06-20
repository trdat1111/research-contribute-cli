#!/usr/bin/env node

import fs from "fs/promises";
import { fetchTopDailyDev } from "./auto-dailydev.js";

async function runDebugTest() {
    try {
        const { picked, topArticles } = await fetchTopDailyDev();

        const output = {
            picked,
            topArticles,
            timestamp: new Date().toISOString(),
        };

        await fs.writeFile("output.json", JSON.stringify(output, null, 2));
        console.log("✅ Saved to output.json");
        console.table(topArticles.map(({ title, upvotes }) => ({ title, upvotes })));
        console.log("🎯 Picked:", picked);
    } catch (err) {
        console.error("❌ Error during test:", err.message);
    }
}

runDebugTest();
