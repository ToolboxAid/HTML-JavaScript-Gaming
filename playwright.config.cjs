module.exports = {
  timeout: 120000,
  outputDir: "tests/results",
  projects: [
    {
      name: "ui",
      testDir: "tests/ui",
      outputDir: "tests/results/artifacts"
    },
    {
      name: "playwright",
      testDir: "tests/playwright",
      outputDir: "tests/results/artifacts"
    }
  ],
  reporter: [
    ["list"],
    ["html", { outputFolder: "tests/results/report", open: "always" }],
    ["json", { outputFile: "tests/results/playwright-results.json" }]
  ],
  use: {
    headless: false,
    launchOptions: {
      slowMo: 50
    },
    trace: "on"
  }
};
