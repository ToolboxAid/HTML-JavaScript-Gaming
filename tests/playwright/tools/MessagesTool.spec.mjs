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
    surface: "Message Studio parent/child table, Local API, and Theme V2 tool",
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

async function addMessage(page, values) {
  await page.getByRole("button", { name: "Add Message" }).click();
  await page.locator("[data-messages-row-editor='__new__'] [data-message-name]").fill(values.name);
  await page.locator("[data-messages-row-editor-details='__new__'] [data-message-emotion]").selectOption({ label: values.emotion });
  await page.locator("[data-messages-row-editor-details='__new__'] [data-message-text]").fill(values.text);
  await page.locator("[data-messages-row-editor-details='__new__'] [data-message-notes]").fill(values.notes || "");
  await page.locator("[data-messages-commit='__new__']").click();
}

async function addPart(page, values) {
  await page.getByRole("button", { name: "Add Part" }).click();
  await page.locator("[data-messages-segment-editor='__new__'] [data-segment-order]").fill(String(values.order));
  await page.locator("[data-messages-segment-editor='__new__'] [data-segment-text]").fill(values.text);
  await page.locator("[data-messages-segment-editor='__new__'] [data-segment-emotion]").selectOption({ label: values.emotion });
  await page.locator("[data-messages-segment-commit='__new__']").click();
}

