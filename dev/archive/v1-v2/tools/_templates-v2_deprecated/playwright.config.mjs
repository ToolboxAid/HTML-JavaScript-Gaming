export default {
  testDir: "./tests/playwright",
  timeout: 30000,
  outputDir: "./tests/results",
  use: {
    headless: true,
    trace: "retain-on-failure"
  }
};

