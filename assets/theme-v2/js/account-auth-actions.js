const form = document.querySelector("[data-account-auth-form]");
const emailField = document.querySelector("[data-account-auth-email]");
const passwordField = document.querySelector("[data-account-auth-password]");
const statusField = document.querySelector("[data-account-auth-status]");
const submitButton = document.querySelector("[data-account-auth-submit]");
const action = form?.getAttribute("data-account-auth-form") || "";
let supabaseStatus = null;

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
    throw new Error(payload?.error || fallbackMessage);
  }
  return payload?.data || {};
}

async function requestSupabaseAuth(path, options = {}) {
  const response = await fetch(`/api/auth/dev/supabase/${path}`, {
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers: options.body ? { "content-type": "application/json" } : undefined,
    method: options.method || "GET",
  });
  return readJson(response, "DEV Supabase Auth API is unavailable. Start the API-backed local server.");
}

function unavailableMessage(status) {
  return status?.message || "DEV Supabase Auth is unavailable. Configure GAMEFOUNDRY_SUPABASE_URL and GAMEFOUNDRY_SUPABASE_ANON_KEY on the local server.";
}

async function refreshSupabaseStatus() {
  if (isStaticOnlyLocalEntrypoint()) {
    supabaseStatus = {
      ready: false,
      message: "Start the DEV API server to use Supabase Auth. Guest browsing remains available.",
    };
    setFormEnabled(false);
    setStatus(supabaseStatus.message);
    return supabaseStatus;
  }
  try {
    supabaseStatus = await requestSupabaseAuth("status");
    setFormEnabled(Boolean(supabaseStatus.ready));
    setStatus(supabaseStatus.ready ? "DEV Supabase Auth is ready." : unavailableMessage(supabaseStatus));
  } catch (error) {
    supabaseStatus = {
      ready: false,
      message: error instanceof Error ? error.message : String(error || "DEV Supabase Auth status failed."),
    };
    setFormEnabled(false);
    setStatus(supabaseStatus.message);
  }
  return supabaseStatus;
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
  Promise.resolve(supabaseStatus || refreshSupabaseStatus())
    .then((status) => {
      if (!status?.ready) {
        setStatus(unavailableMessage(status));
        return null;
      }
      const endpoint = actionEndpoint();
      if (!endpoint) {
        throw new Error("Unknown account action.");
      }
      return requestSupabaseAuth(endpoint, {
        body: {
          email: emailField?.value || "",
          password: passwordField?.value || "",
        },
        method: "POST",
      });
    })
    .then((result) => {
      if (result) {
        setStatus(result.message || "Supabase Auth action completed.");
      }
    })
    .catch((error) => {
      setStatus(error instanceof Error ? error.message : String(error || "Supabase Auth action failed."));
    });
});

refreshSupabaseStatus();