test("Message Studio renders Messages with child Message Parts and plays ordered parts", async ({ page }) => {
  const sqlitePath = messagesDbPath();
  await fs.rm(sqlitePath, { force: true });
  const failures = await openMessagesPage(page, sqlitePath);

  try {
    await expect(page.getByRole("heading", { level: 1, name: "Message Studio" })).toBeVisible();
    await expect(page.locator(".tool-workspace")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("[data-messages-category-name]")).toHaveCount(0);
    await expect(page.locator("[data-messages-tts-add-row]")).toHaveCount(0);
    await expect(page.locator("[data-messages-emotions]")).toHaveCount(0);
    await expect(page.locator("[data-messages-tts-profiles]")).toHaveCount(0);
    await expect(page.getByRole("columnheader", { name: "Message Name" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Default TTS Profile" })).toBeVisible();
    await expect(page.locator("[data-messages-segment-count]")).toHaveText("0");
    await expect(page.getByRole("button", { name: "Stop" })).toBeEnabled();

    await page.getByRole("button", { name: "Add Message" }).click();
    await page.locator("[data-messages-commit='__new__']").click();
    await expect(page.locator("[data-messages-validation-card]")).toBeVisible();
    await expect(page.locator("[data-messages-validation-errors]")).toContainText("Message Name is required.");
    await expect(page.locator("[data-messages-validation-errors]")).toContainText("Emotion Profile is required.");
    await expect(page.locator("[data-messages-validation-errors]")).toContainText("Message Text is required.");
    await page.locator("[data-messages-cancel='__new__']").click();

    await addMessage(page, {
      emotion: "Urgent",
      name: "Bat Encounter",
      notes: "Opening combat line.",
      text: "Bats drop from the rafters.",
    });
    await expect(page.locator("[data-messages-log]")).toHaveText("Updated row Bat Encounter.");
    await expect(page.locator("[data-messages-table]")).toContainText("Bat Encounter");
    await expect(page.locator("[data-messages-row]").filter({ hasText: "Bat Encounter" })).toContainText("Dialog");
    await expect(page.locator("[data-messages-row]").filter({ hasText: "Bat Encounter" })).toContainText("0");
    await expect(page.locator("[data-message-default-tts-profile]").first()).toHaveValue(/.+/);

    const messageRow = page.locator("[data-messages-row]").filter({ hasText: "Bat Encounter" });
    await messageRow.click();
    await expect(page.locator("[data-messages-segment-host]")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Message Parts" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Order" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Text" })).toBeVisible();
    await expect(page.getByRole("columnheader", { exact: true, name: "TTS Profile" })).toBeVisible();

    await page.getByRole("button", { name: "Add Part" }).click();
    await page.locator("[data-messages-segment-editor='__new__'] [data-segment-order]").fill("");
    await page.locator("[data-messages-segment-commit='__new__']").click();
    await expect(page.locator("[data-messages-validation-errors]")).toContainText("Part Text is required.");
    await expect(page.locator("[data-messages-validation-errors]")).toContainText("Emotion Profile is required.");
    await expect(page.locator("[data-messages-validation-errors]")).toContainText("Display Order is required.");
    await page.locator("[data-messages-segment-cancel='__new__']").click();

    await addPart(page, {
      emotion: "Calm",
      order: 1,
      text: "Bats drop from the rafters.",
    });
    await expect(page.locator("[data-messages-log]")).toHaveText("Updated message part 1.");
    await addPart(page, {
      emotion: "Urgent",
      order: 2,
      text: "Keep your torch high.",
    });
    await expect(page.locator("[data-messages-log]")).toHaveText("Updated message part 2.");
    await expect(page.locator("[data-messages-segment-row]")).toHaveCount(2);
    await expect(page.locator("[data-messages-row]").filter({ hasText: "Bat Encounter" })).toContainText("2");

    await page.locator("[data-messages-row]").filter({ hasText: "Bat Encounter" }).getByRole("button", { name: "Play Message" }).click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Play Message queued 2 parts for Bat Encounter.");
    let speechCalls = await page.evaluate(() => window.__messagesSpeechCalls);
    expect(speechCalls.slice(-2).map((call) => call.text)).toEqual([
      "Bats drop from the rafters.",
      "Keep your torch high.",
    ]);
    expect(speechCalls.at(-1)).toEqual(expect.objectContaining({
      lang: "en-US",
      type: "speak",
      voiceName: "Test Voice",
    }));
    await page.getByRole("button", { name: "Stop" }).click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Message Studio playback stopped. Cleared 2 queued items.");
    speechCalls = await page.evaluate(() => window.__messagesSpeechCalls);
    expect(speechCalls.at(-1)).toEqual({ type: "cancel" });

    await page.locator("[data-messages-segment-row]").filter({ hasText: "Keep your torch high." }).getByRole("button", { name: "Play Part" }).click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Play Part queued Part 2 using Browser Speech Default.");
    speechCalls = await page.evaluate(() => window.__messagesSpeechCalls);
    expect(speechCalls.at(-1)).toEqual(expect.objectContaining({
      text: "Keep your torch high.",
      type: "speak",
      voiceName: "Test Voice",
    }));

    await page.locator("[data-messages-row]").filter({ hasText: "Bat Encounter" }).getByRole("button", { name: "Edit Message" }).click();
    await page.locator("[data-messages-row-editor] [data-message-name]").fill("Bat Encounter Updated");
    await page.locator("[data-messages-row-editor] [data-messages-commit]").click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Updated row Bat Encounter Updated.");

    await page.locator("[data-messages-segment-row]").filter({ hasText: "Keep your torch high." }).getByRole("button", { name: "Edit Part" }).click();
    await page.locator("[data-messages-segment-editor] [data-segment-text]").fill("Keep your torch high and shield raised.");
    await page.locator("[data-messages-segment-editor] [data-messages-segment-commit]").click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Updated message part 2.");

    const listResult = await jsonRequest(`${failures.server.baseUrl}/api/messages/messages`);
    expect(listResult.response.ok).toBe(true);
    expect(listResult.payload.ok).toBe(true);
    const createdMessage = listResult.payload.data.messages.find((message) => message.name === "Bat Encounter Updated");
    expect(createdMessage).toEqual(expect.objectContaining({
      active: true,
      categoryName: "Dialog",
      emotionProfileName: "Urgent",
      messageText: "Bats drop from the rafters.",
      notes: "Opening combat line.",
    }));
    expect(createdMessage.key).toMatch(ULID_PATTERN);

    const segmentsResult = await jsonRequest(`${failures.server.baseUrl}/api/messages/segments`);
    expect(segmentsResult.response.ok).toBe(true);
    const createdSegments = segmentsResult.payload.data.segments.filter((segment) => segment.messageKey === createdMessage.key);
    expect(createdSegments.map((segment) => segment.displayOrder)).toEqual([1, 2]);
    expect(createdSegments.map((segment) => segment.segmentText)).toEqual([
      "Bats drop from the rafters.",
      "Keep your torch high and shield raised.",
    ]);
    createdSegments.forEach((segment) => {
      expect(segment.key).toMatch(ULID_PATTERN);
      expect(segment.createdBy).toMatch(ULID_PATTERN);
      expect(segment.updatedBy).toMatch(ULID_PATTERN);
    });

    expect(failures.failedRequests).toEqual([]);
    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors).toEqual([]);
  } finally {
    await closeMessagesRun(failures, page);
    await fs.rm(sqlitePath, { force: true });
  }
});

test("Message Studio shows actionable playback error when audio engine is unavailable", async ({ page }) => {
  const sqlitePath = messagesDbPath();
  await fs.rm(sqlitePath, { force: true });
  const failures = await openMessagesPage(page, sqlitePath, { speechAvailable: false });

  try {
    await addMessage(page, {
      emotion: "Urgent",
      name: "Bat Encounter",
      text: "Bats drop from the rafters.",
    });
    await page.locator("[data-messages-row]").filter({ hasText: "Bat Encounter" }).click();
    await addPart(page, {
      emotion: "Urgent",
      order: 1,
      text: "Bats drop from the rafters.",
    });

    await page.locator("[data-messages-row]").filter({ hasText: "Bat Encounter" }).getByRole("button", { name: "Play Message" }).click();
    await expect(page.locator("[data-messages-validation-card]")).toBeVisible();
    await expect(page.locator("[data-messages-validation-errors]")).toContainText("Audio engine is unavailable. Use a browser with SpeechSynthesis support and reload Message Studio.");
    await expect(page.locator("[data-messages-log]")).toHaveText("Audio engine is unavailable. Use a browser with SpeechSynthesis support and reload Message Studio.");
    await expect(page.locator("[data-messages-preview-status]")).toHaveText("Audio engine is unavailable. Use a browser with SpeechSynthesis support and reload Message Studio.");
    expect(await page.evaluate(() => window.__messagesSpeechCalls)).toEqual([]);

    expect(failures.failedRequests).toEqual([]);
    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors).toEqual([]);
  } finally {
    await closeMessagesRun(failures, page);
    await fs.rm(sqlitePath, { force: true });
  }
});
