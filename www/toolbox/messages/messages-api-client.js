import {
  requireServerApiData,
  safeRequestServerApi,
} from "../../../src/api/server-api-client.js";

function readData(path, context) {
  return requireServerApiData(safeRequestServerApi(path), context);
}

function writeData(path, body, context) {
  return requireServerApiData(
    safeRequestServerApi(path, {
      body,
      method: "POST",
    }),
    context,
  );
}

function actionData(path, context) {
  return requireServerApiData(
    safeRequestServerApi(path, {
      method: "POST",
    }),
    context,
  );
}

export function listEmotionProfiles() {
  return readData("/messages/emotion-profiles", "Messages emotion profiles");
}

export function getEmotionProfile(profileKey) {
  return readData(`/messages/emotion-profiles/${encodeURIComponent(profileKey)}`, "Messages emotion profile");
}

export function createEmotionProfile(input) {
  return writeData("/messages/emotion-profiles", input, "Create emotion profile");
}

export function updateEmotionProfile(profileKey, input) {
  return writeData(`/messages/emotion-profiles/${encodeURIComponent(profileKey)}`, input, "Update emotion profile");
}

export function deleteEmotionProfile(profileKey) {
  return actionData(`/messages/emotion-profiles/${encodeURIComponent(profileKey)}/delete`, "Delete emotion profile");
}

export function listTtsProfiles() {
  return readData("/messages/tts-profiles", "Messages TTS profiles");
}

export function getTtsProfile(profileKey) {
  return readData(`/messages/tts-profiles/${encodeURIComponent(profileKey)}`, "Messages TTS profile");
}

export function createTtsProfile(input) {
  return writeData("/messages/tts-profiles", input, "Create TTS profile");
}

export function updateTtsProfile(profileKey, input) {
  return writeData(`/messages/tts-profiles/${encodeURIComponent(profileKey)}`, input, "Update TTS profile");
}

export function deleteTtsProfile(profileKey) {
  return actionData(`/messages/tts-profiles/${encodeURIComponent(profileKey)}/delete`, "Delete TTS profile");
}

export function listMessages() {
  return readData("/messages/messages", "Messages list");
}

export function validatePublishConfiguration() {
  return readData("/messages/publish-validation", "Messages publish validation");
}

export function getMessage(messageKey) {
  return readData(`/messages/messages/${encodeURIComponent(messageKey)}`, "Message record");
}

export function createMessage(input) {
  return writeData("/messages/messages", input, "Create message");
}

export function updateMessage(messageKey, input) {
  return writeData(`/messages/messages/${encodeURIComponent(messageKey)}`, input, "Update message");
}

export function deleteMessage(messageKey) {
  return actionData(`/messages/messages/${encodeURIComponent(messageKey)}/delete`, "Delete message");
}

export function listMessageSegments() {
  return readData("/messages/segments", "Message segments list");
}

export function getMessageSegment(segmentKey) {
  return readData(`/messages/segments/${encodeURIComponent(segmentKey)}`, "Message segment");
}

export function createMessageSegment(input) {
  return writeData("/messages/segments", input, "Create message segment");
}

export function updateMessageSegment(segmentKey, input) {
  return writeData(`/messages/segments/${encodeURIComponent(segmentKey)}`, input, "Update message segment");
}

export function deleteMessageSegment(segmentKey) {
  return actionData(`/messages/segments/${encodeURIComponent(segmentKey)}/delete`, "Delete message segment");
}
