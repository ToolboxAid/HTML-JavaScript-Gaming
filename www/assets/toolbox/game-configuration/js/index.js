import { getSessionCurrent } from "../../../../../src/api/session-api-client.js";
import {
  createServerRepositoryClient,
  readServerToolConstants,
  requireServerConstant,
} from "../../../../../src/api/server-api-client.js";

const constants = readServerToolConstants("game-configuration");

export const GAME_CONFIGURATION_SECTIONS = Object.freeze(requireServerConstant(constants, "GAME_CONFIGURATION_SECTIONS", "game-configuration"));
export const GAME_CONFIGURATION_PLAYER_MODES = Object.freeze(requireServerConstant(constants, "GAME_CONFIGURATION_PLAYER_MODES", "game-configuration"));

export function createGameConfigurationApiRepository(options = {}) {
  return createServerRepositoryClient("game-configuration", options);
}

const repository = createGameConfigurationApiRepository();
const params = new URLSearchParams(window.location.search);
const handoffMode = params.get("handoff");
const requestedGame = params.get("game") || params.get("project") || "";

if (handoffMode === "missing") {
  repository.makeMissingGameDesign();
} else if (handoffMode === "invalid") {
  repository.makeInvalidGameDesign(requestedGame);
} else {
  repository.makeValidGameDesign(requestedGame);
}

const elements = {
  audioSetup: document.querySelector("[data-game-configuration-audio-setup]"),
  configurationStatus: document.querySelector("[data-game-configuration-status]"),
  form: document.querySelector("[data-game-configuration-form]"),
  formCard: document.querySelector("[data-game-configuration-form-card]"),
  gameBasics: document.querySelector("[data-game-configuration-game-basics]"),
  gameDetails: document.querySelector("[data-game-configuration-game-details]"),
  gameName: document.querySelector("[data-game-configuration-game-name]"),
  gameRules: document.querySelector("[data-game-configuration-game-rules]"),
  gameType: document.querySelector("[data-game-configuration-game-type]"),
  handoffContext: document.querySelector("[data-game-configuration-handoff-context]"),
  handoffOverlay: document.querySelector("[data-game-configuration-handoff-overlay]"),
  missingItems: document.querySelector("[data-game-configuration-output-missing]"),
  objectSetup: document.querySelector("[data-game-configuration-object-setup]"),
  outputCapability: document.querySelector("[data-game-configuration-output-capability]"),
  outputDetails: document.querySelector("[data-game-configuration-output-details]"),
  outputGameType: document.querySelector("[data-game-configuration-output-game-type]"),
  outputName: document.querySelector("[data-game-configuration-output-name]"),
  outputNextStep: document.querySelector("[data-game-configuration-output-next-step]"),
  outputPlatforms: document.querySelector("[data-game-configuration-output-platforms]"),
  outputPlayerMode: document.querySelector("[data-game-configuration-output-player-mode]"),
  outputReadiness: document.querySelector("[data-game-configuration-output-readiness]"),
  outputResolution: document.querySelector("[data-game-configuration-output-resolution]"),
  outputStartup: document.querySelector("[data-game-configuration-output-startup]"),
  outputSummary: document.querySelector("[data-game-configuration-output-summary]"),
  outputVersion: document.querySelector("[data-game-configuration-output-version]"),
  outputVisibility: document.querySelector("[data-game-configuration-output-visibility]"),
  platforms: document.querySelector("[data-game-configuration-platforms]"),
  playerSetup: document.querySelector("[data-game-configuration-player-setup]"),
  progressCurrentFocus: document.querySelector("[data-game-configuration-current-focus]"),
  progressGame: document.querySelector("[data-game-configuration-game-progress]"),
  progressPublishing: document.querySelector("[data-game-configuration-publishing-progress]"),
  progressRecommended: document.querySelectorAll("[data-game-configuration-recommended-tool]"),
  resolution: document.querySelector("[data-game-configuration-resolution]"),
  statusLog: document.querySelector("[data-game-configuration-log]"),
  startupSettings: document.querySelector("[data-game-configuration-startup-settings]"),
  testReadiness: document.querySelector("[data-game-configuration-test-readiness]"),
  validationList: document.querySelector("[data-game-configuration-validation-list]"),
  validationOverlay: document.querySelector("[data-game-configuration-validation-overlay]"),
  version: document.querySelector("[data-game-configuration-version]"),
  visibility: document.querySelector("[data-game-configuration-visibility]"),
  worldSetup: document.querySelector("[data-game-configuration-world-setup]")
};

