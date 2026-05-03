module.exports = {
  testDir: "tests/ui",
  outputDir: "tests/results/artifacts",
  reporter: [
    ["list"],
    ["html", { outputFolder: "tests/results/report", open: "never" }]
  ],
  use: {
    headless: false,
    launchOptions: {
      slowMo: 500
    },
    trace: "on"
  }
};
