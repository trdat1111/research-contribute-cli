// scrape-dailydev.js
import puppeteer from "puppeteer";
import * as cheerio from "cheerio";

export async function fetchTopDailyDev() {
    const browser = await puppeteer.launch({
        headless: true,
        userDataDir: "./puppeteer-profile",
    });

    const page = await browser.newPage();
    await page.goto("https://app.daily.dev/", { waitUntil: "networkidle2" });

    for (let i = 0; i < 10; i++) {
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

    const top10 = posts.sort((a, b) => b.upvotes - a.upvotes).slice(0, 10);
    if (!top10.length) throw new Error("No posts found");
    return top10[Math.floor(Math.random() * top10.length)];
}