function setText(element, value) {
  if (element && typeof element.forEach === "function" && !element.nodeType) {
    element.forEach((item) => setText(item, value));
    return;
  }

  if (element) {
    element.textContent = value;
  }
}

function currentSession() {
  try {
    return getSessionCurrent();
  } catch {
    return { authenticated: false };
  }
}

function redirectGuestWriteAction() {
  if (currentSession()?.authenticated === true) {
    return false;
  }
  setText(elements.statusLog, "Sign in before saving Game Configuration.");
  window.location.href = new URL("/account/sign-in.html", window.location.href).href;
  return true;
}

function createListItem(text) {
  const item = document.createElement("li");
  item.textContent = text;
  return item;
}

function readForm() {
  return {
    audioSetup: elements.audioSetup?.value,
    gameBasics: elements.gameBasics?.value,
    gameDetails: elements.gameDetails?.value,
    gameRules: elements.gameRules?.value,
    objectSetup: elements.objectSetup?.value,
    platforms: elements.platforms?.value,
    playerSetup: elements.playerSetup?.value,
    resolution: elements.resolution?.value,
    startupSettings: elements.startupSettings?.value,
    testReadiness: elements.testReadiness?.value,
    version: elements.version?.value,
    visibility: elements.visibility?.value,
    worldSetup: elements.worldSetup?.value
  };
}

function clearForm() {
  GAME_CONFIGURATION_SECTIONS.forEach((section) => {
    const input = elements[section];
    if (input) {
      input.value = "";
    }
  });
  if (elements.version) {
    elements.version.value = "";
  }
  if (elements.resolution) {
    elements.resolution.value = "1280x720";
  }
  if (elements.visibility) {
    elements.visibility.value = "Private";
  }
}

function applyConfigurationToForm(configuration) {
  if (!configuration) {
    clearForm();
    return;
  }

  GAME_CONFIGURATION_SECTIONS.forEach((section) => {
    const input = elements[section];
    if (input) {
      input.value = configuration[section] || "";
    }
  });
  if (elements.version) {
    elements.version.value = configuration.version || "";
  }
  if (elements.resolution) {
    elements.resolution.value = configuration.resolution || "1280x720";
  }
  if (elements.visibility) {
    elements.visibility.value = configuration.visibility || "Private";
  }
}

function renderValidation(validation) {
  if (!elements.validationList || !elements.validationOverlay) {
    return;
  }

  elements.validationList.replaceChildren();

  if (validation.findings.length === 0) {
    elements.validationOverlay.hidden = true;
    return;
  }

  validation.findings.forEach((finding) => {
    elements.validationList.append(createListItem(`${finding.label}: ${finding.action}`));
  });
  elements.validationOverlay.hidden = false;
}

function renderHandoff(snapshot) {
  const game = snapshot.handoff.activeGame || snapshot.handoff.activeProject;
  const design = snapshot.handoff.activeDesign;
  const context = game && design
    ? `${game.name} - ${game.purpose} - ${design.gameType} / ${design.genre} / ${design.playStyle} / ${design.playerMode || "1 Player"}`
    : "No valid Game Design handoff";

  setText(elements.handoffContext, context);

  if (elements.handoffOverlay) {
    elements.handoffOverlay.hidden = snapshot.handoff.ready;
  }
  if (elements.formCard) {
    elements.formCard.hidden = !snapshot.handoff.ready;
  }
}

function inheritedGameName(snapshot) {
  return snapshot.handoff.activeProject?.name || snapshot.handoff.activeGame?.name || "";
}

