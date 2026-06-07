import {
  getSessionCurrent,
  getSessionModes,
  getSessionUsers,
  setSessionMode,
  setSessionUser,
} from "../../../src/engine/api/session-api-client.js";

const modeButtons = Array.from(document.querySelectorAll("[data-login-mode]"));
const modeTitle = document.querySelector("[data-login-mode-title]");
const modeDescription = document.querySelector("[data-login-mode-description]");
const modeStatus = document.querySelector("[data-login-mode-status]");
const userControls = document.querySelector("[data-login-user-controls]");
const userStatus = document.querySelector("[data-login-user-status]");
const continueLink = document.querySelector("[data-login-continue]");
const staticModeDetails = {
  "local-mem": {
    description: "Uses MockDbAdapter backed by in-memory lists when the API-backed local server is running.",
    diagnostic: "Static-only server detected. Local Mem selection remains available, but local users and persistence require the API-backed local server.",
    environment: "Local Mem",
    id: "local-mem",
    label: "Local Mem",
    persistence: "Memory",
  },
  "local-db": {
    description: "Uses LocalDbAdapter backed by server SQLite storage.",
    diagnostic: "Static-only server detected. Local DB requires the API-backed local server; start the local server API to use SQLite-backed Local DB.",
    environment: "Local DB",
    id: "local-db",
    label: "Local DB",
    persistence: "Local DB",
  },
};
let staticApiUnavailable = false;
let staticModeId = "local-mem";
let staticApiDiagnostic = "";

function currentReturnTo() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get("returnTo") || "";
  if (!value || value.startsWith("/") || value.includes("://") || value.includes("..")) {
    return "toolbox/index.html";
  }
  return value;
}

function updateContinueLink() {
  if (continueLink) {
    continueLink.href = currentReturnTo();
  }
}

function dispatchSessionChanged() {
  window.dispatchEvent(new CustomEvent("gamefoundry:mock-db-session-user-changed", {
    detail: getSessionCurrent(),
  }));
}

function dispatchModeChanged() {
  window.dispatchEvent(new CustomEvent("gamefoundry:mock-db-session-mode-changed", {
    detail: getSessionCurrent(),
  }));
}

function setSelectedButton(button, selected) {
  button.classList.toggle("primary", selected);
  button.setAttribute("aria-pressed", String(selected));
  if (selected) {
    button.setAttribute("aria-current", "true");
  } else {
    button.removeAttribute("aria-current");
  }
}

function renderUserButtons(mode) {
  if (!userControls) {
    return;
  }

  userControls.replaceChildren();
  if (mode.usersEnabled === false) {
    userControls.hidden = true;
    if (userStatus) {
      userStatus.textContent = mode.diagnostic || "No local users are selectable for this environment.";
    }
    return;
  }

  userControls.hidden = false;
  const sessionUser = getSessionCurrent();
  getSessionUsers().forEach((user) => {
    const button = document.createElement("button");
    button.className = "btn btn--compact";
    button.type = "button";
    button.textContent = user.label;
    button.dataset.loginUser = user.userKey || "";
    setSelectedButton(button, (user.userKey || "") === (sessionUser.userKey || ""));
    userControls.append(button);
  });
  if (userStatus) {
    userStatus.textContent = sessionUser.userKey
      ? `Selected local user: ${sessionUser.label}.`
      : "Guest is unauthenticated and is not stored in the users table.";
  }
}

function renderModeButtons(mode) {
  modeButtons.forEach((button) => {
    button.disabled = false;
    button.removeAttribute("aria-disabled");
    setSelectedButton(button, button.dataset.loginMode === mode.id);
  });
}

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error || "Session API unavailable.");
}

function isStaticApiUnavailable(message) {
  return message.includes("Local server API route unavailable") ||
    message.includes("/api/session") && message.includes("(404)");
}

function renderStaticApiUnavailable(modeId, error) {
  const mode = staticModeDetails[modeId] || staticModeDetails["local-mem"];
  staticApiUnavailable = true;
  staticModeId = mode.id;
  staticApiDiagnostic = errorMessage(error);
  renderModeButtons(mode);
  if (userControls) {
    userControls.replaceChildren();
    userControls.hidden = true;
  }
  if (modeTitle) {
    modeTitle.textContent = mode.label;
  }
  if (modeDescription) {
    modeDescription.textContent = mode.description;
  }
  if (modeStatus) {
    modeStatus.textContent = `Environment: ${mode.environment}. Persistence: ${mode.persistence}. Diagnostic: ${mode.diagnostic} ${staticApiDiagnostic}`;
  }
  if (userStatus) {
    userStatus.textContent = "No local users are available because the API-backed local server is unavailable.";
  }
  updateContinueLink();
}

function renderError(error) {
  const message = errorMessage(error);
  if (isStaticApiUnavailable(message)) {
    renderStaticApiUnavailable(staticModeId, error);
    return;
  }
  modeButtons.forEach((button) => {
    button.disabled = false;
    button.removeAttribute("aria-disabled");
  });
  if (userControls) {
    userControls.replaceChildren();
    userControls.hidden = true;
  }
  if (modeTitle) {
    modeTitle.textContent = "Session API unavailable";
  }
  if (modeDescription) {
    modeDescription.textContent = "Start the local server API to select a session.";
  }
  if (modeStatus) {
    modeStatus.textContent = `Login/session diagnostic: ${message}`;
  }
  if (userStatus) {
    userStatus.textContent = "No local users are available until /api/session responds.";
  }
  updateContinueLink();
}

function render() {
  try {
    const session = getSessionCurrent();
    staticApiUnavailable = false;
    const mode = getSessionModes().find((item) => item.id === session.mode) || {
      description: "",
      id: session.mode,
      label: session.mode,
    };
    renderModeButtons(mode);
    if (modeTitle) {
      modeTitle.textContent = mode.label;
    }
    if (modeDescription) {
      modeDescription.textContent = mode.description;
    }
    if (modeStatus) {
      const environment = session.environment || mode.environment || mode.label;
      const persistence = session.persistence || mode.persistence || "";
      const statusParts = [`Environment: ${environment}`];
      if (persistence) {
        statusParts.push(`Persistence: ${persistence}`);
      }
      if (session.diagnostic || mode.diagnostic) {
        statusParts.push(`Diagnostic: ${session.diagnostic || mode.diagnostic}`);
      }
      modeStatus.textContent = statusParts.join(". ") + ".";
    }
    renderUserButtons(mode);
    updateContinueLink();
  } catch (error) {
    renderError(error);
  }
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const modeId = button.dataset.loginMode || "local-mem";
    if (staticApiUnavailable) {
      renderStaticApiUnavailable(modeId, staticApiDiagnostic);
      return;
    }
    try {
      setSessionMode(modeId);
      dispatchModeChanged();
      render();
    } catch (error) {
      staticModeId = modeId;
      renderError(error);
    }
  });
});

userControls?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-login-user]");
  if (!button) {
    return;
  }
  try {
    setSessionUser(button.dataset.loginUser || "");
    dispatchSessionChanged();
    render();
  } catch (error) {
    renderError(error);
  }
});

render();
