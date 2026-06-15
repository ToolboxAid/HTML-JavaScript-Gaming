const form = document.querySelector("[data-account-auth-form]");
const emailField = document.querySelector("[data-account-auth-email]");
const passwordField = document.querySelector("[data-account-auth-password]");
const statusField = document.querySelector("[data-account-auth-status]");
const submitButton = document.querySelector("[data-account-auth-submit]");
const action = form?.getAttribute("data-account-auth-form") || "";
const ACCOUNT_IDENTITY_SETUP_MESSAGE = "Account identity setup is incomplete. Please contact support.";
const AUTH_UNAVAILABLE_MESSAGE = "The site is currently unavailable. Please try again later.";
let authStatus = null;

function setStatus(message) {
  if (statusField) {
    statusField.textContent = message;
  }
}

function isStaticOnlyLocalEntrypoint() {
  return ["127.0.0.1", "localhost"].includes(window.location.hostname) &&
    window.location.port === "5500";
}

function setFormEnabled(enabled) {
  if (submitButton) {
    submitButton.disabled = !enabled;
  }
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
    throw new Error(fallbackMessage);
  }
  return payload?.data || {};
}

async function requestAccountAuth(path, options = {}) {
  const response = await fetch(`/api/auth/${path}`, {
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers: options.body ? { "content-type": "application/json" } : undefined,
    method: options.method || "GET",
  });
  return readJson(response, AUTH_UNAVAILABLE_MESSAGE);
}

function unavailableMessage(status) {
  return status?.message || AUTH_UNAVAILABLE_MESSAGE;
}

async function refreshAccountAuthStatus() {
  if (isStaticOnlyLocalEntrypoint()) {
    authStatus = {
      ready: false,
      message: AUTH_UNAVAILABLE_MESSAGE,
    };
    setFormEnabled(false);
    setStatus(authStatus.message);
    return authStatus;
  }
  try {
    authStatus = await requestAccountAuth("status");
    setFormEnabled(Boolean(authStatus.ready));
    setStatus(authStatus.ready ? "Account service is available." : unavailableMessage(authStatus));
  } catch (error) {
    authStatus = {
      ready: false,
      message: error instanceof Error ? error.message : AUTH_UNAVAILABLE_MESSAGE,
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
        setStatus(unavailableMessage(status));
        return null;
      }
      const endpoint = actionEndpoint();
      if (!endpoint) {
        throw new Error("Unknown account action.");
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
      });
    })
    .then((result) => {
      if (result) {
        setStatus(result.message || "Account action completed.");
      }
    })
    .catch((error) => {
      setStatus(error instanceof Error ? error.message : AUTH_UNAVAILABLE_MESSAGE);
    });
});

refreshAccountAuthStatus();
