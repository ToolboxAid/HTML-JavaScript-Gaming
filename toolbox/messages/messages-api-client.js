import {
  requireServerApiData,
  safeRequestServerApi,
} from "../../src/api/server-api-client.js";

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

export function listMessageCategories() {
  return readData("/messages/categories", "Messages categories");
}

export function createMessageCategory(input) {
  return writeData("/messages/categories", input, "Create message category");
}

export function updateMessageCategory(categoryKey, input) {
  return writeData(`/messages/categories/${encodeURIComponent(categoryKey)}`, input, "Update message category");
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

export function listMessages() {
  return readData("/messages/messages", "Messages list");
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
