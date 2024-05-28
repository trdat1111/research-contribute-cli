#!/usr/bin/env node

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
});

async function triggerWorkflow(bodyData) {
    try {
        const response = await fetch(ghWorkflowUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${ghAccessToken}`,
                "Content-Type": "application/json",
                Accept: "application/vnd.github.v3+json",
            },
            body: JSON.stringify({
                ref: "main",
                inputs: {
                    data: bodyData,
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Workflow dispatched successfully:", data);
    } catch (error) {
        console.error("Error dispatching workflow:", error);
    }
}
