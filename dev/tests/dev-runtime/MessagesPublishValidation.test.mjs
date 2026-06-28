import assert from "node:assert/strict";
import test from "node:test";

import {
  createMessagesPostgresService,
  handleMessagesApiContract,
} from "../../../api/messages/messages-postgres-service.mjs";
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

async function createWorkingTtsProfile(service, {
  emotionNames = ["Calm"],
  name = "Test Browser Profile",
} = {}) {
  const emotionProfiles = await service.listEmotionProfiles();
  const emotionSettings = emotionNames.map((emotionName) => {
    const emotion = emotionProfiles.find((profile) => profile.name === emotionName);
    assert.ok(emotion, `Expected ${emotionName} emotion profile`);
    return {
      emotion: emotion.name,
      emotionLabel: emotion.name,
      pitch: emotion.pitch,
      rate: emotion.rate,
      volume: emotion.volume,
    };
  });
  return service.createTtsProfile({
    active: true,
    emotionSettings,
    language: "en-US",
    name,
    pitch: 1,
    providerKey: "browser-speech",
    rate: 1,
    voiceName: "Default browser voice",
    volume: 1,
  });
}

test("Messages seed cleanup deletes retired parent TTS profiles and orphaned settings", async () => {
  const { postgresClient, service } = createServiceHarness();
  const retiredNames = ["Default Balanced Profile", "Hero", "Merchant", "Neutral", "Robot"];

  for (const [index, name] of retiredNames.entries()) {
    const key = `retired-profile-${index}`;
    await postgresClient.requestTable("messages_tts_profiles", {
      body: datedRow({
        description: "Retired broken TTS parent profile.",
        key,
        language: "en-US",
        name,
        pitch: 1,
        providerKey: "browser-speech",
        rate: 1,
        voiceName: "Default browser voice",
        volume: 1,
      }),
      method: "POST",
    });
    await postgresClient.requestTable("messages_tts_profile_emotion_settings", {
      body: datedRow({
        displayOrder: index + 1,
        emotionProfileKey: `retired-emotion-${index}`,
        key: `retired-setting-${index}`,
        pitch: 1,
        rate: 1,
        ssmlLikePreset: "normal",
        ttsProfileKey: key,
        volume: 1,
      }),
      method: "POST",
    });
  }

  await postgresClient.requestTable("messages_records", {
    body: datedRow({
      categoryKey: "retired-category",
      emotionProfileKey: "retired-emotion-0",
      key: "retired-message",
      messageText: "Retired message reference.",
      name: "Retired Message",
      notes: "",
      voiceProfileKey: "retired-profile-0",
    }),
    method: "POST",
  });
  await postgresClient.requestTable("messages_segments", {
    body: datedRow({
      displayOrder: 1,
      emotionProfileKey: "retired-emotion-0",
      key: "retired-segment",
      messageKey: "retired-message",
      segmentText: "Retired sentence reference.",
      voiceProfileKey: "retired-profile-0",
    }),
    method: "POST",
  });
  await postgresClient.requestTable("messages_event_actions", {
    body: datedRow({
      actionType: "speak-message",
      key: "retired-event-action",
      messageKey: "retired-message",
      name: "Retired event action",
    }),
    method: "POST",
  });
  await postgresClient.requestTable("messages_tts_profile_emotion_settings", {
    body: datedRow({
      displayOrder: 99,
      emotionProfileKey: "missing-emotion",
      key: "orphan-setting",
      pitch: 1,
      rate: 1,
      ssmlLikePreset: "normal",
      ttsProfileKey: "missing-profile",
      volume: 1,
    }),
    method: "POST",
  });
  await postgresClient.requestTable("messages_tts_profiles", {
    body: datedRow({
      description: "Empty parent should be deleted.",
      key: "empty-profile",
      language: "en-US",
      name: "Empty Parent Profile",
      pitch: 1,
      providerKey: "browser-speech",
      rate: 1,
      voiceName: "Default browser voice",
      volume: 1,
    }),
    method: "POST",
  });
  await postgresClient.requestTable("messages_records", {
    body: datedRow({
      categoryKey: "empty-category",
      emotionProfileKey: "empty-emotion",
      key: "empty-message",
      messageText: "Empty parent message reference.",
      name: "Empty Parent Message",
      notes: "",
      voiceProfileKey: "empty-profile",
    }),
    method: "POST",
  });
  await postgresClient.requestTable("messages_segments", {
    body: datedRow({
      displayOrder: 1,
      emotionProfileKey: "empty-emotion",
      key: "empty-segment",
      messageKey: "empty-message",
      segmentText: "Empty parent sentence reference.",
      voiceProfileKey: "empty-profile",
    }),
    method: "POST",
  });
  await postgresClient.requestTable("messages_event_actions", {
    body: datedRow({
      actionType: "speak-message",
      key: "empty-event-action",
      messageKey: "empty-message",
      name: "Empty parent event action",
    }),
    method: "POST",
  });

  await service.ensureReady();

  const ttsProfiles = await postgresClient.requestTable("messages_tts_profiles");
  const persistedProfileNames = ttsProfiles.map((profile) => profile.name);
  assert.deepEqual(persistedProfileNames.filter((name) => retiredNames.includes(name)), []);
  assert.equal(ttsProfiles.some((profile) => profile.name === "Empty Parent Profile"), false);
  const settings = await postgresClient.requestTable("messages_tts_profile_emotion_settings");
  assert.equal(settings.some((setting) => String(setting.ttsProfileKey).startsWith("retired-profile-")), false);
  assert.equal(settings.some((setting) => setting.key === "orphan-setting"), false);
  assert.equal((await postgresClient.requestTable("messages_records")).some((message) => message.voiceProfileKey === "retired-profile-0"), false);
  assert.equal((await postgresClient.requestTable("messages_segments")).some((segment) => segment.voiceProfileKey === "retired-profile-0"), false);
  assert.equal((await postgresClient.requestTable("messages_event_actions")).some((action) => action.messageKey === "retired-message"), false);
  assert.equal((await postgresClient.requestTable("messages_records")).some((message) => message.voiceProfileKey === "empty-profile"), false);
  assert.equal((await postgresClient.requestTable("messages_segments")).some((segment) => segment.voiceProfileKey === "empty-profile"), false);
  assert.equal((await postgresClient.requestTable("messages_event_actions")).some((action) => action.messageKey === "empty-message"), false);
  const apiResponse = await handleMessagesApiContract({
    method: "GET",
    parts: ["tts-profiles"],
    service,
  });
  const apiProfileNames = apiResponse.ttsProfiles.map((profile) => profile.name);
  for (const retiredName of retiredNames) {
    assert.equal(persistedProfileNames.includes(retiredName), false, `${retiredName} should be deleted from persisted TTS profiles`);
    assert.equal(apiProfileNames.includes(retiredName), false, `${retiredName} should be absent from API TTS profile output`);
  }
  assert.deepEqual((await service.listTtsProfiles()).map((profile) => profile.name), []);
  service.close();
});

