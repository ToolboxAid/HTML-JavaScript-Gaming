import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Messages playback runtime does not include preview voice validation text", async () => {
  const source = await readFile(new URL("../../../toolbox/messages/messages.js", import.meta.url), "utf8");

  assert.equal(source.includes("before preview"), false);
  assert.equal(source.includes("available browser voice before preview"), false);
  assert.equal(source.includes("Select an available browser voice before preview"), false);
});

test("Messages sentence emotion picker does not fall back to unrelated global emotions", async () => {
  const source = await readFile(new URL("../../../toolbox/messages/messages.js", import.meta.url), "utf8");

  assert.equal(source.includes("selectOptionsWithCurrent"), false);
  assert.equal(source.includes("return options.length ? options :"), false);
});

test("Messages wires profile dropdowns through the Text To Speech profile contract", async () => {
  const source = await readFile(new URL("../../../toolbox/messages/messages.js", import.meta.url), "utf8");

  assert.equal(source.includes("../text-to-speech/text2speech.js"), false);
  assert.equal(source.includes("../text-to-speech/tts-profile-store.js"), false);
  assert.equal(source.includes("../../../assets/js/shared/tts-profile-store.js"), false);
  assert.equal(source.includes("readSavedTextToSpeechProfiles"), false);
  assert.equal(source.includes("textToSpeechProfilesToMessageOptions"), false);
  assert.equal(source.includes("createMessageStudioDefaultTtsProfiles"), false);
  assert.equal(source.includes("createMessageStudioTtsProfileOptions"), false);
  assert.equal(source.includes("state.voiceProfiles = voicePayload.ttsProfiles || []"), true);
  assert.equal(source.includes("messageStudioTtsProfilesFromContract(voicePayload.ttsProfiles || [])"), false);
  assert.equal(source.includes("activeTextToSpeechProfilesForMessages(voicePayload.ttsProfiles || [])"), false);
});

test("Messages dev runtime does not import browser Text To Speech UI modules", async () => {
  const source = await readFile(new URL("../../../api/messages/messages-postgres-service.mjs", import.meta.url), "utf8");

  assert.equal(source.includes("toolbox/text-to-speech/text2speech.js"), false);
  assert.equal(source.includes("createMessageStudioDefaultTtsProfiles"), false);
  assert.equal(source.includes("createMessageStudioTtsProfileOptions"), false);
});
