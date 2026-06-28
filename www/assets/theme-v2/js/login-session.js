import {
  ACCOUNT_SERVICE_READY_MESSAGE,
  accountActionFailureMessage,
  accountActionUnavailableMessage,
  requestAccountAuth,
  requestCurrentSession,
} from "./account-auth-service.js";

const continueLink = document.querySelector("[data-login-continue]");
const form = document.querySelector("[data-login-form]");
const identityField = document.querySelector("[data-login-identity]");
const passwordField = document.querySelector("[data-login-password]");
const statusField = document.querySelector("[data-login-status]");
const submitButton = document.querySelector("[data-login-submit]");
const SIGN_IN_ACTION = "sign-in";
let authStatus = null;

function rootPrefix() {
  const rootSegments = new Set([
    "account",
    "admin",
    "company",
    "community",
    "docs",
    "games",
    "learn",
    "legal",
    "marketplace",
    "toolbox",
  ]);
  const parts = window.location.pathname.split("/").filter(Boolean);
  const rootIndex = parts.findIndex((part) => rootSegments.has(part));
  const pageParts = rootIndex >= 0 ? parts.slice(rootIndex) : [parts[parts.length - 1] || "index.html"];
  return pageParts.length > 1 ? "../".repeat(pageParts.length - 1) : "";
}

function repoPathHref(path) {
  const normalizedPath = String(path || "").replace(/^\/+/, "");
  return normalizedPath ? rootPrefix() + normalizedPath : "#";
}

function currentReturnTo() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get("returnTo") || "";
  if (!value || value.startsWith("/") || value.includes("://") || value.includes("..")) {
    return repoPathHref("toolbox/index.html");
  }
  return repoPathHref(value);
}

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
  return accountActionUnavailableMessage(SIGN_IN_ACTION);
}

async function refreshAccountAuthStatus() {
  try {
    authStatus = await requestAccountAuth("status", {}, unavailableStatusMessage());
    if (authStatus.ready) {
      const session = await requestCurrentSession(accountActionFailureMessage(SIGN_IN_ACTION));
      if (session?.authenticated) {
        setFormEnabled(false);
        setStatus(`Signed in as ${session.displayName || session.label || "Account"}.`);
        return authStatus;
      }
    }
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

if (continueLink) {
  continueLink.href = currentReturnTo();
}

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  Promise.resolve(refreshAccountAuthStatus())
    .then((status) => {
      if (!status?.ready) {
        setStatus(unavailableStatusMessage());
        return null;
      }
      return requestAccountAuth(SIGN_IN_ACTION, {
        body: {
          identity: identityField?.value || "",
          password: passwordField?.value || "",
        },
        method: "POST",
      }, accountActionFailureMessage(SIGN_IN_ACTION));
    })
    .then((result) => {
      if (result) {
        setStatus(result.sessionResolved ? "Signed in." : result.message || "Account authentication completed.");
        if (result.sessionResolved) {
          window.location.assign(currentReturnTo());
        }
      }
    })
    .catch((error) => {
      setStatus(error instanceof Error ? error.message : accountActionFailureMessage(SIGN_IN_ACTION));
    });
});

refreshAccountAuthStatus();
