import puppeteer from "puppeteer";
import * as cheerio from "cheerio";

const DAILY_URL = "https://app.daily.dev/";
const SCROLL_COUNT = 5;
const PICK_COUNT = 5;
const PROFILE_DIR = "./puppeteer-profile";

export async function fetchTopDailyDev() {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        // slowMo: 100,
        userDataDir: PROFILE_DIR,
    });

    const page = await browser.newPage();
    await page.goto(DAILY_URL, { waitUntil: "networkidle2" });

    await page.waitForSelector("article");

    for (let i = 0; i < SCROLL_COUNT; i++) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);
    const posts = [];

    $("article").each((_, el) => {
        const title = $(el).find("h3").text().trim();
        const url = $(el).find("a[target='_blank']").attr("href");
        const upvoteText = $(el).find("button[aria-label='Upvote'] span.tabular-nums").first().text().trim();
        const upvotes = parseInt(upvoteText.replace(/[^\d]/g, "")) || 0;

        if (title && url?.includes("https://api.daily.dev/r/")) {
            posts.push({ title, url, upvotes });
        }
    });

    const top = posts.sort((a, b) => b.upvotes - a.upvotes).slice(0, PICK_COUNT);
    if (!top.length) throw new Error("No posts found");

    const pick = top[Math.floor(Math.random() * top.length)];

    return {
        picked: {
            title: pick.title,
            url: pick.url,
        },
        topArticles: top,
    };
}
