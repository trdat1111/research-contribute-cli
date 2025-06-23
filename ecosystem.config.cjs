module.exports = {
    apps: [
        {
            name: "research-cron",
            script: "./auto-index.js",
            env: {
                TZ: "Asia/Ho_Chi_Minh",
            },
        },
    ],
};
