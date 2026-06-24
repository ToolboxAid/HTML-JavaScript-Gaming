import assert from "node:assert/strict";
import test from "node:test";

import {
  createMessagesPostgresService,
  handleMessagesApiContract,
} from "../../src/dev-runtime/messages/messages-postgres-service.mjs";
import { createMessagesPostgresClientStub } from "../helpers/messagesPostgresClientStub.mjs";

function createServiceHarness() {
  const postgresClient = createMessagesPostgresClientStub();
  const service = createMessagesPostgresService({ postgresClient });
  return { postgresClient, service };
}

function datedRow(row) {
  const now = "2026-06-22T00:00:00.000Z";
  return {
    active: true,
    createdAt: now,
    createdBy: "test-author",
    updatedAt: now,
    updatedBy: "test-author",
    ...row,
  };
}

test("Messages publish validation passes publish-ready message configuration", async () => {
  const { service } = createServiceHarness();

  const emotion = (await service.listEmotionProfiles()).find((profile) => profile.name === "Calm");
  const voice = (await service.listTtsProfiles()).find((profile) => profile.name === "Man Profile 1");
  assert.ok(emotion);
  assert.ok(voice);

  const message = await service.createMessage({
    emotionProfileKey: emotion.key,
    messageText: "The bridge is open.",
    name: "Bridge Open",
    voiceProfileKey: voice.key,
  });
  await service.createMessageSegment({
    displayOrder: 1,
    emotionProfileKey: emotion.key,
    messageKey: message.key,
    segmentText: "The bridge is open.",
    voiceProfileKey: voice.key,
  });
  await service.createMessageEventAction({
    actionType: "speak-message",
    messageKey: message.key,
    name: "Speak bridge status",
  });

  const response = await handleMessagesApiContract({
    method: "GET",
    parts: ["publish-validation"],
    service,
  });

  assert.equal(response.publishValidation.valid, true);
  assert.equal(response.publishValidation.canPublish, true);
  assert.equal(response.publishValidation.issueCount, 0);
  assert.deepEqual(response.publishValidation.issues, []);
  service.close();
});

test("Messages publish validation blocks invalid message and TTS references", async () => {
  const { postgresClient, service } = createServiceHarness();
  await service.ensureReady();
  const categoryKey = await service.defaultMessageCategoryKey();

  await postgresClient.requestTable("messages_tts_profiles", {
    body: datedRow({
      description: "Configured for a future external provider.",
      key: "voice-provider-openai",
      language: "en-US",
      name: "Future OpenAI Voice",
      pitch: 1,
      providerKey: "openai",
      rate: 1,
      voiceName: "Future voice",
      volume: 1,
    }),
    method: "POST",
  });
  await postgresClient.requestTable("messages_records", {
    body: datedRow({
      categoryKey,
      emotionProfileKey: "",
      key: "message-invalid",
      messageText: "",
      name: "Invalid Message",
      notes: "",
      voiceProfileKey: "voice-provider-openai",
    }),
    method: "POST",
  });
  await postgresClient.requestTable("messages_segments", {
    body: datedRow({
      displayOrder: 1,
      emotionProfileKey: "missing-emotion",
      key: "segment-invalid",
      messageKey: "message-missing",
      segmentText: "",
      voiceProfileKey: "",
    }),
    method: "POST",
  });
  await postgresClient.requestTable("messages_event_actions", {
    body: datedRow({
      actionType: "speak-message",
      key: "event-action-invalid",
      messageKey: "message-missing",
      name: "Broken event action",
    }),
    method: "POST",
  });

  const validation = await service.validateMessagePublishConfiguration();
  const codes = validation.issues.map((issue) => issue.code);

  assert.equal(validation.valid, false);
  assert.equal(validation.canPublish, false);
  assert.ok(codes.includes("missing-message-text"));
  assert.ok(codes.includes("missing-emotion-profile"));
  assert.ok(codes.includes("missing-voice-profile"));
  assert.ok(codes.includes("broken-reference"));
  assert.ok(codes.includes("invalid-provider-assignment"));
  assert.equal(validation.issues.every((issue) => issue.message && !/postgres|sql|stack|econn/i.test(issue.message)), true);
  service.close();
});
