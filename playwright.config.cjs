module.exports = {
  timeout: 120000,
  outputDir: "tmp/test-results",
  projects: [
    {
      name: "ui",
      testDir: "tests/ui",
      outputDir: "tmp/test-results/artifacts"
    },
    {
      name: "playwright",
      testDir: "tests/playwright",
      outputDir: "tmp/test-results/artifacts"
    }
  ],
  reporter: [
    ["list"],
    ["html", { outputFolder: "tmp/test-results/report", open: "always" }],
    ["json", { outputFile: "tmp/test-results/playwright-results.json" }]
  ],
  use: {
    headless: false,
    launchOptions: {
      slowMo: 5
    },
    trace: "on"
  }
};
