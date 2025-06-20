#!/usr/bin/env node

import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import fs from "fs/promises";

const DAILY_URL = "https://app.daily.dev/";
const SCROLL_COUNT = 10;
const PICK_COUNT = 5;
const PROFILE_DIR = "./puppeteer-profile";

export async function fetchTopDailyDev() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        slowMo: 100,
        userDataDir: PROFILE_DIR,
    });

    const page = await browser.newPage();
    await page.goto(DAILY_URL, { waitUntil: "networkidle2" });

    for (let i = 0; i < SCROLL_COUNT; i++) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);
    const posts = [];

    $("article.Card_post__S2J45").each((_, el) => {
        const title = $(el).find("h3.Card_title__a1B_X").text().trim();
        const url = $(el).find("a[target='_blank']").attr("href");

        const upvoteText = $(el).find("button[aria-label='Upvote'] span.tabular-nums").first().text().trim();
        const upvotes = parseInt(upvoteText.replace(/[^\d]/g, "")) || 0;

        if (title && url && url.includes("https://api.daily.dev/r/")) {
            posts.push({ title, url, upvotes });
        }
    });

    const top10 = posts.sort((a, b) => b.upvotes - a.upvotes).slice(0, PICK_COUNT);

    const randomPick = top10[Math.floor(Math.random() * top10.length)];

    const output = {
        topArticles: top10,
        picked: randomPick,
        timestamp: new Date().toISOString(),
    };

    await fs.writeFile("output.json", JSON.stringify(output, null, 2));
    console.log("✅ Saved top 10 articles to output.json (sorted by upvotes)");
    console.table(top10.map(({ title, upvotes }) => ({ title, upvotes })));
    console.log("🎯 Random Pick:", randomPick);
}

fetchTopDailyDev();
