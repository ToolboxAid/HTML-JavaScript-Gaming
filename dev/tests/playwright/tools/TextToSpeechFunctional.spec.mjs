import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { createMessagesPostgresClientStub } from "../../helpers/messagesPostgresClientStub.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";
import { SEED_DB_KEYS } from "../../../../api/seed/seed-db-keys.mjs";

test.use({ trace: "off" });

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

async function createPreviewTtsProfile(server, { name = "Creature Profile" } = {}) {
  const result = await jsonRequest(`${server.baseUrl}/api/messages/tts-profiles`, {
    body: JSON.stringify({
      emotionSettings: [{
        emotion: "urgent",
        emotionLabel: "Urgent",
        pitch: 1.2,
        rate: 1.1,
        volume: 0.8,
      }],
      language: "en-GB",
      name,
      pitch: 1,
      providerKey: "browser-speech",
      rate: 1,
      voiceName: "Narrator Voice",
      volume: 1,
    }),
    method: "POST",
  });
  expect(result.response.ok).toBe(true);
  expect(result.payload.ok).toBe(true);
  return result.payload.data.ttsProfile;
}

function recordRequestFailure(failures, request) {
  if (request.failure()?.errorText === "net::ERR_ABORTED") {
    return;
  }
  failures.failedRequests.push(`FAILED ${request.url()}`);
}

async function openTextToSpeechPage(page, { authenticated = true, speechAvailable = true } = {}) {
  const messagesPostgresClient = createMessagesPostgresClientStub();
  const server = await startRepoServer({ messagesPostgresClient });
  const failures = {
    consoleErrors: [],
    failedRequests: [],
    messagesPostgresClient,
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
  page.on("requestfailed", (request) => recordRequestFailure(failures, request));

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
    await expect(page.locator("[data-tts-status]")).toHaveText("TTS Profile save blocked: At least one Emotion is required.");
    await expect(page.locator("[data-tts-profile-row]").filter({ hasText: "Creature Profile" })).toHaveCount(0);
    await page.locator("[data-tts-cancel-profile='__new__']").click();

    await createPreviewTtsProfile(failures.server);
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-tts-profile-count]")).toHaveText("1");
    await expect(page.locator("[data-tts-emotion-count]")).toHaveText("1");
    await expect(page.locator("[data-tts-profile-table]")).toContainText("Creature Profile");
    await expect(page.locator("[data-tts-profile-row]").filter({ hasText: "Creature Profile" })).toContainText("Narrator Voice");
    await page.locator("[data-tts-profile-row]").filter({ hasText: "Creature Profile" }).locator("[data-tts-profile-name-cell]").click();
    await expect(page.locator("[data-tts-emotion-row]")).toHaveCount(1);
    await expect(page.getByLabel("TTS Profile Emotions").getByRole("columnheader")).toHaveText([
      "Emotion",
      "Pitch",
      "Rate",
      "Volume",
      "Usage",
      "Actions",
    ]);
    await page.locator("[data-tts-profile-row]").filter({ hasText: "Creature Profile" }).getByRole("button", { name: "Edit Profile" }).click();
    await expect(page.locator("[data-tts-profile-editor] [data-tts-profile-voice]")).toHaveValue("Narrator Voice");
    await page.locator("[data-tts-profile-editor] [data-tts-profile-name]").fill("Creature Profile Updated");
    await page.locator("[data-tts-profile-editor] [data-tts-commit-profile]").click();
    await expect(page.locator("[data-tts-status]")).toHaveText("Saved TTS profile: Creature Profile Updated.");
    await expect(page.locator("[data-tts-profile-row]").filter({ hasText: "Creature Profile Updated" })).toContainText("Narrator Voice");
    await expect(page.locator("[data-tts-emotion-row]").filter({ hasText: "Urgent" })).toContainText("1.2");
    await page.locator("[data-tts-emotion-row]").filter({ hasText: "Urgent" }).getByRole("button", { name: "Edit Emotion" }).click();
    await setRangeValue(page.locator("[data-tts-emotion-editor] [data-tts-emotion-volume]"), "0.7");
    await page.locator("[data-tts-emotion-editor] [data-tts-commit-emotion]").click();
    await expect(page.locator("[data-tts-status]")).toHaveText("Saved emotion: Urgent.");
    const urgentEmotionRow = page.locator("[data-tts-emotion-row]").filter({ hasText: "Urgent" });
    await expect(urgentEmotionRow).toContainText("0.7");
    await expect(urgentEmotionRow.getByRole("button", { name: "Play" })).toBeVisible();
    await page.locator("[data-tts-text-input]").fill("Launch the next wave.");
    await expect(page.locator("[data-tts-text-count]")).toHaveText("21");
    await urgentEmotionRow.getByRole("button", { name: "Edit Emotion" }).click();
    const emotionEditor = page.locator("[data-tts-emotion-editor]");
    await expect(emotionEditor.getByRole("button")).toHaveText(["Play", "Save", "Cancel"]);
    await setRangeValue(emotionEditor.locator("[data-tts-emotion-pitch]"), "1.4");
    await setRangeValue(emotionEditor.locator("[data-tts-emotion-rate]"), "0.9");
    await setRangeValue(emotionEditor.locator("[data-tts-emotion-volume]"), "0.6");
    await emotionEditor.getByRole("button", { name: "Play" }).click();
    await expect(page.locator("[data-tts-status]")).toContainText("Speech queued");
    let calls = await page.evaluate(() => window.__textToSpeechCalls);
    expect(calls.at(-1)).toEqual(expect.objectContaining({
      lang: "en-GB",
      pitch: 1.4,
      rate: 0.9,
      text: "Launch the next wave.",
      type: "speak",
      voiceName: "Narrator Voice",
      volume: 0.6,
    }));
    const profilesAfterEditorPreview = await jsonRequest(`${failures.server.baseUrl}/api/messages/tts-profiles`);
    expect(profilesAfterEditorPreview.response.ok).toBe(true);
    const apiProfileAfterEditorPreview = profilesAfterEditorPreview.payload.data.ttsProfiles
      .find((profile) => profile.name === "Creature Profile Updated");
    const apiUrgentAfterEditorPreview = apiProfileAfterEditorPreview.emotionSettings
      .find((setting) => setting.emotionLabel === "Urgent");
    expect(apiUrgentAfterEditorPreview).toEqual(expect.objectContaining({
      pitch: 1.2,
      rate: 1.1,
      volume: 0.7,
    }));
    await emotionEditor.getByRole("button", { name: "Cancel" }).click();
    await expect(urgentEmotionRow).toContainText("0.7");
    await expect(urgentEmotionRow).not.toContainText("0.6");

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

    await urgentEmotionRow.getByRole("button", { name: "Play" }).click();
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
    await page.waitForLoadState("networkidle");

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
  page.on("requestfailed", (request) => recordRequestFailure(failures, request));

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