function inheritedGameType(snapshot) {
  return snapshot.handoff.activeProject?.gameType || snapshot.handoff.activeDesign?.gameType || snapshot.handoff.activeProject?.purpose || "";
}

function renderOutput(snapshot) {
  const configuration = snapshot.configuration;
  const validation = snapshot.validation;
  const gameName = configuration?.gameName || inheritedGameName(snapshot);
  const gameType = inheritedGameType(snapshot);
  const missing = validation.findings.map((finding) => finding.label).join(", ");
  const summary = configuration?.gameBasics || "No configuration summary saved yet.";
  const activeGame = snapshot.handoff.activeGame || snapshot.handoff.activeProject;
  const capability = activeGame?.purpose === "Capability Demo"
    ? `${activeGame.name} remains a game-owned capability demo.`
    : "Standard game configuration.";

  setText(elements.gameName, gameName || "From Game Hub");
  setText(elements.gameType, gameType || "From Game Hub");
  setText(elements.outputName, gameName || "No game name saved yet.");
  setText(elements.outputGameType, gameType || "No game type inherited yet.");
  setText(elements.outputDetails, configuration?.gameDetails || "No game details saved yet.");
  setText(elements.outputVersion, configuration?.version || "No version saved yet.");
  setText(elements.outputResolution, configuration?.resolution || "No resolution saved yet.");
  setText(elements.outputPlatforms, configuration?.platforms || "No platforms saved yet.");
  setText(elements.outputVisibility, configuration?.visibility || "No visibility saved yet.");
  setText(elements.outputStartup, configuration?.startupSettings || "No startup settings saved yet.");
  setText(elements.outputSummary, summary);
  setText(elements.outputPlayerMode, configuration?.playerMode || snapshot.handoff.activeDesign?.playerMode || "1 Player");
  setText(elements.outputReadiness, snapshot.progressHandoff.readinessStatus);
  setText(elements.outputNextStep, snapshot.progressHandoff.recommendedNextTool);
  setText(elements.missingItems, missing || "None");
  setText(elements.outputCapability, capability);
}

function renderProgress(progress) {
  setText(elements.progressGame, progress.gameProgress || progress.projectProgress);
  setText(elements.progressPublishing, progress.publishingProgress);
  setText(elements.progressCurrentFocus, progress.currentFocus);
  setText(elements.progressRecommended, progress.recommendedNextTool);
}

function render() {
  const snapshot = repository.getSnapshot();

  setText(elements.configurationStatus, snapshot.progressHandoff.readinessStatus);
  renderHandoff(snapshot);
  applyConfigurationToForm(snapshot.configuration);
  renderValidation(snapshot.validation);
  renderOutput(snapshot);
  renderProgress(snapshot.progressHandoff);
}

function renderFormValidation() {
  const snapshot = repository.getSnapshot();
  const projectId = snapshot.handoff.activeProject?.id || "";
  const validation = repository.validateConfiguration(projectId, readForm());
  setText(elements.configurationStatus, validation.status);
  renderValidation(validation);
}

elements.form?.addEventListener("input", renderFormValidation);
elements.form?.addEventListener("change", renderFormValidation);

elements.form?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (redirectGuestWriteAction()) {
    return;
  }
  const snapshot = repository.getSnapshot();
  const projectId = snapshot.handoff.activeProject?.id || "";

  if (!snapshot.handoff.ready || !projectId) {
    setText(elements.statusLog, "Complete a valid Game Design before saving Game Configuration.");
    render();
    return;
  }

  const configuration = repository.updateConfiguration(projectId, readForm());
  const nextSnapshot = repository.getSnapshot();
  const message = configuration?.status === "Ready" || nextSnapshot.progressHandoff.readinessStatus === "Ready"
    ? "Saved Game Configuration as ready. Assets is the recommended next tool."
    : `Saved Game Configuration with ${nextSnapshot.validation.findings.length} missing item${nextSnapshot.validation.findings.length === 1 ? "" : "s"}.`;

  setText(elements.statusLog, message);
  render();
});

render();
