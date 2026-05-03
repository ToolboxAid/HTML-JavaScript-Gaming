module.exports = {
  outputDir: "tests/results",
  projects: [
    {
      name: "ui",
      testDir: "tests/ui",
      outputDir: "tests/results/artifacts"
    }
  ],
  reporter: [
    ["list"],
    ["html", { outputFolder: "tests/results/report", open: "always" }]
  ],
  use: {
    headless: false,
    launchOptions: {
      slowMo: 500
    },
    trace: "on"
  }
};
