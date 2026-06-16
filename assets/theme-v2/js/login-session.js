const continueLink = document.querySelector("[data-login-continue]");
const form = document.querySelector("[data-login-form]");
const identityField = document.querySelector("[data-login-identity]");
const passwordField = document.querySelector("[data-login-password]");
const statusField = document.querySelector("[data-login-status]");
const submitButton = document.querySelector("[data-login-submit]");
const ACCOUNT_IDENTITY_SETUP_MESSAGE = "Account identity setup is incomplete. Please contact support.";
const AUTH_UNAVAILABLE_MESSAGE = "The site is currently unavailable. Please try again later.";
const SIGN_IN_PLACEHOLDER_MESSAGE = "Sign In is not available in this preview. You can continue browsing.";
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

function isStaticOnlyLocalEntrypoint() {
  return ["127.0.0.1", "localhost"].includes(window.location.hostname) &&
    window.location.port === "5500";
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

async function requestCurrentSession() {
  const response = await fetch("/api/session/current", {
    headers: { "accept": "application/json" },
    method: "GET",
  });
  return readJson(response, AUTH_UNAVAILABLE_MESSAGE);
}

function unavailableStatusMessage() {
  return SIGN_IN_PLACEHOLDER_MESSAGE;
}

async function refreshAccountAuthStatus() {
  if (isStaticOnlyLocalEntrypoint()) {
    authStatus = {
      ready: false,
      message: SIGN_IN_PLACEHOLDER_MESSAGE,
    };
    setFormEnabled(false);
    setStatus(authStatus.message);
    return authStatus;
  }
  try {
    authStatus = await requestAccountAuth("status");
    if (authStatus.ready) {
      const session = await requestCurrentSession();
      if (session?.authenticated) {
        setFormEnabled(false);
        setStatus(`Signed in as ${session.displayName || session.label || "Account"}.`);
        return authStatus;
      }
    }
    setFormEnabled(Boolean(authStatus.ready));
    setStatus(authStatus.ready ? "Account service is available." : unavailableStatusMessage());
  } catch {
    authStatus = {
      ready: false,
      message: SIGN_IN_PLACEHOLDER_MESSAGE,
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
      return requestAccountAuth("sign-in", {
        body: {
          identity: identityField?.value || "",
          password: passwordField?.value || "",
        },
        method: "POST",
      });
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
      setStatus(error instanceof Error ? error.message : AUTH_UNAVAILABLE_MESSAGE);
    });
});

refreshAccountAuthStatus();