test("Messages seed setup fails if retired TTS profile validation still finds broken names", async () => {
  const { postgresClient, service } = createServiceHarness();
  await postgresClient.requestTable("messages_tts_profiles", {
    body: datedRow({
      description: "Validation should fail if cleanup misses this row.",
      key: "missed-retired-profile",
      language: "en-US",
      name: "Hero",
      pitch: 1,
      providerKey: "browser-speech",
      rate: 1,
      voiceName: "Default browser voice",
      volume: 1,
    }),
    method: "POST",
  });
  service.deleteRetiredTtsProfileParents = async () => {};
  service.deleteEmptyTtsProfileParents = async () => {};

  await assert.rejects(
    () => service.ensureReady(),
    /Retired TTS Profile cleanup failed: Hero still exist/,
  );
  service.close();
});

test("Messages TTS profile saves reject empty parent profiles instead of creating fallback children", async () => {
  const { service } = createServiceHarness();

  await assert.rejects(
    () => service.createTtsProfile({
      active: true,
      emotionSettings: [],
      language: "en-US",
      name: "Empty Save Profile",
      pitch: 1,
      providerKey: "browser-speech",
      rate: 1,
      voiceName: "Default browser voice",
      volume: 1,
    }),
    /requires at least one emotion setting/,
  );

  for (const retiredName of ["Default Balanced Profile", "Hero", "Merchant", "Neutral", "Robot"]) {
    await assert.rejects(
      () => service.createTtsProfile({
        active: true,
        emotionSettings: [{
          emotion: "calm",
          emotionLabel: "Calm",
          pitch: 1,
          rate: 1,
          volume: 1,
        }],
        language: "en-US",
        name: retiredName,
        pitch: 1,
        providerKey: "browser-speech",
        rate: 1,
        voiceName: "Default browser voice",
        volume: 1,
      }),
      /retired and cannot be saved/,
    );
  }

  assert.deepEqual(await service.listTtsProfiles(), []);
  service.close();
});

