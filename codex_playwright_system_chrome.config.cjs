const base = require("./playwright.config.cjs");

module.exports = {
  ...base,
  use: {
    ...base.use,
    launchOptions: {
      ...(base.use?.launchOptions || {}),
      executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
    }
  }
};
