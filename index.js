#!/usr/bin/env node

import "dotenv/config";
import chalk from "chalk";
import enquirer from "enquirer";
import ora from "ora";
const { Confirm } = enquirer;

const ghWorkflowUrl = process.env.GITHUB_API_URL;
const ghAccessToken = process.env.GITHUB_ACCESS_TOKEN;

const researchData = [];

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

async function triggerWorkflow(bodyData) {
    const spinner = ora("Dispatching workflow...").start();

    try {
        const response = await fetch(ghWorkflowUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${ghAccessToken}`,
                Accept: "application/vnd.github.v3+json",
            },
            body: JSON.stringify({
                ref: "main",
                inputs: {
                    data: JSON.stringify(bodyData),
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}\n${response}`);
        }

        spinner.succeed(chalk.green("Workflow dispatched successfully!"));
    } catch (error) {
        spinner.fail("Error dispatching workflow");
        console.error(error);
    }
}