test("Messages publish validation passes publish-ready message configuration", async () => {
  const { service } = createServiceHarness();

  const emotion = (await service.listEmotionProfiles()).find((profile) => profile.name === "Calm");
  const voice = await createWorkingTtsProfile(service, { name: "Publish Test Profile" });
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

test("Messages TTS profiles expose usage counts and block referenced profile deletion", async () => {
  const { service } = createServiceHarness();

  const emotion = (await service.listEmotionProfiles()).find((profile) => profile.name === "Calm");
  const voice = await createWorkingTtsProfile(service, { name: "Usage Test Profile" });
  assert.ok(emotion);
  assert.ok(voice);

  const message = await service.createMessage({
    emotionProfileKey: emotion.key,
    messageText: "Usage tracked line.",
    name: "Usage Count Message",
    voiceProfileKey: voice.key,
  });
  await service.createMessageSegment({
    displayOrder: 1,
    emotionProfileKey: emotion.key,
    messageKey: message.key,
    segmentText: "Usage tracked sentence.",
    voiceProfileKey: voice.key,
  });

  const usedProfile = await service.getTtsProfile(voice.key);
  const calmSetting = usedProfile.emotionSettings.find((setting) => setting.key === emotion.key);

  assert.equal(usedProfile.messageUsageCount, 1);
  assert.equal(usedProfile.segmentUsageCount, 1);
  assert.equal(usedProfile.usageCount, 2);
  assert.equal(usedProfile.references.map((reference) => reference.type).join(","), "message,sentence");
  assert.equal(calmSetting.messageUsageCount, 1);
  assert.equal(calmSetting.messagePartsUsageCount, 1);
  assert.equal(calmSetting.usageCount, 2);

  await assert.rejects(
    () => service.updateTtsProfile(voice.key, { active: false }),
    /TTS Profile is referenced/,
  );
  await assert.rejects(
    () => service.deleteTtsProfile(voice.key),
    /TTS Profile is referenced/,
  );
  await assert.rejects(
    () => service.deleteEmotionProfile(emotion.key),
    /Emotion Profile is referenced/,
  );
  service.close();
});

test("Messages enforces profile-scoped Emotion Profiles for save and publish validation", async () => {
  const { postgresClient, service } = createServiceHarness();

  const defaultProfile = await createWorkingTtsProfile(service, {
    emotionNames: ["Calm", "Urgent"],
    name: "Scoped Test Profile",
  });
  const urgent = (await service.listEmotionProfiles()).find((profile) => profile.name === "Urgent");
  const whisper = (await service.listEmotionProfiles()).find((profile) => profile.name === "Whisper");
  assert.ok(defaultProfile);
  assert.ok(urgent);
  assert.ok(whisper);
  assert.deepEqual(defaultProfile.emotionSettings.map((setting) => setting.emotionLabel), ["Calm", "Urgent"]);

  const whisperProfile = await service.createTtsProfile({
    active: true,
    emotionSettings: [{
      emotion: "whisper",
      emotionLabel: "Whisper",
      pitch: 0.95,
      rate: 0.9,
      volume: 0.55,
    }],
    language: "en-US",
    name: "Whisper Test Profile",
    pitch: 1,
    providerKey: "browser-speech",
    rate: 1,
    voiceName: "Default browser voice",
    volume: 1,
  });

  await assert.rejects(
    () => service.createMessage({
      emotionProfileKey: urgent.key,
      messageText: "Wrong scoped emotion.",
      name: "Wrong Scoped Emotion",
      voiceProfileKey: whisperProfile.key,
    }),
    /Add this Emotion Profile to the selected TTS Profile/,
  );

  const categoryKey = await service.defaultMessageCategoryKey();
  await postgresClient.requestTable("messages_records", {
    body: datedRow({
      categoryKey,
      emotionProfileKey: whisper.key,
      key: "message-profile-emotion-missing",
      messageText: "Publish should catch missing profile emotion.",
      name: "Missing Profile Emotion Setting",
      notes: "",
      voiceProfileKey: defaultProfile.key,
    }),
    method: "POST",
  });

  const validation = await service.validateMessagePublishConfiguration();
  assert.equal(validation.valid, false);
  assert.ok(validation.issues.some((issue) => issue.code === "profile-emotion-missing"));
  assert.ok(validation.issues.some((issue) => issue.message === "Add this Emotion Profile to the selected TTS Profile before publishing."));
  service.close();
});

test("Messages TTS profile saves accept creator-facing Emotion labels and protect referenced settings", async () => {
  const { service } = createServiceHarness();

  const created = await service.createTtsProfile({
    active: true,
    emotionSettings: [{
      emotion: "calm",
      emotionLabel: "Calm",
      pitch: 1,
      rate: 1,
      volume: 1,
    }],
    language: "en-US",
    name: "Quest Profile",
    pitch: 1,
    providerKey: "browser-speech",
    rate: 1,
    voiceName: "Browser guide updated",
    volume: 1,
  });
  assert.deepEqual(created.emotionSettings.map((setting) => setting.emotionLabel), ["Calm"]);

  const updated = await service.updateTtsProfile(created.key, {
    ...created,
    emotionSettings: [
      ...created.emotionSettings,
      {
        emotion: "urgent",
        emotionLabel: "Urgent",
        pitch: 1.2,
        rate: 1.1,
        volume: 0.7,
      },
    ],
  });
  const urgent = updated.emotionSettings.find((setting) => setting.emotionLabel === "Urgent");
  assert.ok(urgent);
  assert.equal(urgent.pitch, 1.2);
  assert.equal(urgent.rate, 1.1);
  assert.equal(urgent.volume, 0.7);

  await service.createMessage({
    emotionProfileKey: urgent.key,
    messageText: "Quest profile line.",
    name: "Quest Profile Message",
    voiceProfileKey: updated.key,
  });
  await assert.rejects(
    () => service.updateTtsProfile(updated.key, {
      ...updated,
      emotionSettings: updated.emotionSettings.filter((setting) => setting.key !== urgent.key),
    }),
    /Emotion Profile Urgent is referenced/,
  );
  service.close();
});

test("Messages API requires sign-in for Text To Speech profile and emotion writes", async () => {
  const { service } = createServiceHarness();

  await assert.rejects(
    () => handleMessagesApiContract({
      body: {
        language: "en-US",
        name: "Guest TTS Profile",
        providerKey: "browser-speech",
        voiceName: "Default browser voice",
      },
      method: "POST",
      parts: ["tts-profiles"],
      service,
    }),
    /Sign in required to save Text To Speech profiles and emotions/,
  );
  await assert.rejects(
    () => handleMessagesApiContract({
      body: {
        name: "Guest Emotion Profile",
        pitch: 1,
        rate: 1,
        volume: 1,
      },
      method: "POST",
      parts: ["emotion-profiles"],
      service,
    }),
    /Sign in required to save Text To Speech profiles and emotions/,
  );

  const authenticated = await handleMessagesApiContract({
    actorKey: "test-author",
    body: {
      emotionSettings: [{
        emotion: "calm",
        emotionLabel: "Calm",
        pitch: 1,
        rate: 1,
        volume: 1,
      }],
      language: "en-US",
      name: "Authenticated TTS Profile",
      pitch: 1,
      providerKey: "browser-speech",
      rate: 1,
      voiceName: "Default browser voice",
      volume: 1,
    },
    method: "POST",
    parts: ["tts-profiles"],
    service,
  });
  assert.equal(authenticated.ttsProfile.name, "Authenticated TTS Profile");
  service.close();
});

test("Messages API requires sign-in for Message and sentence writes", async () => {
  const { service } = createServiceHarness();
  const voice = await createWorkingTtsProfile(service, { name: "Authenticated Message Profile" });
  const emotion = voice.emotionSettings.find((setting) => setting.emotionLabel === "Calm");
  assert.ok(emotion);

  const messagePayload = {
    emotionProfileKey: emotion.key,
    messageText: "Authenticated message text.",
    name: "Authenticated Message",
    speaker: "Guide",
    trigger: "quest.start",
    typewriterSpeed: 22,
    voiceProfileKey: voice.key,
  };

  await assert.rejects(
    () => handleMessagesApiContract({
      body: messagePayload,
      method: "POST",
      parts: ["messages"],
      service,
    }),
    /Sign in required to save Messages through the API/,
  );

  const created = await handleMessagesApiContract({
    actorKey: "test-author",
    body: messagePayload,
    method: "POST",
    parts: ["messages"],
    service,
  });
  assert.equal(created.message.name, "Authenticated Message");
  assert.equal(created.message.messageText, "Authenticated message text.");
  assert.equal(created.message.speaker, "Guide");
  assert.equal(created.message.trigger, "quest.start");
  assert.equal(created.message.typewriterSpeed, 22);

  const segmentPayload = {
    displayOrder: 1,
    emotionProfileKey: emotion.key,
    messageKey: created.message.key,
    segmentText: "Authenticated sentence text.",
    voiceProfileKey: voice.key,
  };

  await assert.rejects(
    () => handleMessagesApiContract({
      body: segmentPayload,
      method: "POST",
      parts: ["segments"],
      service,
    }),
    /Sign in required to save Messages through the API/,
  );

  const segment = await handleMessagesApiContract({
    actorKey: "test-author",
    body: segmentPayload,
    method: "POST",
    parts: ["segments"],
    service,
  });
  assert.equal(segment.segment.segmentText, "Authenticated sentence text.");
  service.close();
});
