#!/usr/bin/env node

import "dotenv/config";
import chalk from "chalk";
import enquirer from "enquirer";
const { Confirm } = enquirer;

const ghWorkflowUrl = process.env.GITHUB_API_URL;
const ghAccessToken = process.env.GITHUB_ACCESS_TOKEN;

const researchData = [];

console.log(chalk.blue("What research you have done today?"));

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
    console.log(researchData);
    triggerWorkflow(researchData);
});

async function triggerWorkflow(bodyData) {
    try {
        const response = await fetch(ghWorkflowUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${ghAccessToken}`,
                Accept: "application/vnd.github.v3+json",
                Accept: "*/*",
            },
            body: JSON.stringify({
                ref: "main",
                inputs: {
                    data: JSON.stringify(bodyData),
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log(chalk.green("Workflow dispatched successfully!"));
    } catch (error) {
        console.error("Error dispatching workflow:", error);
    }
}
