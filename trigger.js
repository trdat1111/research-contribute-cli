import ora from "ora";
import chalk from "chalk";
import "dotenv/config";

const ghWorkflowUrl = process.env.GITHUB_API_URL;
const ghAccessToken = process.env.GITHUB_ACCESS_TOKEN;

export async function triggerWorkflow(bodyData) {
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

        spinner.succeed(chalk.greenBright("Workflow dispatched successfully!"));
    } catch (error) {
        spinner.fail("Error dispatching workflow");
        console.error(error);
    }
}
