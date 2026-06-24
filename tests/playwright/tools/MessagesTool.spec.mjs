import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { createMessagesPostgresClientStub } from "../../helpers/messagesPostgresClientStub.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";
import { TEXT_TO_SPEECH_PROFILE_STORAGE_KEY } from "../../../toolbox/text-to-speech/tts-profile-store.js";

const ULID_PATTERN = /^[0-9A-HJKMNP-TV-Z]{26}$/;
const SAVED_TTS_PROFILES_FIXTURE = Object.freeze([
  Object.freeze({
    active: true,
    age: "any",
    emotions: [
      Object.freeze({ active: true, emotion: "calm", emotionLabel: "Calm", id: "calm", pitch: 1, rate: 1, volume: 1 }),
      Object.freeze({ active: true, emotion: "urgent", emotionLabel: "Urgent", id: "urgent", pitch: 1.08, rate: 1.15, volume: 1 }),
    ],
    gender: "neutral",
    id: "default-balanced-profile",
    language: "en-US",
    name: "Default Balanced Profile",
    providerKey: "browser-speech",
    voice: "Browser default",
    voiceName: "Default browser voice",
  }),
  Object.freeze({
    active: true,
    age: "adult",
    emotions: [
      Object.freeze({ active: true, emotion: "neutral", emotionLabel: "Neutral", id: "neutral", pitch: 1, rate: 1, volume: 1 }),
      Object.freeze({ active: true, emotion: "calm", emotionLabel: "Calm", id: "calm", pitch: 1, rate: 1, volume: 1 }),
      Object.freeze({ active: true, emotion: "urgent", emotionLabel: "Urgent", id: "urgent", pitch: 1.08, rate: 1.15, volume: 1 }),
    ],
    gender: "male",
    id: "man-profile-1",
    language: "en-US",
    name: "Man Profile 1",
    providerKey: "browser-speech",
    voice: "Browser default",
    voiceName: "Default browser voice",
  }),
  Object.freeze({
    active: true,
    age: "adult",
    emotions: [
      Object.freeze({ active: true, emotion: "whisper", emotionLabel: "Whisper", id: "whisper", pitch: 0.95, rate: 0.9, volume: 0.55 }),
      Object.freeze({ active: true, emotion: "robot", emotionLabel: "Robot", id: "robot", pitch: 0.82, rate: 0.92, volume: 0.9 }),
    ],
    gender: "female",
    id: "woman-profile-2",
    language: "en-US",
    name: "Woman Profile 2",
    providerKey: "browser-speech",
    voice: "Browser default",
    voiceName: "Default browser voice",
  }),
]);

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
    surface: "Message Studio table-first Messages and child sentence tool",
  });
});

test.afterEach(async ({ page }) => {
  await clearPlaywrightStorage(page);
});

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

