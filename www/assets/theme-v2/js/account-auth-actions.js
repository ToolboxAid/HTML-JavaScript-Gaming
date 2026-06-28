import {
  ACCOUNT_SERVICE_READY_MESSAGE,
  accountActionFailureMessage,
  accountActionUnavailableMessage,
  requestAccountAuth,
} from "./account-auth-service.js";

const form = document.querySelector("[data-account-auth-form]");
const emailField = document.querySelector("[data-account-auth-email]");
const passwordField = document.querySelector("[data-account-auth-password]");
const statusField = document.querySelector("[data-account-auth-status]");
const submitButton = document.querySelector("[data-account-auth-submit]");
const action = form?.getAttribute("data-account-auth-form") || "";
let authStatus = null;

function setStatus(message) {
  if (statusField) {
    statusField.textContent = message;
  }
}

function setFormEnabled(enabled) {
  if (submitButton) {
    submitButton.disabled = !enabled;
  }
}

function unavailableStatusMessage() {
  return accountActionUnavailableMessage(action);
}

async function refreshAccountAuthStatus() {
  try {
    authStatus = await requestAccountAuth("status", {}, unavailableStatusMessage());
    setFormEnabled(Boolean(authStatus.ready));
    setStatus(authStatus.ready ? ACCOUNT_SERVICE_READY_MESSAGE : unavailableStatusMessage());
  } catch {
    authStatus = {
      ready: false,
      message: unavailableStatusMessage(),
    };
    setFormEnabled(false);
    setStatus(authStatus.message);
  }
  return authStatus;
}

function actionEndpoint() {
  if (action === "create-account") {
    return "create-account";
  }
  if (action === "password-reset") {
    return "password-reset";
  }
  return "";
}

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  Promise.resolve(authStatus || refreshAccountAuthStatus())
    .then((status) => {
      if (!status?.ready) {
        setStatus(unavailableStatusMessage());
        return null;
      }
      const endpoint = actionEndpoint();
      if (!endpoint) {
        throw new Error(accountActionFailureMessage(action));
      }
      const body = {
        email: emailField?.value || "",
      };
      if (passwordField) {
        body.password = passwordField.value || "";
      }
      return requestAccountAuth(endpoint, {
        body,
        method: "POST",
      }, accountActionFailureMessage(action));
    })
    .then((result) => {
      if (result) {
        setStatus(result.message || "Account action completed.");
      }
    })
    .catch((error) => {
      setStatus(error instanceof Error ? error.message : accountActionFailureMessage(action));
    });
});

refreshAccountAuthStatus();
