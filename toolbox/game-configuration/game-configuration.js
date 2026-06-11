import {
  GAME_CONFIGURATION_SECTIONS,
  createGameConfigurationApiRepository
} from "./game-configuration-api-client.js";

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
  gameRules: document.querySelector("[data-game-configuration-game-rules]"),
  handoffContext: document.querySelector("[data-game-configuration-handoff-context]"),
  handoffOverlay: document.querySelector("[data-game-configuration-handoff-overlay]"),
  missingItems: document.querySelector("[data-game-configuration-output-missing]"),
  objectSetup: document.querySelector("[data-game-configuration-object-setup]"),
  outputCapability: document.querySelector("[data-game-configuration-output-capability]"),
  outputNextStep: document.querySelector("[data-game-configuration-output-next-step]"),
  outputPlayerMode: document.querySelector("[data-game-configuration-output-player-mode]"),
  outputReadiness: document.querySelector("[data-game-configuration-output-readiness]"),
  outputSummary: document.querySelector("[data-game-configuration-output-summary]"),
  playerSetup: document.querySelector("[data-game-configuration-player-setup]"),
  progressCurrentFocus: document.querySelector("[data-game-configuration-current-focus]"),
  progressGame: document.querySelector("[data-game-configuration-game-progress]"),
  progressPublishing: document.querySelector("[data-game-configuration-publishing-progress]"),
  progressRecommended: document.querySelectorAll("[data-game-configuration-recommended-tool]"),
  statusLog: document.querySelector("[data-game-configuration-log]"),
  testReadiness: document.querySelector("[data-game-configuration-test-readiness]"),
  validationList: document.querySelector("[data-game-configuration-validation-list]"),
  validationOverlay: document.querySelector("[data-game-configuration-validation-overlay]"),
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

function createListItem(text) {
  const item = document.createElement("li");
  item.textContent = text;
  return item;
}

function readForm() {
  return {
    audioSetup: elements.audioSetup?.value,
    gameBasics: elements.gameBasics?.value,
    gameRules: elements.gameRules?.value,
    objectSetup: elements.objectSetup?.value,
    playerSetup: elements.playerSetup?.value,
    testReadiness: elements.testReadiness?.value,
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

function renderOutput(snapshot) {
  const configuration = snapshot.configuration;
  const validation = snapshot.validation;
  const missing = validation.findings.map((finding) => finding.label).join(", ");
  const summary = configuration?.gameBasics || "No configuration summary saved yet.";
  const activeGame = snapshot.handoff.activeGame || snapshot.handoff.activeProject;
  const capability = activeGame?.purpose === "Capability Demo"
    ? `${activeGame.name} remains a game-owned capability demo.`
    : "Standard game configuration.";

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
  const snapshot = repository.getSnapshot();
  const projectId = snapshot.handoff.activeProject?.id || "";

  if (!snapshot.handoff.ready || !projectId) {
    setText(elements.statusLog, "Complete a valid Game Design before saving Game Configuration.");
    render();
    return;
  }

  const configuration = repository.updateConfiguration(projectId, readForm());
  const nextSnapshot = repository.getSnapshot();
  const message = configuration?.status === "Ready"
    ? "Saved Game Configuration as ready. Assets is the recommended next tool."
    : `Saved Game Configuration with ${nextSnapshot.validation.findings.length} missing item${nextSnapshot.validation.findings.length === 1 ? "" : "s"}.`;

  setText(elements.statusLog, message);
  render();
});

render();
