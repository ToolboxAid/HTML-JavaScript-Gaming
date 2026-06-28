import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { createMessagesPostgresClientStub } from "../../helpers/messagesPostgresClientStub.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { SEED_DB_KEYS } from "../../../../api/seed/seed-db-keys.mjs";

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

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "events-tool",
    surface: "Events Message Event Actions",
  });
});

test.afterEach(async ({ page }) => {
  await clearPlaywrightStorage(page);
});

async function createMessage(server) {
  const session = await jsonRequest(`${server.baseUrl}/api/session/user`, {
    body: JSON.stringify({ userKey: SEED_DB_KEYS.users.user1 }),
    method: "POST",
  });
  expect(session.response.ok).toBe(true);
  expect(session.payload.ok).toBe(true);

  const emotionResult = await jsonRequest(`${server.baseUrl}/api/messages/emotion-profiles`);
  const urgent = emotionResult.payload.data.emotionProfiles.find((profile) => profile.name === "Urgent");
  expect(urgent).toBeTruthy();
  const profileResult = await jsonRequest(`${server.baseUrl}/api/messages/tts-profiles`, {
    body: JSON.stringify({
      emotionSettings: [{
        emotion: "urgent",
        emotionLabel: "Urgent",
        pitch: 1.08,
        rate: 1.15,
        volume: 1,
      }],
      language: "en-US",
      name: "Events Test Profile",
      pitch: 1,
      providerKey: "browser-speech",
      rate: 1,
      voiceName: "Default browser voice",
      volume: 1,
    }),
    method: "POST",
  });
  expect(profileResult.response.ok).toBe(true);
  expect(profileResult.payload.ok).toBe(true);
  const ttsProfile = profileResult.payload.data.ttsProfile;
  const messageResult = await jsonRequest(`${server.baseUrl}/api/messages/messages`, {
    body: JSON.stringify({
      emotionProfileKey: urgent.key,
      messageText: "Open the ancient door.",
      name: "Door Prompt",
      voiceProfileKey: ttsProfile.key,
    }),
    method: "POST",
  });
  expect(messageResult.response.ok).toBe(true);
  expect(messageResult.payload.ok).toBe(true);
  return messageResult.payload.data.message;
}

async function openEventsPage(page) {
  const server = await startRepoServer({ messagesPostgresClient: createMessagesPostgresClientStub() });
  const failures = {
    consoleErrors: [],
    failedRequests: [],
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
  await page.addInitScript(({ apiUrl }) => {
    window.GameFoundryPublicConfig = {
      apiUrl,
      environmentLabel: "Development Environment",
      siteUrl: window.location.origin,
    };
  }, {
    apiUrl: `${server.baseUrl}/api`,
  });
  const message = await createMessage(server);
  await page.goto(`${server.baseUrl}/tools/events/index.html`, { waitUntil: "networkidle" });
  return { ...failures, message };
}

test("Events supports Local API message event actions", async ({ page }) => {
  const run = await openEventsPage(page);
  try {
    await expect(page.getByRole("heading", { level: 1, name: "Events" })).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.getByLabel("Message Event Actions").getByRole("columnheader")).toHaveText(["Action", "Event Option", "Message", "Updated", "Actions"]);
    await expect(page.getByRole("button", { name: "Add Action" })).toBeVisible();
    await expect(page.locator("[data-events-actions-table]")).toContainText("No event actions yet. Add an action when your event flow is ready.");

    await page.getByRole("button", { name: "Add Action" }).click();
    await expect(page.locator("[data-events-action-editor='__new__'] [data-event-action-type] option")).toHaveText([
      "Select action",
      "Show Message",
      "Speak Message",
      "Wait For Continue",
    ]);
    await page.locator("[data-events-action-commit='__new__']").click();
    await expect(page.locator("[data-events-validation-errors]")).toContainText("Action is required.");
    await expect(page.locator("[data-events-validation-errors]")).toContainText("Event option is required.");

    await page.locator("[data-event-action-name]").fill("Show door prompt");
    await page.locator("[data-event-action-type]").selectOption("show-message");
    await page.locator("[data-event-action-message]").selectOption(run.message.key);
    await page.locator("[data-events-action-commit='__new__']").click();
    await expect(page.locator("[data-events-log]")).toHaveText("Saved event action Show door prompt.");
    await expect(page.locator("[data-events-action-row]").filter({ hasText: "Show door prompt" })).toContainText("Door Prompt");

    const listResult = await jsonRequest(`${run.server.baseUrl}/api/messages/event-actions`);
    const saved = listResult.payload.data.eventActions.find((action) => action.name === "Show door prompt");
    expect(saved).toEqual(expect.objectContaining({
      actionLabel: "Show Message",
      actionType: "show-message",
      messageKey: run.message.key,
      messageName: "Door Prompt",
    }));

    await page.locator("[data-events-action-row]").filter({ hasText: "Show door prompt" }).getByRole("button", { name: "Edit" }).click();
    await page.locator("[data-event-action-type]").selectOption("speak-message");
    await page.locator("[data-events-action-commit]").click();
    await expect(page.locator("[data-events-action-row]").filter({ hasText: "Show door prompt" })).toContainText("Speak Message");

    await page.getByRole("button", { name: "Add Action" }).click();
    await page.locator("[data-event-action-name]").fill("Wait for player");
    await page.locator("[data-event-action-type]").selectOption("wait-for-continue");
    await page.locator("[data-events-action-commit='__new__']").click();
    await expect(page.locator("[data-events-action-row]").filter({ hasText: "Wait for player" })).toContainText("No message required");

    expect(run.failedRequests).toEqual([]);
    expect(run.pageErrors).toEqual([]);
    expect(run.consoleErrors).toEqual([]);
  } finally {
    await run.server.close();
  }
});
