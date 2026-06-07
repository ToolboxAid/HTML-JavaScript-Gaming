import {
  getSessionCurrent,
  getSessionModes,
  getSessionUsers,
  setSessionMode,
  setSessionUser,
} from "../../engine/api/session-api-client.js";

const modeButtons = Array.from(document.querySelectorAll("[data-login-mode]"));
const modeTitle = document.querySelector("[data-login-mode-title]");
const modeDescription = document.querySelector("[data-login-mode-description]");
const modeStatus = document.querySelector("[data-login-mode-status]");
const userControls = document.querySelector("[data-login-user-controls]");
const userStatus = document.querySelector("[data-login-user-status]");
const continueLink = document.querySelector("[data-login-continue]");

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

function renderModeButtons(mode) {
  modeButtons.forEach((button) => {
    setSelectedButton(button, button.dataset.loginMode === mode.id);
  });
}

function renderUserButtons(mode) {
  if (!userControls) {
    return;
  }

  userControls.replaceChildren();
  if (mode.id === "dev") {
    userControls.hidden = true;
    if (userStatus) {
      userStatus.textContent = "DEV mode uses read-only/demo JSON access. No users are selectable.";
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

function render() {
  const session = getSessionCurrent();
  const mode = getSessionModes().find((item) => item.id === session.mode) || { id: session.mode, label: session.mode, description: "" };
  renderModeButtons(mode);
  if (modeTitle) {
    modeTitle.textContent = mode.label;
  }
  if (modeDescription) {
    modeDescription.textContent = mode.description;
  }
  if (modeStatus) {
    modeStatus.textContent = `${mode.label} mode selected.`;
  }
  renderUserButtons(mode);
  updateContinueLink();
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setSessionMode(button.dataset.loginMode || "local");
    dispatchModeChanged();
    render();
  });
});

userControls?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-login-user]");
  if (!button) {
    return;
  }
  setSessionMode("local");
  setSessionUser(button.dataset.loginUser || "");
  dispatchSessionChanged();
  render();
});

render();
