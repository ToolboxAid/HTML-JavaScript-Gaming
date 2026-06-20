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
    surface: "Message Studio Local API, legacy SQLite adapter, and Theme V2 tool",
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
    if (speechAvailable) {
      Object.defineProperty(window, "SpeechSynthesisUtterance", {
        configurable: true,
        value: class SpeechSynthesisUtterance {
          constructor(text = "") {
            this.lang = "";
            this.pitch = 1;
            this.rate = 1;
            this.text = text;
            this.voice = null;
            this.volume = 1;
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
            return [
              { lang: "en-US", name: "Test Voice" },
            ];
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
      return;
    }
    Object.defineProperty(window, "SpeechSynthesisUtterance", { configurable: true, value: undefined });
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: undefined });
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

test("Message Studio creates, validates, updates, and persists through the Local API", async ({ page }) => {
  const sqlitePath = messagesDbPath();
  await fs.rm(sqlitePath, { force: true });
  const failures = await openMessagesPage(page, sqlitePath);

  try {
    await expect(page.getByRole("heading", { level: 1, name: "Message Studio" })).toBeVisible();
    await expect(page.locator(".tool-workspace")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("[data-messages-category-name]")).toHaveCount(0);
    await expect(page.locator("[data-messages-category]")).toHaveCount(0);
    await expect(page.locator("[data-messages-emotions]")).toContainText("Calm");
    await expect(page.locator("[data-messages-emotions]")).toContainText("Urgent");
    await expect(page.locator("[data-messages-tts-profiles]")).toContainText("Browser Speech Default");
    await expect(page.locator("[data-messages-tts-profiles]")).toContainText("Narration Preview");
    await expect(page.locator("[data-messages-persistence-engine]")).toHaveText("Postgres target");

    await page.locator("[data-messages-emotion-name]").fill("Robot");
    await page.locator("[data-messages-emotion-description]").fill("Mechanical delivery for synthetic speakers.");
    await page.locator("[data-messages-emotion-volume]").fill("0.9");
    await page.locator("[data-messages-emotion-pitch]").fill("0.85");
    await page.locator("[data-messages-emotion-rate]").fill("0.95");
    await page.locator("[data-messages-emotion-pause-before]").fill("40");
    await page.locator("[data-messages-emotion-pause-after]").fill("120");
    await page.getByRole("button", { name: "Update Emotion Profile" }).click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Updated emotion profile Robot.");
    await expect(page.locator("[data-messages-emotions]")).toContainText("Robot");
    await page.locator("[data-messages-emotion-row]").filter({ hasText: "Robot" }).getByRole("button", { name: "Update Row" }).click();
    await page.locator("[data-messages-emotion-description]").fill("Disabled test profile.");
    await page.locator("[data-messages-emotion-active]").uncheck();
    await page.getByRole("button", { name: "Update Emotion Profile" }).click();
    await expect(page.locator("[data-messages-emotion-row]").filter({ hasText: "Robot" })).toContainText("Inactive");

    await page.locator("[data-messages-tts-name]").fill("Arcade Browser Voice");
    await page.locator("[data-messages-tts-description]").fill("Configuration only for future browser speech preview.");
    await page.locator("[data-messages-tts-provider-key]").fill("browser-speech");
    await page.locator("[data-messages-tts-voice-name]").fill("Test Voice");
    await page.locator("[data-messages-tts-language]").fill("en-US");
    await page.locator("[data-messages-tts-volume]").fill("0.8");
    await page.locator("[data-messages-tts-pitch]").fill("1.1");
    await page.locator("[data-messages-tts-rate]").fill("0.95");
    await page.getByRole("button", { name: "Update TTS Profile" }).click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Updated TTS profile Arcade Browser Voice.");
    await expect(page.locator("[data-messages-tts-profiles]")).toContainText("Arcade Browser Voice");
    await expect(page.locator("[data-messages-tts-count]")).toHaveText("3");

    await page.locator("[data-messages-tts-row]").filter({ hasText: "Arcade Browser Voice" }).getByRole("button", { name: "Update Row" }).click();
    await page.locator("[data-messages-tts-description]").fill("Updated configuration only.");
    await page.locator("[data-messages-tts-active]").uncheck();
    await page.getByRole("button", { name: "Update TTS Profile" }).click();
    await expect(page.locator("[data-messages-tts-row]").filter({ hasText: "Arcade Browser Voice" })).toContainText("Inactive");
    await page.locator("[data-messages-tts-row]").filter({ hasText: "Arcade Browser Voice" }).getByRole("button", { name: "Update Row" }).click();
    await page.locator("[data-messages-tts-active]").check();
    await page.getByRole("button", { name: "Update TTS Profile" }).click();
    await expect(page.locator("[data-messages-tts-row]").filter({ hasText: "Arcade Browser Voice" })).toContainText("Active");

    const ttsProfilesResult = await jsonRequest(`${failures.server.baseUrl}/api/messages/tts-profiles`);
    expect(ttsProfilesResult.response.ok).toBe(true);
    expect(ttsProfilesResult.payload.ok).toBe(true);
    const createdTtsProfile = ttsProfilesResult.payload.data.ttsProfiles.find((profile) => profile.name === "Arcade Browser Voice");
    expect(createdTtsProfile).toEqual(expect.objectContaining({
      active: true,
      description: "Updated configuration only.",
      language: "en-US",
      providerKey: "browser-speech",
      rate: 0.95,
      voiceName: "Test Voice",
    }));
    expect(createdTtsProfile.key).toMatch(ULID_PATTERN);
    expect(createdTtsProfile.createdBy).toMatch(ULID_PATTERN);
    expect(createdTtsProfile.updatedBy).toMatch(ULID_PATTERN);

    const getTtsProfileResult = await jsonRequest(`${failures.server.baseUrl}/api/messages/tts-profiles/${createdTtsProfile.key}`);
    expect(getTtsProfileResult.response.ok).toBe(true);
    expect(getTtsProfileResult.payload.data.ttsProfile).toEqual(expect.objectContaining({
      key: createdTtsProfile.key,
      name: "Arcade Browser Voice",
      providerKey: "browser-speech",
    }));

    const deleteTtsProfileResult = await fetch(`${failures.server.baseUrl}/api/messages/tts-profiles/${createdTtsProfile.key}`, {
      method: "DELETE",
    });
    expect(deleteTtsProfileResult.status).toBe(404);

    await page.locator("[data-messages-form]").getByRole("button", { name: "Update Row" }).click();
    await expect(page.locator("[data-messages-validation-card]")).toBeVisible();
    await expect(page.locator("[data-messages-validation-errors]")).toContainText("Message Name is required.");
    await expect(page.locator("[data-messages-validation-errors]")).toContainText("Emotion Profile is required.");
    await expect(page.locator("[data-messages-validation-errors]")).toContainText("Message Text is required.");

    await page.locator("[data-messages-name]").fill("Forest Warning");
    await page.locator("[data-messages-emotion-profile]").selectOption({ label: "Urgent" });
    await page.locator("[data-messages-text]").fill("The forest gets darker beyond this point.\nWe are being attacked by bats.");
    await page.locator("[data-messages-notes]").fill("Opening forest danger line.");
    await page.locator("[data-messages-form]").getByRole("button", { name: "Update Row" }).click();

    await expect(page.locator("[data-messages-log]")).toHaveText("Updated row Forest Warning.");
    await expect(page.locator("[data-messages-count]")).toHaveText("1");
    await expect(page.locator("[data-messages-table]")).toContainText("Forest Warning");
    await expect(page.locator("[data-messages-selected-text]")).toHaveText("The forest gets darker beyond this point.\nWe are being attacked by bats.");
    await expect(page.locator("[data-messages-segment-context]")).toHaveText("Segments for Forest Warning");

    const listResult = await jsonRequest(`${failures.server.baseUrl}/api/messages/messages`);
    expect(listResult.response.ok).toBe(true);
    expect(listResult.payload.ok).toBe(true);
    const createdMessage = listResult.payload.data.messages.find((message) => message.name === "Forest Warning");
    expect(createdMessage).toEqual(expect.objectContaining({
      active: true,
      categoryName: "Dialog",
      emotionProfileName: "Urgent",
      messageText: "The forest gets darker beyond this point.\nWe are being attacked by bats.",
      notes: "Opening forest danger line.",
    }));
    expect(createdMessage.key).toMatch(ULID_PATTERN);
    expect(createdMessage.createdBy).toMatch(ULID_PATTERN);
    expect(createdMessage.updatedBy).toMatch(ULID_PATTERN);

    await page.locator("[data-messages-segment-order]").fill("");
    await page.getByRole("button", { name: "Update Segment Row" }).click();
    await expect(page.locator("[data-messages-segment-validation-card]")).toBeVisible();
    await expect(page.locator("[data-messages-segment-validation-errors]")).toContainText("Segment Text is required.");
    await expect(page.locator("[data-messages-segment-validation-errors]")).toContainText("Emotion Profile is required.");
    await expect(page.locator("[data-messages-segment-validation-errors]")).toContainText("Display Order is required.");

    await page.locator("[data-messages-segment-order]").fill("1");
    await page.locator("[data-messages-segment-emotion-profile]").selectOption({ label: "Calm" });
    await page.locator("[data-messages-segment-text]").fill("The forest gets darker beyond this point.");
    await page.getByRole("button", { name: "Update Segment Row" }).click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Updated segment row 1.");
    await expect(page.locator("[data-messages-segments]")).toContainText("The forest gets darker beyond this point.");

    await page.locator("[data-messages-segment-emotion-profile]").selectOption({ label: "Urgent" });
    await page.locator("[data-messages-segment-text]").fill("We are being attacked by bats.");
    await page.getByRole("button", { name: "Update Segment Row" }).click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Updated segment row 2.");
    await expect(page.locator("[data-messages-segments]")).toContainText("We are being attacked by bats.");

    await page.locator("[data-messages-preview-tts-profile]").selectOption({ label: "Arcade Browser Voice" });
    await page.locator("[data-messages-preview-message]").click();
    await expect(page.locator("[data-messages-preview-status]")).toHaveText("Preview requested for message Forest Warning.");
    let speechCalls = await page.evaluate(() => window.__messagesSpeechCalls);
    expect(speechCalls.filter((call) => call.type === "speak").at(-1)).toEqual(expect.objectContaining({
      lang: "en-US",
      pitch: 1.08,
      rate: 1.15,
      text: "The forest gets darker beyond this point.\nWe are being attacked by bats.",
      voiceName: "Test Voice",
      volume: 1,
    }));

    await page.locator("[data-messages-preview-segments]").click();
    await expect(page.locator("[data-messages-preview-status]")).toHaveText("Preview requested for 2 active segments.");
    speechCalls = await page.evaluate(() => window.__messagesSpeechCalls);
    expect(speechCalls.filter((call) => call.type === "speak").slice(-2)).toEqual([
      expect.objectContaining({
        pitch: 1,
        rate: 1,
        text: "The forest gets darker beyond this point.",
        voiceName: "Test Voice",
        volume: 1,
      }),
      expect.objectContaining({
        pitch: 1.08,
        rate: 1.15,
        text: "We are being attacked by bats.",
        voiceName: "Test Voice",
        volume: 1,
      }),
    ]);

    await page.locator("[data-messages-preview-stop]").click();
    await expect(page.locator("[data-messages-preview-status]")).toHaveText("Speech preview stopped.");
    speechCalls = await page.evaluate(() => window.__messagesSpeechCalls);
    expect(speechCalls.at(-1)).toEqual({ type: "cancel" });

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

    await page.locator("[data-messages-segment-row]").filter({ hasText: "We are being attacked by bats." }).getByRole("button", { name: "Update Row" }).click();
    await page.locator("[data-messages-segment-text]").fill("We are being attacked by bats right now.");
    await page.getByRole("button", { name: "Update Segment Row" }).click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Updated segment row 1.");
    await expect(page.locator("[data-messages-segments]")).toContainText("We are being attacked by bats right now.");

    await page.locator("[data-messages-segment-row]").filter({ hasText: "We are being attacked by bats right now." }).getByRole("button", { name: "Disable Row" }).click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Disabled segment row 1.");
    await expect(page.locator("[data-messages-segment-row]").filter({ hasText: "We are being attacked by bats right now." })).toContainText("Inactive");

    await page.getByRole("button", { name: "Reload Segments" }).click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Segments reloaded from the Local API.");
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

    const getSegmentResult = await jsonRequest(`${failures.server.baseUrl}/api/messages/segments/${disabledSegment.key}`);
    expect(getSegmentResult.response.ok).toBe(true);
    expect(getSegmentResult.payload.data.segment).toEqual(expect.objectContaining({
      active: false,
      key: disabledSegment.key,
      segmentText: "We are being attacked by bats right now.",
    }));

    const deleteSegmentResult = await fetch(`${failures.server.baseUrl}/api/messages/segments/${disabledSegment.key}`, {
      method: "DELETE",
    });
    expect(deleteSegmentResult.status).toBe(404);

    const profileUsageResult = await jsonRequest(`${failures.server.baseUrl}/api/messages/emotion-profiles`);
    expect(profileUsageResult.response.ok).toBe(true);
    const urgentProfile = profileUsageResult.payload.data.emotionProfiles.find((profile) => profile.name === "Urgent");
    expect(urgentProfile).toEqual(expect.objectContaining({
      messageUsageCount: 1,
      segmentUsageCount: 1,
      usageCount: 2,
    }));
    expect(urgentProfile.references.map((reference) => reference.type).sort()).toEqual(["message", "segment"]);

    const deactivateReferencedProfile = await jsonRequest(`${failures.server.baseUrl}/api/messages/emotion-profiles/${urgentProfile.key}`, {
      body: JSON.stringify({
        active: false,
        description: urgentProfile.description,
        name: urgentProfile.name,
        pauseAfterMs: urgentProfile.pauseAfterMs,
        pauseBeforeMs: urgentProfile.pauseBeforeMs,
        pitch: urgentProfile.pitch,
        rate: urgentProfile.rate,
        volume: urgentProfile.volume,
      }),
      method: "POST",
    });
    expect(deactivateReferencedProfile.response.status).toBe(400);
    expect(deactivateReferencedProfile.payload.error).toContain("Emotion profile is referenced by messages or segments.");

    await expect(page.locator("[data-messages-emotion-row]").filter({ hasText: "Urgent" })).toContainText("2");
    await page.locator("[data-messages-emotion-row]").filter({ hasText: "Urgent" }).getByRole("button", { name: "Update Row" }).click();
    await page.locator("[data-messages-emotion-active]").uncheck();
    await page.getByRole("button", { name: "Update Emotion Profile" }).click();
    await expect(page.locator("[data-messages-log]")).toContainText("Emotion profile is referenced by messages or segments.");
    await expect(page.locator("[data-messages-emotion-row]").filter({ hasText: "Urgent" })).toContainText("Active");
    failures.failedRequests = failures.failedRequests.filter((request) => !request.includes(`/api/messages/emotion-profiles/${urgentProfile.key}`));
    failures.consoleErrors = failures.consoleErrors.filter(
      (message) => message !== "Failed to load resource: the server responded with a status of 400 (Bad Request)",
    );

    await page.locator("[data-messages-row]").filter({ hasText: "Forest Warning" }).getByRole("button", { name: "Update Row" }).click();
    await page.locator("[data-messages-name]").fill("Forest Warning Updated");
    await page.locator("[data-messages-text]").fill("The forest gets darker beyond this point.");
    await page.locator("[data-messages-form]").getByRole("button", { name: "Update Row" }).click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Updated row Forest Warning Updated.");
    await expect(page.locator("[data-messages-table]")).toContainText("Forest Warning Updated");

    const updateResult = await jsonRequest(`${failures.server.baseUrl}/api/messages/messages/${createdMessage.key}`);
    expect(updateResult.payload.data.message).toEqual(expect.objectContaining({
      key: createdMessage.key,
      messageText: "The forest gets darker beyond this point.",
      name: "Forest Warning Updated",
    }));

    const deleteResult = await fetch(`${failures.server.baseUrl}/api/messages/messages/${createdMessage.key}`, {
      method: "DELETE",
    });
    expect(deleteResult.status).toBe(404);

    await failures.server.close();
    const restartedServer = await startRepoServer();
    failures.server = restartedServer;
    const persistedResult = await jsonRequest(`${restartedServer.baseUrl}/api/messages/messages/${createdMessage.key}`);
    expect(persistedResult.response.ok).toBe(true);
    expect(persistedResult.payload.data.message).toEqual(expect.objectContaining({
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

test("Message Studio speech preview reports unavailable browser synthesis", async ({ page }) => {
  const sqlitePath = messagesDbPath();
  await fs.rm(sqlitePath, { force: true });
  const failures = await openMessagesPage(page, sqlitePath, { speechAvailable: false });

  try {
    await page.locator("[data-messages-name]").fill("Unavailable Preview");
    await page.locator("[data-messages-emotion-profile]").selectOption({ label: "Calm" });
    await page.locator("[data-messages-text]").fill("This line cannot be spoken in this browser.");
    await page.locator("[data-messages-form]").getByRole("button", { name: "Update Row" }).click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Updated row Unavailable Preview.");
    await page.getByRole("button", { name: "Preview Message" }).click();
    await expect(page.locator("[data-messages-preview-status]")).toHaveText("Browser speech synthesis is unavailable. Use a browser with speechSynthesis support to preview messages.");
    await expect(page.locator("[data-messages-log]")).toHaveText("Speech preview unavailable.");
    expect(failures.failedRequests).toEqual([]);
    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors).toEqual([]);
  } finally {
    await closeMessagesRun(failures, page);
    await fs.rm(sqlitePath, { force: true });
  }
});
