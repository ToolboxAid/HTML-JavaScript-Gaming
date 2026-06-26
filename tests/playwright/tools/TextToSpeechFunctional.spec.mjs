import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";
import { SEED_DB_KEYS } from "../../../src/dev-runtime/seed/seed-db-keys.mjs";

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

async function jsonRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  const payload = await response.json().catch(() => null);
  return { payload, response };
}

async function openTextToSpeechPage(page, { authenticated = true, speechAvailable = true } = {}) {
  const server = await startRepoServer();
  const failures = {
    consoleErrors: [],
    failedRequests: [],
    pageErrors: [],
    server,
  };

  page.on("pageerror", (error) => failures.pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") failures.consoleErrors.push(message.text());
  });
  page.on("response", (response) => {
    if (response.status() >= 400) failures.failedRequests.push(`${response.status()} ${response.url()}`);
  });
  page.on("requestfailed", (request) => failures.failedRequests.push(`FAILED ${request.url()}`));

  if (authenticated) {
    const session = await jsonRequest(`${server.baseUrl}/api/session/user`, {
      body: JSON.stringify({ userKey: SEED_DB_KEYS.users.user1 }),
      method: "POST",
    });
    if (!session.payload?.ok) {
      throw new Error("Unable to authenticate Text To Speech Playwright session.");
    }
  }

  await page.addInitScript(({ apiUrl, siteUrl, speechAvailable: enabled }) => {
    Object.defineProperty(Navigator.prototype, "webdriver", {
      configurable: true,
      get: () => true,
    });
    window.GameFoundryPublicConfig = {
      apiUrl,
      environmentLabel: "Development Environment",
      siteUrl,
    };
    window.__textToSpeechCalls = [];
    if (!enabled) {
      Object.defineProperty(window, "SpeechSynthesisUtterance", { configurable: true, value: undefined });
      Object.defineProperty(window, "speechSynthesis", { configurable: true, value: undefined });
      return;
    }

    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      configurable: true,
      value: class SpeechSynthesisUtterance {
        constructor(text = "") {
          this.text = text;
        }
      },
    });

    const voices = [
      { lang: "en-US", name: "Arcade Voice", voiceURI: "arcade-voice-uri" },
      { lang: "en-GB", name: "Narrator Voice", voiceURI: "narrator-voice-uri" },
    ];
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        addEventListener(type, callback) {
          if (type === "voiceschanged") this.__voicesChanged = callback;
        },
        cancel() {
          window.__textToSpeechCalls.push({ type: "cancel" });
        },
        getVoices() {
          return voices;
        },
        pause() {
          window.__textToSpeechCalls.push({ type: "pause" });
        },
        removeEventListener() {},
        resume() {
          window.__textToSpeechCalls.push({ type: "resume" });
        },
        speak(utterance) {
          window.__textToSpeechCalls.push({
            lang: utterance.lang,
            pitch: utterance.pitch,
            rate: utterance.rate,
            text: utterance.text,
            type: "speak",
            voiceName: utterance.voice?.name || "",
            volume: utterance.volume,
          });
        },
      },
    });
  }, { apiUrl: `${server.baseUrl}/api`, siteUrl: server.baseUrl, speechAvailable });

  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}/toolbox/text-to-speech/index.html`, { waitUntil: "networkidle" });
  return failures;
}

async function closeTextToSpeechRun(failures, page) {
  await workspaceV2CoverageReporter.stop(page);
  await failures.server.close();
}

async function setRangeValue(locator, value) {
  await locator.evaluate((input, nextValue) => {
    input.value = nextValue;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, String(value));
}

test("Text To Speech page loads and speaks through browser speech synthesis", async ({ page }) => {
  const failures = await openTextToSpeechPage(page);
  try {
    await expect(page.getByRole("heading", { level: 1, name: "Text To Speech" })).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("[data-tts-summary]")).toHaveClass(/content-cluster--nowrap/);
    await expect(page.locator("[data-tts-summary]")).not.toContainText("TTS Studio");
    await expect(page.locator("[data-tts-output-summary]")).toHaveCount(0);
    await expect(page.locator("[data-tts-queue-list]")).toHaveCount(0);
    await expect(page.locator("[data-tts-item-name]")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Speech Composition" })).toBeVisible();
    await expect(page.getByLabel("Text To Speak")).toBeVisible();
    await expect(page.getByText("TTS Profile / Emotion Settings", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Emotion Settings", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Named Sentence", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Output Summary", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Voice Filters", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Delivery", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Presets", { exact: true })).toHaveCount(0);

    await expect(page.locator("[data-tts-voice-count]")).toHaveText("2");
    await expect(page.locator("[data-tts-profile-count]")).toHaveText("0");
    await expect(page.locator("[data-tts-emotion-count]")).toHaveText("0");
    await expect(page.locator("[data-tts-profile-table]")).toContainText("No TTS profiles yet.");
    await expect(page.locator("[data-tts-profile-table]")).not.toContainText("Default Balanced Profile");
    await expect(page.locator("[data-tts-profile-table]")).not.toContainText("Hero");
    await expect(page.locator("[data-tts-profile-table]")).not.toContainText("Merchant");
    await expect(page.locator("[data-tts-profile-table]")).not.toContainText("Neutral");
    await expect(page.locator("[data-tts-profile-table]")).not.toContainText("Robot");
    await expect(page.getByLabel("TTS Profiles").getByRole("columnheader")).toHaveText([
      "Profile",
      "Gender",
      "Voice",
      "Language",
      "Age Filter",
      "Emotion Count",
      "Usage",
      "Status",
      "Actions",
    ]);
    await expect(page.locator("[data-tts-emotion-host]")).toHaveCount(0);
    await expect(page.getByRole("columnheader", { name: "Delivery Preset" })).toHaveCount(0);
    await expect(page.locator("[data-tts-emotion-row]")).toHaveCount(0);

    await expect(page.locator("[data-tts-profile-add-control-row]").getByRole("button", { name: "Add Profile" })).toBeVisible();
    await page.locator("[data-tts-profile-add-control-row]").getByRole("button", { name: "Add Profile" }).click();
    await expect(page.locator("[data-tts-profile-editor='__new__']")).toBeVisible();
    await expect(page.locator("[data-tts-profile-editor='__new__']").locator("td").nth(5)).toHaveText("0");
    await page.locator("[data-tts-profile-editor='__new__'] [data-tts-profile-name]").fill("Creature Profile");
    await page.locator("[data-tts-profile-editor='__new__'] [data-tts-profile-gender]").selectOption("neutral");
    const newProfileVoiceSelect = page.locator("[data-tts-profile-editor='__new__'] [data-tts-profile-voice]");
    await expect(newProfileVoiceSelect).toContainText("Arcade Voice (en-US)");
    await expect(newProfileVoiceSelect).toContainText("Narrator Voice (en-GB)");
    await newProfileVoiceSelect.selectOption("narrator-voice-uri");
    await page.locator("[data-tts-commit-profile='__new__']").click();
    await expect(page.locator("[data-tts-status]")).toHaveText("Saved TTS profile: Creature Profile.");
    await expect(page.locator("[data-tts-profile-table]")).toContainText("Creature Profile");
    await expect(page.locator("[data-tts-profile-row]").filter({ hasText: "Creature Profile" })).toContainText("Narrator Voice");
    await expect(page.locator("[data-tts-emotion-row]")).toHaveCount(0);
    await expect(page.getByLabel("TTS Profile Emotions").getByRole("columnheader")).toHaveText([
      "Emotion",
      "Pitch",
      "Rate",
      "Volume",
      "Usage",
      "Actions",
    ]);
    await page.locator("[data-tts-profile-row]").filter({ hasText: "Creature Profile" }).getByRole("button", { name: "Edit Profile" }).click();
    await expect(page.locator("[data-tts-profile-editor] [data-tts-profile-voice]")).toHaveValue("narrator-voice-uri");
    await page.locator("[data-tts-profile-editor] [data-tts-profile-name]").fill("Creature Profile Updated");
    await page.locator("[data-tts-profile-editor] [data-tts-commit-profile]").click();
    await expect(page.locator("[data-tts-status]")).toHaveText("Saved TTS profile: Creature Profile Updated.");
    await expect(page.locator("[data-tts-profile-row]").filter({ hasText: "Creature Profile Updated" })).toContainText("Narrator Voice");
    await expect(page.locator("[data-tts-emotion-add-control-row]").getByRole("button", { name: "Add Emotion" })).toBeVisible();
    await page.locator("[data-tts-emotion-add-control-row]").getByRole("button", { name: "Add Emotion" }).click();
    await expect(page.locator("[data-tts-emotion-add-control-row]")).toHaveCount(0);
    await page.locator("[data-tts-emotion-editor='__new__'] [data-tts-emotion-name]").selectOption("urgent");
    await expect(page.locator("[data-tts-emotion-editor='__new__'] [data-tts-emotion-pitch]")).toHaveAttribute("type", "range");
    await expect(page.locator("[data-tts-emotion-editor='__new__'] [data-tts-emotion-rate]")).toHaveAttribute("type", "range");
    await expect(page.locator("[data-tts-emotion-editor='__new__'] [data-tts-emotion-volume]")).toHaveAttribute("type", "range");
    await setRangeValue(page.locator("[data-tts-emotion-editor='__new__'] [data-tts-emotion-pitch]"), "1.2");
    await setRangeValue(page.locator("[data-tts-emotion-editor='__new__'] [data-tts-emotion-rate]"), "1.1");
    await setRangeValue(page.locator("[data-tts-emotion-editor='__new__'] [data-tts-emotion-volume]"), "0.8");
    await page.locator("[data-tts-commit-emotion='__new__']").click();
    await expect(page.locator("[data-tts-status]")).toHaveText("Saved emotion: Urgent.");
    await expect(page.locator("[data-tts-emotion-row]").filter({ hasText: "Urgent" })).toContainText("1.2");
    await page.locator("[data-tts-emotion-row]").filter({ hasText: "Urgent" }).getByRole("button", { name: "Edit Emotion" }).click();
    await setRangeValue(page.locator("[data-tts-emotion-editor] [data-tts-emotion-volume]"), "0.7");
    await page.locator("[data-tts-emotion-editor] [data-tts-commit-emotion]").click();
    await expect(page.locator("[data-tts-status]")).toHaveText("Saved emotion: Urgent.");
    const urgentEmotionRow = page.locator("[data-tts-emotion-row]").filter({ hasText: "Urgent" });
    await expect(urgentEmotionRow).toContainText("0.7");
    await expect(urgentEmotionRow.getByRole("button", { name: "Play" })).toBeVisible();

    await expect(page.locator("[data-tts-gender-select]")).toHaveCount(0);
    await expect(page.locator("[data-tts-language-select]")).toHaveCount(0);
    await expect(page.locator("[data-tts-age-select]")).toHaveCount(0);
    await expect(page.locator("[data-tts-character-preset-select]")).toHaveCount(0);
    await expect(page.locator("[data-tts-ssml-preset-select]")).toHaveCount(0);
    await expect(page.locator("[data-tts-import-json]")).toHaveCount(0);
    await expect(page.locator("[data-tts-copy-json]")).toHaveCount(0);
    await expect(page.locator("[data-tts-export-json]")).toHaveCount(0);
    await page.locator("[data-tts-profile-row]").filter({ hasText: "Creature Profile Updated" }).getByRole("button", { name: "Edit Profile" }).click();
    await expect(page.locator("[data-tts-profile-editor] [data-tts-profile-voice]")).toBeVisible();
    await expect(page.locator("[data-tts-profile-editor] [data-tts-profile-language]")).toBeVisible();
    await expect(page.locator("[data-tts-profile-editor] [data-tts-profile-gender]")).toBeVisible();
    await expect(page.locator("[data-tts-profile-editor] [data-tts-profile-age]")).toBeVisible();
    await page.locator("[data-tts-profile-editor] [data-tts-cancel-profile]").click();

    await page.locator("[data-tts-text-input]").fill("Launch the next wave.");
    await expect(page.locator("[data-tts-text-count]")).toHaveText("21");

    await urgentEmotionRow.getByRole("button", { name: "Play" }).click();
    await expect(page.locator("[data-tts-status]")).toContainText("Speech queued");
    let calls = await page.evaluate(() => window.__textToSpeechCalls);
    expect(calls.at(-1)).toEqual(expect.objectContaining({
      lang: "en-GB",
      pitch: 1.2,
      rate: 1.1,
      text: "Launch the next wave.",
      type: "speak",
      voiceName: "Narrator Voice",
      volume: 0.7,
    }));

    await expect(page.locator("[data-tts-speak]")).toBeEnabled();
    await page.locator("[data-tts-speak]").click();
    await expect(page.locator("[data-tts-status]")).toContainText("Speech queued");
    calls = await page.evaluate(() => window.__textToSpeechCalls);
    expect(calls.at(-1)).toEqual(expect.objectContaining({
      lang: "en-GB",
      pitch: 1.2,
      rate: 1.1,
      text: "Launch the next wave.",
      type: "speak",
      voiceName: "Narrator Voice",
      volume: 0.7,
    }));

    await page.locator("[data-tts-pause]").click();
    await page.locator("[data-tts-resume]").click();
    await page.locator("[data-tts-stop]").click();
    await expect(page.locator("[data-tts-status]")).toContainText("Speech stopped");
    calls = await page.evaluate(() => window.__textToSpeechCalls);
    expect(calls.at(-1)).toEqual({ type: "cancel" });
    expect(calls).toEqual(expect.arrayContaining([{ type: "pause" }, { type: "resume" }]));

    expect(failures.failedRequests).toEqual([]);
    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors).toEqual([]);
  } finally {
    await closeTextToSpeechRun(failures, page);
  }
});

test("Text To Speech guest profile save redirects to sign in", async ({ page }) => {
  const failures = await openTextToSpeechPage(page, { authenticated: false });
  try {
    await expect(page.getByRole("heading", { level: 1, name: "Text To Speech" })).toBeVisible();
    await expect(page.locator("[data-tts-profile-count]")).toHaveText("0");
    await page.locator("[data-tts-profile-add-control-row]").getByRole("button", { name: "Add Profile" }).click();
    await page.locator("[data-tts-profile-editor='__new__'] [data-tts-profile-name]").fill("Guest Save Profile");
    await page.locator("[data-tts-commit-profile='__new__']").click();
    await page.waitForURL(/\/account\/sign-in\.html$/);

    expect(failures.failedRequests).toEqual([]);
    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors).toEqual([]);
  } finally {
    await closeTextToSpeechRun(failures, page);
  }
});

test("Text To Speech is registered on the toolbox index with the active toolbox path", async ({ page }) => {
  const server = await startRepoServer();
  const failures = {
    consoleErrors: [],
    failedRequests: [],
    pageErrors: [],
    server,
  };

  page.on("pageerror", (error) => failures.pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") failures.consoleErrors.push(message.text());
  });
  page.on("response", (response) => {
    if (response.status() >= 400) failures.failedRequests.push(`${response.status()} ${response.url()}`);
  });
  page.on("requestfailed", (request) => failures.failedRequests.push(`FAILED ${request.url()}`));

  await page.addInitScript(({ apiUrl, siteUrl }) => {
    window.GameFoundryPublicConfig = {
      apiUrl,
      environmentLabel: "Development Environment",
      siteUrl,
    };
  }, { apiUrl: `${server.baseUrl}/api`, siteUrl: server.baseUrl });

  try {
    await workspaceV2CoverageReporter.start(page);
    await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
    const textToSpeechLink = page.locator("[data-toolbox-tool-name-link='Text To Speech']");
    await expect(textToSpeechLink).toBeVisible();
    await expect(textToSpeechLink).toHaveAttribute("href", "/toolbox/text-to-speech/index.html");
    await expect(textToSpeechLink).toHaveAttribute("data-registered-tool-route", "toolbox/text-to-speech/index.html");
    await expect(page.locator("a[href*='tools/text2speech']")).toHaveCount(0);
    await textToSpeechLink.click();
    await page.waitForURL(/\/toolbox\/text-to-speech\/index\.html$/);
    await expect(page.getByRole("heading", { level: 1, name: "Text To Speech" })).toBeVisible();

    expect(failures.failedRequests).toEqual([]);
    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});

test("Text To Speech shows actionable error when browser speech synthesis is unavailable", async ({ page }) => {
  const failures = await openTextToSpeechPage(page, { speechAvailable: false });
  try {
    await expect(page.getByRole("heading", { level: 1, name: "Text To Speech" })).toBeVisible();
    await expect(page.locator("[data-tts-profile-count]")).toHaveText("0");
    await expect(page.locator("[data-tts-emotion-count]")).toHaveText("0");
    await expect(page.locator("[data-tts-engine-status]")).toContainText("SpeechSynthesis is unavailable");
    await expect(page.locator("[data-tts-status]")).toContainText("Use a browser with Web Speech API support");
    await expect(page.locator("[data-tts-voice-select]")).toHaveCount(0);
    await expect(page.locator("[data-tts-speak]")).toBeDisabled();
    await expect(page.locator("[data-tts-stop]")).toBeDisabled();
    await expect(page.locator("[data-tts-profile-table]")).not.toContainText("Default Balanced Profile");
    await expect(page.locator("[data-tts-profile-table]")).not.toContainText("Neutral");
    await expect(page.locator("[data-tts-profile-table]")).not.toContainText("Robot");
    await expect(page.locator("[data-tts-emotion-row]")).toHaveCount(0);
    await expect(page.locator("[data-tts-status]")).toContainText("Use a browser with Web Speech API support.");
    await expect(page.locator("[data-tts-status]")).not.toContainText("TypeError");
    await expect(page.locator("[data-tts-status]")).not.toContainText("undefined");

    expect(failures.failedRequests).toEqual([]);
    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors).toEqual([]);
  } finally {
    await closeTextToSpeechRun(failures, page);
  }
});
