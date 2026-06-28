import { fetchServerApi } from "../../../../src/api/public-config-client.js";

export const ACCOUNT_SERVICE_READY_MESSAGE = "Account service is available.";
export const ACCOUNT_IDENTITY_SETUP_MESSAGE = "Account identity setup is incomplete. Please contact support.";
export const PASSWORD_RESET_RATE_LIMIT_MESSAGE = "Too many reset requests. Please wait and try again later.";

const ACTION_UNAVAILABLE_MESSAGES = Object.freeze({
  "create-account": "Create Account is not available in this preview. Please try again later.",
  "password-reset": "Password Reset is not available in this preview. Please try again later.",
  "sign-in": "Sign In is not available in this preview. You can continue browsing.",
});

const ACTION_FAILURE_MESSAGES = Object.freeze({
  "create-account": "Create Account could not be completed. Please try again later.",
  "password-reset": "Password Reset could not be completed. Please try again later.",
  "sign-in": "Sign In could not be completed. Please try again later.",
});

function actionMessage(messages, action, fallback) {
  return messages[String(action || "")] || fallback;
}

export function accountActionUnavailableMessage(action) {
  return actionMessage(
    ACTION_UNAVAILABLE_MESSAGES,
    action,
    "Account action is not available in this preview. Please try again later.",
  );
}

export function accountActionFailureMessage(action) {
  return actionMessage(
    ACTION_FAILURE_MESSAGES,
    action,
    "Account action could not be completed. Please try again later.",
  );
}

async function readJson(response, fallbackMessage) {
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  if (!response.ok || payload?.ok === false) {
    if (payload?.error === ACCOUNT_IDENTITY_SETUP_MESSAGE) {
      throw new Error(ACCOUNT_IDENTITY_SETUP_MESSAGE);
    }
    if (payload?.error === PASSWORD_RESET_RATE_LIMIT_MESSAGE) {
      throw new Error(PASSWORD_RESET_RATE_LIMIT_MESSAGE);
    }
    throw new Error(fallbackMessage);
  }
  return payload?.data || {};
}

export async function requestAccountAuth(path, options = {}, fallbackMessage = accountActionFailureMessage(path)) {
  const response = await fetchServerApi(`/auth/${path}`, {
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers: options.body ? { "content-type": "application/json" } : undefined,
    method: options.method || "GET",
  });
  return readJson(response, fallbackMessage);
}

export async function requestCurrentSession(fallbackMessage = accountActionFailureMessage("sign-in")) {
  const response = await fetchServerApi("/session/current", {
    headers: { "accept": "application/json" },
    method: "GET",
  });
  return readJson(response, fallbackMessage);
}
