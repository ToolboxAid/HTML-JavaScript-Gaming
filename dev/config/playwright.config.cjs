const path = require("node:path");

const repoRoot = path.resolve(__dirname, "../..");
const repoPath = (...segments) => path.join(repoRoot, ...segments);

module.exports = {
  timeout: 120000,
  outputDir: repoPath("dev", "workspace", "artifacts", "tmp", "test-results"),
  projects: [
    {
      name: "ui",
      testDir: repoPath("dev", "tests", "ui"),
      outputDir: repoPath("dev", "workspace", "artifacts", "tmp", "test-results", "artifacts")
    },
    {
      name: "playwright",
      testDir: repoPath("dev", "tests", "playwright"),
      outputDir: repoPath("dev", "workspace", "artifacts", "tmp", "test-results", "artifacts")
    }
  ],
  reporter: [
    ["list"],
    ["html", { outputFolder: repoPath("dev", "workspace", "artifacts", "tmp", "test-results", "report"), open: "always" }],
    ["json", { outputFile: repoPath("dev", "workspace", "artifacts", "tmp", "test-results", "playwright-results.json") }]
  ],
  use: {
    headless: false,
    launchOptions: {
      slowMo: 5
    },
    trace: "on"
  }
};
