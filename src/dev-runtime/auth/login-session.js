import {
  getMockDbSessionMode,
  getMockDbSessionUser,
  getMockDbSessionUsers,
  getStandaloneMockDbTables,
  setMockDbSessionMode,
  setMockDbSessionUser,
} from "../persistence/mock-db-store.js";

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

  getStandaloneMockDbTables();
  userControls.hidden = false;
  const sessionUser = getMockDbSessionUser();
  getMockDbSessionUsers().forEach((user) => {
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
  const mode = getMockDbSessionMode();
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
    const mode = setMockDbSessionMode(button.dataset.loginMode || "local");
    if (mode.id === "local") {
      getStandaloneMockDbTables();
    }
    render();
  });
});

userControls?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-login-user]");
  if (!button) {
    return;
  }
  setMockDbSessionMode("local");
  getStandaloneMockDbTables();
  setMockDbSessionUser(button.dataset.loginUser || "");
  render();
});

render();
