#!/usr/bin/env node

import "dotenv/config";
import chalk from "chalk";
import enquirer from "enquirer";
const { Confirm } = enquirer;

const ghWorkflowUrl = process.env.GITHUB_API_URL;
const ghAccessToken = process.env.GITHUB_ACCESS_TOKEN;

const researchData = [];

if (!ghWorkflowUrl || !ghAccessToken) {
    console.error(chalk.red("Error: Missing environment variables GITHUB_API_URL or GITHUB_ACCESS_TOKEN"));
    process.exit(1);
}

console.log(chalk.blue("What research you have done today?\n"));

const confirmPrompt = new Confirm({
    name: "question",
    message: "One more research?",
});

const research = [
    {
        type: "input",
        name: "url",
        message: "URL",
        initial: "https://example.com/research",
    },
    {
        type: "input",
        name: "title",
        message: "Title of the research",
        initial: "Leetcode 2597 walkthrough",
    },
];

researchData.push(await enquirer.prompt(research));

confirmPrompt.run().then(async (answer) => {
    if (answer) researchData.push(await enquirer.prompt(research));
    triggerWorkflow(researchData);
});
