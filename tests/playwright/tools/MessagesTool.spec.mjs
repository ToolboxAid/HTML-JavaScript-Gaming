import fs from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const ULID_PATTERN = /^[0-9A-HJKMNP-TV-Z]{26}$/;
let messagesRunId = 0;

function messagesDbPath() {
  messagesRunId += 1;
  return path.join(process.cwd(), "tmp", `messages-tool-${process.pid}-${messagesRunId}.sqlite`);
}

async function jsonRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  const payload = await response.json().catch(() => null);
  return {
    payload,
    response,
  };
}

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "messages-tool",
    surface: "Message Studio Local API, legacy SQLite technical debt adapter, and Theme V2 tool",
  });
});

test.afterEach(async ({ page }) => {
  await clearPlaywrightStorage(page);
});

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

async function openMessagesPage(page, sqlitePath, options = {}) {
  const previousMessagesSqlitePath = process.env.GAMEFOUNDRY_MESSAGES_SQLITE_PATH;
  process.env.GAMEFOUNDRY_MESSAGES_SQLITE_PATH = sqlitePath;
  const server = await startRepoServer();
  const failures = {
    consoleErrors: [],
    failedRequests: [],
    pageErrors: [],
    previousMessagesSqlitePath,
    server,
    sqlitePath,
  };

  page.on("pageerror", (error) => {
    failures.pageErrors.push(error.message);
  });
  page.on("console", (message) => {
    if (message.type() === "error") {
      failures.consoleErrors.push(message.text());
    }
  });
  page.on("response", (response) => {
    if (response.status() >= 400) {
      failures.failedRequests.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on("requestfailed", (request) => {
    failures.failedRequests.push(`FAILED ${request.url()}`);
  });

  await page.addInitScript(({ apiUrl, speechAvailable }) => {
    window.GameFoundryPublicConfig = {
      apiUrl,
      environmentLabel: "Development Environment",
      siteUrl: window.location.origin,
    };
    window.__messagesSpeechCalls = [];
    if (!speechAvailable) {
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
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        cancel() {
          window.__messagesSpeechCalls.push({ type: "cancel" });
        },
        getVoices() {
          return [{ lang: "en-US", name: "Test Voice", voiceURI: "test-voice-uri" }];
        },
        speak(utterance) {
          window.__messagesSpeechCalls.push({
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
  }, {
    apiUrl: `${server.baseUrl}/api`,
    speechAvailable: options.speechAvailable !== false,
  });
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}/tools/messages/index.html`, { waitUntil: "networkidle" });
  return failures;
}

async function closeMessagesRun(failures, page) {
  await workspaceV2CoverageReporter.stop(page);
  await failures.server.close();
  if (failures.previousMessagesSqlitePath === undefined) {
    delete process.env.GAMEFOUNDRY_MESSAGES_SQLITE_PATH;
  } else {
    process.env.GAMEFOUNDRY_MESSAGES_SQLITE_PATH = failures.previousMessagesSqlitePath;
  }
}

async function addEmotionProfile(page, name) {
  await page.locator("[data-messages-emotion-add-row]").click();
  await page.locator("[data-messages-emotion-editor='__new__'] [data-emotion-name]").fill(name);
  await page.locator("[data-messages-emotion-editor='__new__'] [data-emotion-volume]").fill("0.9");
  await page.locator("[data-messages-emotion-editor='__new__'] [data-emotion-pitch]").fill("0.85");
  await page.locator("[data-messages-emotion-editor='__new__'] [data-emotion-rate]").fill("0.95");
  await page.locator("[data-messages-emotion-commit='__new__']").click();
}

async function addTtsProfile(page, name) {
  await page.locator("[data-messages-tts-add-row]").click();
  await page.locator("[data-messages-tts-editor='__new__'] [data-tts-name]").fill(name);
  await page.locator("[data-messages-tts-editor='__new__'] [data-tts-provider]").fill("browser-speech");
  await page.locator("[data-messages-tts-editor='__new__'] [data-tts-voice]").fill("Test Voice");
  await page.locator("[data-messages-tts-editor='__new__'] [data-tts-language]").fill("en-US");
  await page.locator("[data-messages-tts-commit='__new__']").click();
}

async function addMessageRow(page, values) {
  await page.locator("[data-messages-add-row]").click();
  await page.locator("[data-messages-row-editor='__new__'] [data-message-name]").fill(values.name);
  await page.locator("[data-messages-row-editor='__new__'] [data-message-emotion]").selectOption({ label: values.emotion });
  await page.locator("[data-messages-row-editor-details='__new__'] [data-message-text]").fill(values.text);
  await page.locator("[data-messages-row-editor-details='__new__'] [data-message-notes]").fill(values.notes || "");
  await page.locator("[data-messages-commit='__new__']").click();
}

async function addSegmentRow(page, values) {
  await page.locator("[data-messages-segment-add-row]").click();
  await page.locator("[data-messages-segment-editor='__new__'] [data-segment-order]").fill(String(values.order));
  await page.locator("[data-messages-segment-editor='__new__'] [data-segment-emotion]").selectOption({ label: values.emotion });
  await page.locator("[data-messages-segment-editor='__new__'] [data-segment-text]").fill(values.text);
  await page.locator("[data-messages-segment-commit='__new__']").click();
}

test("Message Studio uses table governance, validates rows, and persists through the Local API", async ({ page }) => {
  const sqlitePath = messagesDbPath();
  await fs.rm(sqlitePath, { force: true });
  const failures = await openMessagesPage(page, sqlitePath);

  try {
    await expect(page.getByRole("heading", { level: 1, name: "Message Studio" })).toBeVisible();
    await expect(page.locator(".tool-workspace")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("[data-messages-category-name]")).toHaveCount(0);
    await expect(page.locator("[data-messages-category]")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /delete/i })).toHaveCount(0);
    await expect(page.locator("[data-messages-persistence-engine]")).toHaveText("Postgres target");
    await expect(page.locator("[data-messages-tts-service]")).toHaveValue("browser-speech-synthesis");
    await expect(page.locator("[data-messages-preview-status]")).toHaveText("Select a message row or segment row before testing speech.");
    await expect(page.locator("[data-messages-test-speech]")).toBeDisabled();
    await expect(page.locator("[data-messages-preview-message], [data-messages-preview-segments], [data-messages-preview-stop]")).toHaveCount(0);

    await expect(page.locator("[data-messages-emotions]")).toContainText("Calm");
    await expect(page.locator("[data-messages-emotions]")).toContainText("Urgent");
    await expect(page.locator("[data-messages-tts-profiles]")).toContainText("Browser Speech Default");

    await addEmotionProfile(page, "Robot");
    await expect(page.locator("[data-messages-log]")).toHaveText("Updated emotion profile Robot.");
    await expect(page.locator("[data-messages-emotion-row]").filter({ hasText: "Robot" })).toContainText("0.9");
    await page.locator("[data-messages-emotion-row]").filter({ hasText: "Robot" }).getByRole("button", { name: "Edit" }).click();
    await page.locator("[data-messages-emotion-editor] [data-emotion-rate]").fill("1.05");
    await page.locator("[data-messages-emotion-editor] [data-messages-emotion-commit]").click();
    await page.locator("[data-messages-emotion-row]").filter({ hasText: "Robot" }).getByRole("button", { name: "Disable" }).click();
    await expect(page.locator("[data-messages-emotion-row]").filter({ hasText: "Robot" })).toContainText("Inactive");

    await addTtsProfile(page, "Arcade Browser Voice");
    await expect(page.locator("[data-messages-log]")).toHaveText("Updated TTS profile Arcade Browser Voice.");
    await expect(page.locator("[data-messages-tts-profiles]")).toContainText("Arcade Browser Voice");
    await expect(page.locator("[data-messages-tts-count]")).toHaveText("3");
    await page.locator("[data-messages-tts-row]").filter({ hasText: "Arcade Browser Voice" }).getByRole("button", { name: "Edit" }).click();
    await page.locator("[data-messages-tts-editor] [data-tts-language]").fill("en-GB");
    await page.locator("[data-messages-tts-editor] [data-messages-tts-commit]").click();
    await expect(page.locator("[data-messages-tts-row]").filter({ hasText: "Arcade Browser Voice" })).toContainText("Active");

    const ttsProfilesResult = await jsonRequest(`${failures.server.baseUrl}/api/messages/tts-profiles`);
    expect(ttsProfilesResult.response.ok).toBe(true);
    expect(ttsProfilesResult.payload.ok).toBe(true);
    const createdTtsProfile = ttsProfilesResult.payload.data.ttsProfiles.find((profile) => profile.name === "Arcade Browser Voice");
    expect(createdTtsProfile).toEqual(expect.objectContaining({
      active: true,
      language: "en-GB",
      providerKey: "browser-speech",
      voiceName: "Test Voice",
    }));
    expect(createdTtsProfile.key).toMatch(ULID_PATTERN);
    expect(createdTtsProfile.createdBy).toMatch(ULID_PATTERN);
    expect(createdTtsProfile.updatedBy).toMatch(ULID_PATTERN);

    await page.locator("[data-messages-add-row]").click();
    await expect(page.locator("[data-messages-row-editor='__new__']")).toBeVisible();
    await page.locator("[data-messages-commit='__new__']").click();
    await expect(page.locator("[data-messages-validation-card]")).toBeVisible();
    await expect(page.locator("[data-messages-validation-errors]")).toContainText("Message Name is required.");
    await expect(page.locator("[data-messages-validation-errors]")).toContainText("Emotion Profile is required.");
    await expect(page.locator("[data-messages-validation-errors]")).toContainText("Message Text is required.");

    await page.locator("[data-messages-cancel='__new__']").click();
    await addMessageRow(page, {
      emotion: "Urgent",
      name: "Forest Warning",
      notes: "Opening forest danger line.",
      text: "The forest gets darker beyond this point.\nWe are being attacked by bats.",
    });
    await expect(page.locator("[data-messages-log]")).toHaveText("Updated row Forest Warning.");
    await expect(page.locator("[data-messages-count]")).toHaveText("1");
    await expect(page.locator("[data-messages-table]")).toContainText("Forest Warning");
    await expect(page.locator("[data-messages-selected-text]")).toHaveText("The forest gets darker beyond this point.\nWe are being attacked by bats.");
    await expect(page.locator("[data-messages-segment-host]")).toBeVisible();

    const listResult = await jsonRequest(`${failures.server.baseUrl}/api/messages/messages`);
    expect(listResult.response.ok).toBe(true);
    expect(listResult.payload.ok).toBe(true);
    const createdMessage = listResult.payload.data.messages.find((message) => message.name === "Forest Warning");
    expect(createdMessage).toEqual(expect.objectContaining({
      active: true,
      emotionProfileName: "Urgent",
      messageText: "The forest gets darker beyond this point.\nWe are being attacked by bats.",
      notes: "Opening forest danger line.",
    }));
    expect(createdMessage.key).toMatch(ULID_PATTERN);
    expect(createdMessage.createdBy).toMatch(ULID_PATTERN);
    expect(createdMessage.updatedBy).toMatch(ULID_PATTERN);

    await page.locator("[data-messages-segment-add-row]").click();
    await page.locator("[data-messages-segment-editor='__new__'] [data-segment-order]").fill("");
    await page.locator("[data-messages-segment-commit='__new__']").click();
    await expect(page.locator("[data-messages-validation-card]")).toBeVisible();
    await expect(page.locator("[data-messages-validation-errors]")).toContainText("Segment Text is required.");
    await expect(page.locator("[data-messages-validation-errors]")).toContainText("Emotion Profile is required.");
    await expect(page.locator("[data-messages-validation-errors]")).toContainText("Display Order is required.");
    await page.locator("[data-messages-segment-cancel='__new__']").click();

    await addSegmentRow(page, {
      emotion: "Calm",
      order: 1,
      text: "The forest gets darker beyond this point.",
    });
    await expect(page.locator("[data-messages-log]")).toHaveText("Updated segment row 1.");
    await addSegmentRow(page, {
      emotion: "Urgent",
      order: 2,
      text: "We are being attacked by bats.",
    });
    await expect(page.locator("[data-messages-log]")).toHaveText("Updated segment row 2.");
    await expect(page.locator("[data-messages-segment-row]")).toHaveCount(2);

    let speechCalls = await page.evaluate(() => window.__messagesSpeechCalls);
    expect(speechCalls).toEqual([]);

    await page.locator("[data-messages-preview-tts-profile]").selectOption({ label: "Arcade Browser Voice" });
    await page.locator("[data-messages-row]").filter({ hasText: "Forest Warning" }).click();
    await expect(page.locator("[data-messages-speech-test-target]")).toHaveText("Message Row: Forest Warning");
    await expect(page.locator("[data-messages-test-speech]")).toBeEnabled();
    await page.locator("[data-messages-test-speech]").click();
    await expect(page.locator("[data-messages-preview-status]")).toHaveText("Speech test started for Message Row: Forest Warning using Browser Speech Synthesis.");
    speechCalls = await page.evaluate(() => window.__messagesSpeechCalls);
    expect(speechCalls.at(-1)).toEqual(expect.objectContaining({
      lang: "en-GB",
      pitch: 1.08,
      rate: 1.15,
      text: "The forest gets darker beyond this point.\nWe are being attacked by bats.",
      type: "speak",
      voiceName: "Test Voice",
      volume: 1,
    }));

    await page.locator("[data-messages-segment-row]").filter({ hasText: "The forest gets darker beyond this point." }).click();
    await expect(page.locator("[data-messages-speech-test-target]")).toHaveText("Segment 1");
    await page.locator("[data-messages-test-speech]").click();
    await expect(page.locator("[data-messages-preview-status]")).toHaveText("Speech test started for Segment 1 using Browser Speech Synthesis.");
    speechCalls = await page.evaluate(() => window.__messagesSpeechCalls);
    expect(speechCalls.at(-1)).toEqual(expect.objectContaining({
      lang: "en-GB",
      pitch: 1,
      rate: 1,
      text: "The forest gets darker beyond this point.",
      type: "speak",
      voiceName: "Test Voice",
      volume: 1,
    }));

    const segmentsResult = await jsonRequest(`${failures.server.baseUrl}/api/messages/segments`);
    expect(segmentsResult.response.ok).toBe(true);
    expect(segmentsResult.payload.ok).toBe(true);
    const createdSegments = segmentsResult.payload.data.segments.filter((segment) => segment.messageKey === createdMessage.key);
    expect(createdSegments).toHaveLength(2);
    expect(createdSegments.map((segment) => segment.displayOrder)).toEqual([1, 2]);
    createdSegments.forEach((segment) => {
      expect(segment.key).toMatch(ULID_PATTERN);
      expect(segment.createdBy).toMatch(ULID_PATTERN);
      expect(segment.updatedBy).toMatch(ULID_PATTERN);
    });

    await page.locator("[data-messages-segment-row]").filter({ hasText: "We are being attacked by bats." }).getByRole("button", { name: "Move Up" }).click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Segment order updated.");
    await expect(page.locator("[data-messages-segment-row]").first()).toContainText("We are being attacked by bats.");

    await page.locator("[data-messages-segment-row]").filter({ hasText: "We are being attacked by bats." }).getByRole("button", { name: "Edit" }).click();
    await page.locator("[data-messages-segment-editor] [data-segment-text]").fill("We are being attacked by bats right now.");
    await page.locator("[data-messages-segment-editor] [data-messages-segment-commit]").click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Updated segment row 1.");
    await expect(page.locator("[data-messages-segment-row]").filter({ hasText: "We are being attacked by bats right now." })).toBeVisible();

    await page.locator("[data-messages-segment-row]").filter({ hasText: "We are being attacked by bats right now." }).getByRole("button", { name: "Disable" }).click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Disabled segment row 1.");
    await expect(page.locator("[data-messages-segment-row]").filter({ hasText: "We are being attacked by bats right now." })).toContainText("Inactive");

    const updatedSegmentsResult = await jsonRequest(`${failures.server.baseUrl}/api/messages/segments`);
    const disabledSegment = updatedSegmentsResult.payload.data.segments.find((segment) => segment.segmentText === "We are being attacked by bats right now.");
    expect(disabledSegment).toEqual(expect.objectContaining({
      active: false,
      displayOrder: 1,
      emotionProfileName: "Urgent",
      messageKey: createdMessage.key,
      messageName: "Forest Warning",
      segmentText: "We are being attacked by bats right now.",
    }));

    await page.locator("[data-messages-row]").filter({ hasText: "Forest Warning" }).getByRole("button", { name: "Edit" }).click();
    await page.locator("[data-messages-row-editor] [data-message-name]").fill("Forest Warning Updated");
    await page.locator("[data-messages-row-editor-details] [data-message-text]").fill("The forest gets darker beyond this point.");
    await page.locator("[data-messages-row-editor] [data-messages-commit]").click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Updated row Forest Warning Updated.");
    await expect(page.locator("[data-messages-table]")).toContainText("Forest Warning Updated");

    await page.locator("[data-messages-row]").filter({ hasText: "Forest Warning Updated" }).getByRole("button", { name: "Disable" }).click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Disabled row Forest Warning Updated.");
    await expect(page.locator("[data-messages-row]").filter({ hasText: "Forest Warning Updated" })).toContainText("Inactive");

    const updateResult = await jsonRequest(`${failures.server.baseUrl}/api/messages/messages/${createdMessage.key}`);
    expect(updateResult.payload.data.message).toEqual(expect.objectContaining({
      active: false,
      key: createdMessage.key,
      messageText: "The forest gets darker beyond this point.",
      name: "Forest Warning Updated",
    }));

    await page.locator("[data-messages-tts-row]").filter({ hasText: "Arcade Browser Voice" }).getByRole("button", { name: "Disable" }).click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Disabled TTS profile Arcade Browser Voice.");
    await expect(page.locator("[data-messages-tts-row]").filter({ hasText: "Arcade Browser Voice" })).toContainText("Inactive");

    for (const url of [
      `${failures.server.baseUrl}/api/messages/messages/${createdMessage.key}`,
      `${failures.server.baseUrl}/api/messages/segments/${disabledSegment.key}`,
      `${failures.server.baseUrl}/api/messages/tts-profiles/${createdTtsProfile.key}`,
    ]) {
      const deleteResult = await fetch(url, { method: "DELETE" });
      expect(deleteResult.status).toBe(404);
    }

    await failures.server.close();
    const restartedServer = await startRepoServer();
    failures.server = restartedServer;
    const persistedResult = await jsonRequest(`${restartedServer.baseUrl}/api/messages/messages/${createdMessage.key}`);
    expect(persistedResult.response.ok).toBe(true);
    expect(persistedResult.payload.data.message).toEqual(expect.objectContaining({
      active: false,
      key: createdMessage.key,
      name: "Forest Warning Updated",
      messageText: "The forest gets darker beyond this point.",
    }));

    const persistedSegmentResult = await jsonRequest(`${restartedServer.baseUrl}/api/messages/segments/${disabledSegment.key}`);
    expect(persistedSegmentResult.response.ok).toBe(true);
    expect(persistedSegmentResult.payload.data.segment).toEqual(expect.objectContaining({
      active: false,
      displayOrder: 1,
      key: disabledSegment.key,
      segmentText: "We are being attacked by bats right now.",
    }));

    const persistedTtsProfileResult = await jsonRequest(`${restartedServer.baseUrl}/api/messages/tts-profiles/${createdTtsProfile.key}`);
    expect(persistedTtsProfileResult.response.ok).toBe(true);
    expect(persistedTtsProfileResult.payload.data.ttsProfile).toEqual(expect.objectContaining({
      active: false,
      key: createdTtsProfile.key,
      name: "Arcade Browser Voice",
      providerKey: "browser-speech",
      voiceName: "Test Voice",
    }));

    expect(failures.failedRequests).toEqual([]);
    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors).toEqual([]);
  } finally {
    await closeMessagesRun(failures, page);
    await fs.rm(sqlitePath, { force: true });
  }
});