async function openMessagesPage(page, options = {}) {
  const messagesPostgresClient = createMessagesPostgresClientStub();
  const server = await startRepoServer({ messagesPostgresClient });
  const failures = {
    consoleErrors: [],
    failedRequests: [],
    messagesPostgresClient,
    pageErrors: [],
    server,
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

  await page.addInitScript(({ apiUrl }) => {
    window.GameFoundryPublicConfig = {
      apiUrl,
      environmentLabel: "Development Environment",
      siteUrl: window.location.origin,
    };
  }, {
    apiUrl: options.apiUrl || `${server.baseUrl}/api`,
  });
  await page.addInitScript(() => {
    window.__spokenUtterances = [];
    class FakeSpeechSynthesisUtterance {
      constructor(text) {
        this.lang = "";
        this.onend = null;
        this.onerror = null;
        this.pitch = 1;
        this.rate = 1;
        this.text = text;
        this.voice = null;
        this.volume = 1;
      }
    }
    window.SpeechSynthesisUtterance = FakeSpeechSynthesisUtterance;
    window.speechSynthesis = {
      cancel() {
        window.__speechCanceled = true;
      },
      getVoices() {
        return [
          { lang: "en-US", name: "Browser guide updated", voiceURI: "Browser guide updated" },
          { lang: "en-US", name: "Browser default", voiceURI: "Browser default" },
        ];
      },
      speak(utterance) {
        window.__spokenUtterances.push({
          lang: utterance.lang,
          pitch: utterance.pitch,
          rate: utterance.rate,
          text: utterance.text,
          voiceName: utterance.voice?.name || "",
          volume: utterance.volume,
        });
        setTimeout(() => utterance.onend?.(), 0);
      },
    };
  });
  if (options.seedSavedTtsProfiles !== false) {
    await page.addInitScript(({ profiles, storageKey }) => {
      window.localStorage?.setItem(storageKey, JSON.stringify({
        profiles,
        updatedAt: "2026-06-23T00:00:00.000Z",
        version: "playwright-fixture",
      }));
    }, {
      profiles: options.savedTtsProfiles || SAVED_TTS_PROFILES_FIXTURE,
      storageKey: TEXT_TO_SPEECH_PROFILE_STORAGE_KEY,
    });
  }
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}/tools/messages/index.html`, { waitUntil: "networkidle" });
  return failures;
}

async function closeMessagesRun(failures, page) {
  await workspaceV2CoverageReporter.stop(page);
  await failures.server.close();
}

async function addMessage(page, values) {
  await page.getByRole("button", { name: "Add Message" }).click();
  await page.locator("[data-messages-row-editor='__new__'] [data-message-name]").fill(values.name);
  await page.locator("[data-messages-row-editor='__new__'] [data-message-tts-profile]").selectOption({ label: values.ttsProfile });
  await page.locator("[data-messages-commit='__new__']").click();
}

async function addSentence(page, values) {
  await page.getByRole("button", { name: "Add Sentence" }).click();
  await page.locator("[data-messages-segment-editor='__new__'] [data-segment-order]").fill(String(values.order));
  await page.locator("[data-messages-segment-editor='__new__'] [data-segment-text]").fill(values.text);
  await page.locator("[data-messages-segment-editor='__new__'] [data-segment-emotion]").selectOption({ label: values.emotion });
  await page.locator("[data-messages-segment-commit='__new__']").click();
}

async function ensureSentencesExpanded(page, messageName) {
  const messageRow = page.locator("[data-messages-row]").filter({ hasText: messageName });
  if (await page.locator("[data-messages-parts-host]").count() === 0) {
    await messageRow.getByRole("button", { name: "Sentences" }).click();
  }
  await expect(page.locator("[data-messages-parts-host]")).toBeVisible();
  return messageRow;
}

async function expectPlaybackDiagnostics(page, {
  ageFilter = "Any",
  gender = "Any",
  language = "en-US",
  profile,
  voice,
}) {
  const log = page.locator("[data-messages-log]");
  await expect(log).toContainText("Playing:");
  await expect(log).toContainText(`Profile: ${profile}`);
  await expect(log).toContainText(`Gender: ${gender}`);
  await expect(log).toContainText(`Voice: ${voice}`);
  await expect(log).toContainText(`Language: ${language}`);
  await expect(log).toContainText(`Age Filter: ${ageFilter}`);
}

async function setRangeValue(locator, value) {
  await locator.evaluate((input, nextValue) => {
    input.value = nextValue;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, String(value));
}

async function createdMessage(server, name) {
  const listResult = await jsonRequest(`${server.baseUrl}/api/messages/messages`);
  expect(listResult.response.ok).toBe(true);
  expect(listResult.payload.ok).toBe(true);
  return listResult.payload.data.messages.find((message) => message.name === name);
}

async function emotionProfile(server, name) {
  const profilesResult = await jsonRequest(`${server.baseUrl}/api/messages/emotion-profiles`);
  expect(profilesResult.response.ok).toBe(true);
  expect(profilesResult.payload.ok).toBe(true);
  return profilesResult.payload.data.emotionProfiles.find((profile) => profile.name === name);
}

async function emotionProfiles(server) {
  const profilesResult = await jsonRequest(`${server.baseUrl}/api/messages/emotion-profiles`);
  expect(profilesResult.response.ok).toBe(true);
  expect(profilesResult.payload.ok).toBe(true);
  return profilesResult.payload.data.emotionProfiles;
}

async function voiceProfile(server, name) {
  const profilesResult = await jsonRequest(`${server.baseUrl}/api/messages/tts-profiles`);
  expect(profilesResult.response.ok).toBe(true);
  expect(profilesResult.payload.ok).toBe(true);
  return profilesResult.payload.data.ttsProfiles.find((profile) => profile.name === name);
}

async function voiceProfiles(server) {
  const profilesResult = await jsonRequest(`${server.baseUrl}/api/messages/tts-profiles`);
  expect(profilesResult.response.ok).toBe(true);
  expect(profilesResult.payload.ok).toBe(true);
  return profilesResult.payload.data.ttsProfiles;
}

async function createReferencedSentence(server, message, emotionName = "Urgent", voiceName = "Man Profile 1") {
  const emotion = await emotionProfile(server, emotionName);
  const voice = await voiceProfile(server, voiceName);
  expect(emotion).toBeTruthy();
  expect(voice).toBeTruthy();
  const segmentResult = await jsonRequest(`${server.baseUrl}/api/messages/segments`, {
    body: JSON.stringify({
      displayOrder: 1,
      emotionProfileKey: emotion.key,
      messageKey: message.key,
      segmentText: "Referenced sentence.",
      voiceProfileKey: voice.key,
    }),
    method: "POST",
  });
  expect(segmentResult.response.ok).toBe(true);
  expect(segmentResult.payload.ok).toBe(true);
  return segmentResult.payload.data.segment;
}

test("Message Studio uses the approved table-first Messages structure", async ({ page }) => {
  const failures = await openMessagesPage(page);

  try {
    await expect(page.getByRole("heading", { level: 1, name: "Message Studio" })).toBeVisible();
    await expect(page.locator(".tool-workspace")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Add Message" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Run Validation" })).toBeVisible();
    await expect(page.locator("[data-messages-publish-status]")).toHaveText("Not checked");
    await expect(page.locator("[data-messages-publish-issues]")).toContainText("Run validation before publishing.");
    await expect(page.locator("[data-messages-table]")).toContainText("No messages yet. Add your first message when you are ready.");

    const expectedHeaders = ["Message", "TTS Profile", "Updated", "Actions"];
    await expect(page.getByLabel("Messages").getByRole("columnheader")).toHaveText(expectedHeaders);
    await expect(page.getByText("Reusable Assets", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Emotion Profiles" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Voice Profiles" })).toHaveCount(0);
    await expect(page.getByText("TTS Profile / Emotion Settings", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Emotion Settings", { exact: true })).toHaveCount(0);
    await expect(page.getByLabel("Emotion Profiles")).toHaveCount(0);
    await expect(page.getByLabel("Voice Profiles")).toHaveCount(0);
    await expect(page.getByText("Message Parts", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Add Emotion" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Add Voice" })).toHaveCount(0);
    await expect(page.getByRole("columnheader", { name: "Type" })).toHaveCount(0);
    await expect(page.getByRole("columnheader", { name: "Status" })).toHaveCount(0);
    await expect(page.getByRole("columnheader", { name: "Parts" })).toHaveCount(0);
    await expect(page.getByRole("columnheader", { name: "Emotion", exact: true })).toHaveCount(0);
    await expect(page.getByRole("columnheader", { name: "Voice", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Stop Playback" })).toHaveCount(0);
    await expect(page.locator("[data-message-default-tts-profile], [data-segment-tts-profile]")).toHaveCount(0);

    await page.getByRole("button", { name: "Add Message" }).click();
    await expect(page.locator("[data-messages-row-editor='__new__']")).toBeVisible();
    await expect(page.locator("[data-messages-row-editor='__new__'] td")).toHaveCount(4);
    await expect(page.locator("[data-messages-row-editor='__new__'] [data-message-tts-profile]")).toBeVisible();
    await expect(page.locator("[data-messages-row-editor='__new__'] [data-message-tts-profile] option")).toHaveText([
      "Select TTS profile",
      "Default Balanced Profile",
      "Man Profile 1",
      "Woman Profile 2",
    ]);
    await expect(page.locator("[data-messages-row-editor='__new__']").getByRole("button", { name: "Save" })).toBeVisible();
    await expect(page.locator("[data-messages-row-editor='__new__']").getByRole("button", { name: "Cancel" })).toBeVisible();

    await page.locator("[data-messages-commit='__new__']").click();
    await expect(page.locator("[data-messages-validation-card]")).toBeVisible();
    await expect(page.locator("[data-messages-validation-errors]")).toContainText("Message is required.");
    await expect(page.locator("[data-messages-validation-errors]")).toContainText("TTS Profile is required.");
    await page.locator("[data-messages-cancel='__new__']").click();

    await addMessage(page, {
      name: "Bat Encounter",
      ttsProfile: "Man Profile 1",
    });
    await expect(page.locator("[data-messages-log]")).toHaveText("Saved message Bat Encounter.");
    const messageRow = page.locator("[data-messages-row]").filter({ hasText: "Bat Encounter" });
    await expect(messageRow).toContainText("Man Profile 1");
    await expect(messageRow.getByRole("button", { name: "Sentences" })).toBeVisible();
    await expect(messageRow.getByRole("button", { name: "Edit" })).toBeVisible();
    await expect(messageRow.getByRole("button", { name: "Archive" })).toBeVisible();
    await expect(messageRow.getByRole("button", { name: "Delete" })).toBeEnabled();
    await expect(messageRow.getByRole("button", { name: "Play" })).toBeVisible();

    await ensureSentencesExpanded(page, "Bat Encounter");
    await expect(page.locator("[data-messages-parts-host]")).toBeVisible();
    const partsTable = page.getByLabel("Bat Encounter Sentences");
    await expect(partsTable.getByRole("columnheader")).toHaveText(["Order", "Text", "Emotion", "Actions"]);
    await expect(partsTable).toContainText("No sentences yet. Add a sentence for this message when ready.");

    await page.getByRole("button", { name: "Add Sentence" }).click();
    await expect(page.locator("[data-messages-segment-editor='__new__'] td")).toHaveCount(4);
    await expect(page.locator("[data-messages-segment-editor='__new__'] [data-segment-voice]")).toHaveCount(0);
    await expect(page.locator("[data-messages-segment-editor='__new__'] [data-segment-emotion] option")).toHaveText([
      "Select emotion",
      "Neutral",
      "Calm",
      "Urgent",
    ]);
    await page.locator("[data-messages-segment-commit='__new__']").click();
    await expect(page.locator("[data-messages-validation-errors]")).toContainText("Sentence text is required.");
    await expect(page.locator("[data-messages-validation-errors]")).toContainText("Emotion is required.");
    await page.locator("[data-messages-segment-cancel='__new__']").click();

    await addSentence(page, {
      emotion: "Calm",
      order: 1,
      text: "Bats drop from the rafters.",
    });
    await expect(page.locator("[data-messages-log]")).toHaveText("Saved sentence 1.");
    const sentenceRow = page.locator("[data-messages-segment-row]").filter({ hasText: "Bats drop from the rafters." });
    await expect(sentenceRow).toContainText("1");
    await expect(sentenceRow).toContainText("Calm");
    await expect(sentenceRow.getByRole("button", { name: "Edit" })).toBeVisible();
    await expect(sentenceRow.getByRole("button", { name: "Archive" })).toBeVisible();
    await expect(sentenceRow.getByRole("button", { name: "Delete" })).toBeVisible();
    await expect(sentenceRow.getByRole("button", { name: "Play" })).toBeVisible();
    await expect(page.locator("[data-messages-usage-count]")).toHaveText("1");
    await expect(page.locator("[data-messages-reference-list]")).toContainText("Sentence 1: Bats drop from the rafters.");
    await expect(page.locator("[data-messages-segment-count]")).toHaveText("1");
    await expect(page.locator("[data-messages-row]").filter({ hasText: "Bat Encounter" }).getByRole("button", { name: "Delete" })).toBeDisabled();
    await expect(page.locator("[data-messages-row]").filter({ hasText: "Bat Encounter" }).getByRole("button", { name: "Archive" })).toBeEnabled();

    await page.evaluate(() => {
      window.__spokenUtterances = [];
    });
    await sentenceRow.getByRole("button", { name: "Play" }).click();
    await page.waitForFunction(() => window.__spokenUtterances.length === 1);
    const spokenSentence = await page.evaluate(() => window.__spokenUtterances);
    expect(spokenSentence).toHaveLength(1);
    expect(spokenSentence[0]).toEqual(expect.objectContaining({
      lang: "en-US",
      pitch: 1,
      rate: 1,
      text: "Bats drop from the rafters.",
      voiceName: "",
      volume: 1,
    }));
    await expect(page.locator("[data-messages-validation-errors]")).not.toContainText(/before preview/i);
    await expect(page.locator("[data-messages-log]")).not.toContainText(/before preview/i);
    await expectPlaybackDiagnostics(page, {
      gender: "Male",
      profile: "Man Profile 1",
      voice: "Default browser voice",
    });

    await addSentence(page, {
      emotion: "Urgent",
      order: 2,
      text: "Keep low.",
    });
    await expect(page.locator("[data-messages-log]")).toHaveText("Saved sentence 2.");
    const secondSentenceRow = page.locator("[data-messages-segment-row]").filter({ hasText: "Keep low." });
    await expect(secondSentenceRow).toContainText("2");
    await expect(secondSentenceRow.getByRole("button", { name: "Play" })).toBeVisible();
    await expect(page.locator("[data-messages-segment-count]")).toHaveText("2");
    await expect(page.locator("[data-messages-reference-list]")).toContainText("Sentence 2: Keep low.");

    await page.evaluate(() => {
      window.__spokenUtterances = [];
    });
    await secondSentenceRow.getByRole("button", { name: "Play" }).click();
    await page.waitForFunction(() => window.__spokenUtterances.length === 1);
    const spokenSecondSentence = await page.evaluate(() => window.__spokenUtterances);
    expect(spokenSecondSentence).toHaveLength(1);
    expect(spokenSecondSentence[0]).toEqual(expect.objectContaining({
      pitch: 1.08,
      rate: 1.15,
      text: "Keep low.",
      voiceName: "",
      volume: 1,
    }));
    await expect(page.locator("[data-messages-validation-errors]")).not.toContainText(/before preview/i);
    await expect(page.locator("[data-messages-log]")).not.toContainText(/before preview/i);
    await expectPlaybackDiagnostics(page, {
      gender: "Male",
      profile: "Man Profile 1",
      voice: "Default browser voice",
    });

    await page.getByRole("button", { name: "Run Validation" }).click();
    await expect(page.locator("[data-messages-publish-status]")).toHaveText("Ready");
    await expect(page.locator("[data-messages-publish-issues]")).toContainText("No message publish issues.");
    await expect(page.locator("[data-messages-log]")).toHaveText("Publish validation passed.");
    const publishValidationResult = await jsonRequest(`${failures.server.baseUrl}/api/messages/publish-validation`);
    expect(publishValidationResult.response.ok).toBe(true);
    expect(publishValidationResult.payload.ok).toBe(true);
    expect(publishValidationResult.payload.data.publishValidation).toEqual(expect.objectContaining({
      canPublish: true,
      issueCount: 0,
      status: "Ready",
      valid: true,
    }));

    await page.evaluate(() => {
      window.__spokenUtterances = [];
    });
    await messageRow.getByRole("button", { name: "Play" }).click();
    await page.waitForFunction(() => window.__spokenUtterances.length >= 2);
    const spokenMessage = await page.evaluate(() => window.__spokenUtterances);
    expect(spokenMessage.map((utterance) => utterance.text)).toEqual(["Bats drop from the rafters.", "Keep low."]);
    expect(spokenMessage[0]).toEqual(expect.objectContaining({
      pitch: 1,
      rate: 1,
      voiceName: "",
      volume: 1,
    }));
    expect(spokenMessage[1]).toEqual(expect.objectContaining({
      pitch: 1.08,
      rate: 1.15,
      voiceName: "",
      volume: 1,
    }));
    await expect(page.locator("[data-messages-validation-errors]")).not.toContainText(/before preview/i);
    await expect(page.locator("[data-messages-log]")).not.toContainText(/before preview/i);
    await expectPlaybackDiagnostics(page, {
      gender: "Male",
      profile: "Man Profile 1",
      voice: "Default browser voice",
    });
    await page.getByRole("button", { name: "Stop Speech" }).click();
    await expect(page.locator("[data-messages-speech-status]")).toHaveText("Speech playback stopped.");

    await messageRow.getByRole("button", { name: "Archive" }).click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Archived message Bat Encounter.");
    const archivedMessageRow = page.locator("[data-messages-row]").filter({ hasText: "Bat Encounter (Archived)" });
    await expect(archivedMessageRow.getByRole("button", { name: "Play" })).toBeVisible();
    await expect(archivedMessageRow.getByRole("button", { name: "Restore" })).toBeVisible();
    await expect(archivedMessageRow.getByRole("button", { name: "Delete" })).toBeDisabled();
    await archivedMessageRow.getByRole("button", { name: "Restore" }).click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Restored message Bat Encounter.");
    await expect(messageRow.getByRole("button", { name: "Play" })).toBeVisible();

    await sentenceRow.getByRole("button", { name: "Archive" }).click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Archived sentence 1.");
    const archivedSentenceRow = page.locator("[data-messages-segment-row]").filter({ hasText: "Bats drop from the rafters." });
    await expect(archivedSentenceRow).toContainText("1 (Archived)");
    await expect(archivedSentenceRow.getByRole("button", { name: "Play" })).toBeVisible();
    await expect(archivedSentenceRow.getByRole("button", { name: "Restore" })).toBeVisible();
    await expect(messageRow.getByRole("button", { name: "Play" })).toBeVisible();

    await archivedSentenceRow.getByRole("button", { name: "Restore" }).click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Restored sentence 1.");

    await sentenceRow.getByRole("button", { name: "Edit" }).click();
    await expect(page.locator("[data-messages-segment-editor]").getByRole("button", { name: "Save" })).toBeVisible();
    await expect(page.locator("[data-messages-segment-editor]").getByRole("button", { name: "Cancel" })).toBeVisible();
    await page.locator("[data-messages-segment-editor] [data-segment-text]").fill("Temporary sentence edit");
    await page.locator("[data-messages-segment-editor] [data-messages-segment-cancel]").click();
    await expect(sentenceRow).toContainText("Bats drop from the rafters.");
    await expect(sentenceRow).not.toContainText("Temporary sentence edit");

    await sentenceRow.getByRole("button", { name: "Edit" }).click();
    await page.locator("[data-messages-segment-editor] [data-segment-order]").fill("2");
    await page.locator("[data-messages-segment-editor] [data-segment-text]").fill("Bats drop from the rafters. Shields up.");
    await page.locator("[data-messages-segment-editor] [data-messages-segment-commit]").click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Saved sentence 2.");
    const editedSentenceRow = page.locator("[data-messages-segment-row]").filter({ hasText: "Bats drop from the rafters. Shields up." });
    await expect(editedSentenceRow).toContainText("2");

    await editedSentenceRow.getByRole("button", { name: "Delete" }).click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Deleted sentence 2.");
    await expect(page.locator("[data-messages-segment-row]")).toHaveCount(1);
    await expect(page.locator("[data-messages-usage-count]")).toHaveText("1");
    await expect(secondSentenceRow.getByRole("button", { name: "Play" })).toBeVisible();
    await expect(page.locator("[data-messages-row]").filter({ hasText: "Bat Encounter" }).getByRole("button", { name: "Play" })).toBeVisible();
    await secondSentenceRow.getByRole("button", { name: "Delete" }).click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Deleted sentence 2.");
    await expect(page.locator("[data-messages-segment-row]")).toHaveCount(0);
    await expect(page.locator("[data-messages-usage-count]")).toHaveText("0");
    await expect(page.locator("[data-messages-row]").filter({ hasText: "Bat Encounter" }).getByRole("button", { name: "Delete" })).toBeEnabled();
    await expect(page.locator("[data-messages-row]").filter({ hasText: "Bat Encounter" }).getByRole("button", { name: "Play" })).toBeVisible();
    await page.locator("[data-messages-row]").filter({ hasText: "Bat Encounter" }).getByRole("button", { name: "Play" }).click();
    await expect(page.locator("[data-messages-validation-errors]")).toContainText("Add at least one sentence before playing this message.");
    await expect(page.locator("[data-messages-speech-status]")).toHaveText("No sentences available.");

    await messageRow.getByRole("button", { name: "Edit" }).click();
    await expect(page.locator("[data-messages-row-editor]").getByRole("button", { name: "Save" })).toBeVisible();
    await expect(page.locator("[data-messages-row-editor]").getByRole("button", { name: "Cancel" })).toBeVisible();
    await page.locator("[data-messages-row-editor] [data-message-name]").fill("Temporary Message Edit");
    await page.locator("[data-messages-row-editor] [data-messages-cancel]").click();
    await expect(page.locator("[data-messages-row]").filter({ hasText: "Bat Encounter" })).toBeVisible();
    await expect(page.locator("[data-messages-row]").filter({ hasText: "Temporary Message Edit" })).toHaveCount(0);

    await messageRow.getByRole("button", { name: "Edit" }).click();
    await page.locator("[data-messages-row-editor] [data-message-name]").fill("Bat Encounter Updated");
    await page.locator("[data-messages-row-editor] [data-messages-commit]").click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Saved message Bat Encounter Updated.");
    await expect(page.locator("[data-messages-row]").filter({ hasText: "Bat Encounter Updated" })).toContainText("Man Profile 1");

    const updatedMessage = await createdMessage(failures.server, "Bat Encounter Updated");
    expect(updatedMessage).toEqual(expect.objectContaining({
      active: true,
      categoryName: "Dialog",
      voiceProfileName: "Man Profile 1",
    }));
    expect(updatedMessage.key).toMatch(ULID_PATTERN);
    expect(updatedMessage).not.toHaveProperty("rate");
    expect(updatedMessage).not.toHaveProperty("pitch");
    expect(updatedMessage).not.toHaveProperty("volume");

    const manProfile = (await voiceProfiles(failures.server)).find((profile) => profile.name === "Man Profile 1");
    expect(manProfile).toEqual(expect.objectContaining({
      language: "en-US",
      providerKey: "browser-speech",
      voiceName: "Default browser voice",
    }));

    await page.locator("[data-messages-row]").filter({ hasText: "Bat Encounter Updated" }).getByRole("button", { name: "Delete" }).click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Deleted message Bat Encounter Updated.");
    await expect(page.locator("[data-messages-row]")).toHaveCount(0);
    await expect(page.locator("[data-messages-table]")).toContainText("No messages yet. Add your first message when you are ready.");

    expect(failures.failedRequests).toEqual([]);
    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors).toEqual([]);
  } finally {
    await closeMessagesRun(failures, page);
  }
});

test("Message Studio consumes active saved Text To Speech profiles", async ({ page }) => {
  const failures = await openMessagesPage(page, { seedSavedTtsProfiles: false });

  try {
    await page.goto(`${failures.server.baseUrl}/tools/text-to-speech/index.html`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1, name: "Text To Speech" })).toBeVisible();

    await page.locator("[data-tts-profile-add-control-row]").getByRole("button", { name: "Add Profile" }).click();
    await page.locator("[data-tts-profile-editor='__new__'] [data-tts-profile-name]").fill("Quest Profile Draft");
    await page.locator("[data-tts-profile-editor='__new__'] [data-tts-profile-gender]").selectOption("male");
    await page.locator("[data-tts-profile-editor='__new__'] [data-tts-profile-age]").selectOption("adult");
    await page.locator("[data-tts-profile-editor='__new__'] [data-tts-profile-voice]").selectOption("Browser guide updated");
    await page.locator("[data-tts-commit-profile='__new__']").click();
    await expect(page.locator("[data-tts-status]")).toHaveText("Saved TTS profile: Quest Profile Draft.");

    await page.locator("[data-tts-profile-row]").filter({ hasText: "Quest Profile Draft" }).getByRole("button", { name: "Edit Profile" }).click();
    await page.locator("[data-tts-profile-editor] [data-tts-profile-name]").fill("Quest Profile Active");
    await page.locator("[data-tts-profile-editor] [data-tts-commit-profile]").click();
    await expect(page.locator("[data-tts-status]")).toHaveText("Saved TTS profile: Quest Profile Active.");

    await page.locator("[data-tts-emotion-add-control-row]").getByRole("button", { name: "Add Emotion" }).click();
    await page.locator("[data-tts-emotion-editor='__new__'] [data-tts-emotion-name]").selectOption("urgent");
    await setRangeValue(page.locator("[data-tts-emotion-editor='__new__'] [data-tts-emotion-pitch]"), "1.2");
    await setRangeValue(page.locator("[data-tts-emotion-editor='__new__'] [data-tts-emotion-rate]"), "1.1");
    await setRangeValue(page.locator("[data-tts-emotion-editor='__new__'] [data-tts-emotion-volume]"), "0.7");
    await page.locator("[data-tts-commit-emotion='__new__']").click();
    await expect(page.locator("[data-tts-status]")).toHaveText("Saved emotion: Urgent.");

    await page.goto(`${failures.server.baseUrl}/tools/messages/index.html`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Add Message" }).click();
    await expect(page.locator("[data-messages-row-editor='__new__'] [data-message-tts-profile]")).toContainText("Quest Profile Active");
    await page.locator("[data-messages-row-editor='__new__'] [data-message-name]").fill("Quest Profile Message");
    await page.locator("[data-messages-row-editor='__new__'] [data-message-tts-profile]").selectOption({ label: "Quest Profile Active" });
    await page.locator("[data-messages-commit='__new__']").click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Saved message Quest Profile Message.");

    const messageRow = await ensureSentencesExpanded(page, "Quest Profile Message");
    await page.getByRole("button", { name: "Add Sentence" }).click();
    await expect(page.locator("[data-messages-segment-editor='__new__'] [data-segment-emotion] option")).toHaveText([
      "Select emotion",
      "Neutral",
      "Urgent",
    ]);
    await expect(page.locator("[data-messages-segment-editor='__new__'] [data-segment-emotion]")).not.toContainText("Happy");
    await expect(page.locator("[data-messages-segment-editor='__new__'] [data-segment-emotion]")).not.toContainText("Scared");
    await page.locator("[data-messages-segment-editor='__new__'] [data-segment-order]").fill("1");
    await page.locator("[data-messages-segment-editor='__new__'] [data-segment-text]").fill("The quest door opens.");
    await page.locator("[data-messages-segment-editor='__new__'] [data-segment-emotion]").selectOption({ label: "Urgent" });
    await page.locator("[data-messages-segment-commit='__new__']").click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Saved sentence 1.");

    const sentenceRow = page.locator("[data-messages-segment-row]").filter({ hasText: "The quest door opens." });
    await page.evaluate(() => {
      window.__spokenUtterances = [];
    });
    await sentenceRow.getByRole("button", { name: "Play" }).click();
    await page.waitForFunction(() => window.__spokenUtterances.length === 1);
    let utterances = await page.evaluate(() => window.__spokenUtterances);
    expect(utterances).toEqual([expect.objectContaining({
      pitch: 1.2,
      rate: 1.1,
      text: "The quest door opens.",
      volume: 0.7,
    })]);
    await expectPlaybackDiagnostics(page, {
      ageFilter: "Adult",
      gender: "Male",
      profile: "Quest Profile Active",
      voice: "Browser guide updated",
    });

    await page.evaluate(() => {
      window.__spokenUtterances = [];
    });
    await messageRow.getByRole("button", { name: "Play" }).click();
    await page.waitForFunction(() => window.__spokenUtterances.length === 1);
    utterances = await page.evaluate(() => window.__spokenUtterances);
    expect(utterances.map((utterance) => utterance.text)).toEqual(["The quest door opens."]);
    await expect(page.locator("[data-messages-validation-errors]")).not.toContainText(/before preview/i);
    await expect(page.locator("[data-messages-log]")).not.toContainText(/before preview/i);

    expect(failures.failedRequests).toEqual([]);
    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors).toEqual([]);
  } finally {
    await closeMessagesRun(failures, page);
  }
});

test("Message Studio loads Text To Speech profiles and filters sentence emotions by selected profile", async ({ page }) => {
  const failures = await openMessagesPage(page);

  try {
    await page.getByRole("button", { name: "Add Message" }).click();
    const profileOptions = page.locator("[data-messages-row-editor='__new__'] [data-message-tts-profile] option");
    await expect(profileOptions).toHaveText([
      "Select TTS profile",
      "Default Balanced Profile",
      "Man Profile 1",
      "Woman Profile 2",
    ]);
    await page.locator("[data-messages-row-editor='__new__'] [data-message-name]").fill("Profile Filter Test");
    await page.locator("[data-messages-row-editor='__new__'] [data-message-tts-profile]").selectOption({ label: "Man Profile 1" });
    await page.locator("[data-messages-commit='__new__']").click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Saved message Profile Filter Test.");

    await ensureSentencesExpanded(page, "Profile Filter Test");
    await page.getByRole("button", { name: "Add Sentence" }).click();
    await expect(page.locator("[data-messages-segment-editor='__new__'] [data-segment-emotion] option")).toHaveText([
      "Select emotion",
      "Neutral",
      "Calm",
      "Urgent",
    ]);
    await expect(page.locator("[data-messages-segment-editor='__new__'] [data-segment-emotion]")).not.toContainText("Whisper");
    await expect(page.locator("[data-messages-segment-editor='__new__'] [data-segment-emotion]")).not.toContainText("Robot");
    await page.locator("[data-messages-segment-cancel='__new__']").click();

    const messageRow = page.locator("[data-messages-row]").filter({ hasText: "Profile Filter Test" });
    await messageRow.getByRole("button", { name: "Edit" }).click();
    await page.locator("[data-messages-row-editor] [data-message-tts-profile]").selectOption({ label: "Woman Profile 2" });
    await page.locator("[data-messages-row-editor] [data-messages-commit]").click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Saved message Profile Filter Test.");

    await ensureSentencesExpanded(page, "Profile Filter Test");
    await page.getByRole("button", { name: "Add Sentence" }).click();
    await expect(page.locator("[data-messages-segment-editor='__new__'] [data-segment-emotion] option")).toHaveText([
      "Select emotion",
      "Whisper",
      "Robot",
    ]);
    await expect(page.locator("[data-messages-segment-editor='__new__'] [data-segment-emotion]")).not.toContainText("Calm");
    await expect(page.locator("[data-messages-segment-editor='__new__'] [data-segment-emotion]")).not.toContainText("Urgent");
    await page.locator("[data-messages-segment-editor='__new__'] [data-segment-order]").fill("1");
    await page.locator("[data-messages-segment-editor='__new__'] [data-segment-text]").fill("Robot voice check.");
    await page.locator("[data-messages-segment-editor='__new__'] [data-segment-emotion]").selectOption({ label: "Robot" });
    await page.locator("[data-messages-segment-commit='__new__']").click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Saved sentence 1.");

    const sentenceRow = page.locator("[data-messages-segment-row]").filter({ hasText: "Robot voice check." });
    await page.evaluate(() => {
      window.__spokenUtterances = [];
    });
    await sentenceRow.getByRole("button", { name: "Play" }).click();
    await page.waitForFunction(() => window.__spokenUtterances.length === 1);
    const spokenSentence = await page.evaluate(() => window.__spokenUtterances);
    expect(spokenSentence).toEqual([expect.objectContaining({
      pitch: 0.82,
      rate: 0.92,
      text: "Robot voice check.",
      volume: 0.9,
    })]);
    await expectPlaybackDiagnostics(page, {
      gender: "Female",
      profile: "Woman Profile 2",
      voice: "Default browser voice",
    });
    await expect(page.locator("[data-messages-validation-errors]")).not.toContainText(/before preview/i);
    await expect(page.locator("[data-messages-log]")).not.toContainText(/before preview/i);

    await page.evaluate(() => {
      window.__spokenUtterances = [];
    });
    await messageRow.getByRole("button", { name: "Play" }).click();
    await page.waitForFunction(() => window.__spokenUtterances.length === 1);
    const spokenMessage = await page.evaluate(() => window.__spokenUtterances);
    expect(spokenMessage.map((utterance) => utterance.text)).toEqual(["Robot voice check."]);
    await expectPlaybackDiagnostics(page, {
      gender: "Female",
      profile: "Woman Profile 2",
      voice: "Default browser voice",
    });

    expect(failures.failedRequests).toEqual([]);
    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors).toEqual([]);
  } finally {
    await closeMessagesRun(failures, page);
  }
});

test("Message Studio disables Delete when a message is referenced", async ({ page }) => {
  const failures = await openMessagesPage(page);

  try {
    await addMessage(page, {
      name: "Referenced Encounter",
      ttsProfile: "Man Profile 1",
    });
    const message = await createdMessage(failures.server, "Referenced Encounter");
    const segment = await createReferencedSentence(failures.server, message);
    expect(segment.key).toMatch(ULID_PATTERN);

    await page.reload({ waitUntil: "networkidle" });
    const messageRow = page.locator("[data-messages-row]").filter({ hasText: "Referenced Encounter" });
    await messageRow.getByText("Referenced Encounter").click();
    const deleteButton = messageRow.getByRole("button", { name: "Delete" });
    await expect(deleteButton).toBeDisabled();
    await expect(deleteButton).toHaveAttribute("title", "Delete disabled: this message has sentences.");
    await expect(messageRow.getByRole("button", { name: "Archive" })).toBeEnabled();
    await expect(page.locator("[data-messages-referenced-count]")).toHaveText("1");
    await expect(page.locator("[data-messages-usage-count]")).toHaveText("1");
    await expect(page.locator("[data-messages-reference-list]")).toContainText("Sentence 1: Referenced sentence.");

    await messageRow.getByRole("button", { name: "Archive" }).click();
    await expect(page.locator("[data-messages-log]")).toHaveText("Archived message Referenced Encounter.");
    await expect(page.locator("[data-messages-row]").filter({ hasText: "Referenced Encounter (Archived)" })).toBeVisible();
    const archived = await createdMessage(failures.server, "Referenced Encounter");
    expect(archived.active).toBe(false);

    const deleteResult = await jsonRequest(`${failures.server.baseUrl}/api/messages/messages/${encodeURIComponent(message.key)}/delete`, {
      method: "POST",
    });
    expect(deleteResult.response.status).toBe(409);
    expect(deleteResult.payload.ok).toBe(false);

    expect(failures.failedRequests).toHaveLength(1);
    expect(failures.failedRequests[0]).toContain("409");
    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors).toEqual([]);
  } finally {
    await closeMessagesRun(failures, page);
  }
});

test("Message Studio shows Creator-safe load failures", async ({ page }) => {
  const failures = await openMessagesPage(page, { apiUrl: "http://127.0.0.1:9/api" });

  try {
    await expect(page.locator("[data-messages-validation-card]")).toBeVisible();
    await expect(page.locator("[data-messages-validation-errors]")).toContainText("Message Studio could not load messages. Start the Local API and reload this tool.");
    await expect(page.locator("[data-messages-validation-errors]")).not.toContainText("ECONNREFUSED");
    await expect(page.locator("[data-messages-validation-errors]")).not.toContainText("XMLHttpRequest");
    await expect(page.locator("[data-messages-log]")).toHaveText("Message Studio could not load messages. Start the Local API and reload this tool.");
    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors).toEqual([]);
  } finally {
    await closeMessagesRun(failures, page);
  }
});
