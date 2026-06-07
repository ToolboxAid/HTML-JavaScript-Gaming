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
const apiBackedLoginDiagnostic = "Use the API-backed local server for login.";

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

function isStaticLocalEntrypoint() {
  return ["127.0.0.1", "localhost"].includes(window.location.hostname) &&
    window.location.port === "5500";
}

function renderError(error) {
  const message = errorMessage(error);
  modeButtons.forEach((button) => {
    button.disabled = true;
    button.setAttribute("aria-disabled", "true");
    setSelectedButton(button, false);
  });
  if (userControls) {
    userControls.replaceChildren();
    userControls.hidden = true;
  }
  if (modeTitle) {
    modeTitle.textContent = "Session API required";
  }
  if (modeDescription) {
    modeDescription.textContent = "Start the API-backed local server to choose Local Mem or Local DB.";
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
  if (isStaticLocalEntrypoint()) {
    renderError(new Error(apiBackedLoginDiagnostic));
    return;
  }
  try {
    const session = getSessionCurrent();
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
    if (isStaticLocalEntrypoint()) {
      renderError(new Error(apiBackedLoginDiagnostic));
      return;
    }
    try {
      setSessionMode(modeId);
      dispatchModeChanged();
      render();
    } catch (error) {
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
