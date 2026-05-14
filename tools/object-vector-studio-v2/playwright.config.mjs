export default {
  testDir: "../../tests/playwright/tools",
  testMatch: "ObjectVectorStudioV2FirstClassToolStarter.spec.mjs",
  timeout: 30000,
  outputDir: "./tests/results",
  use: {
    headless: true,
    trace: "retain-on-failure"
  }
};
