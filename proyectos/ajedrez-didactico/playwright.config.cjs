const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.cjs",
  fullyParallel: false,
  workers: 1,
  reporter: "line",
  outputDir: "./test-results",
  use: {
    ...devices["Desktop Chrome"],
  },
});
