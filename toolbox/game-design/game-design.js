import {
  GAME_DESIGN_GAME_TYPES,
  GAME_DESIGN_GENRES,
  GAME_DESIGN_PLAYER_MODES,
  GAME_DESIGN_PLAY_STYLES,
  createGameDesignApiRepository
} from "./game-design-api-client.js";

const repository = createGameDesignApiRepository();
const params = new URLSearchParams(window.location.search);
const requestedGame = params.get("game") || params.get("project");

if (requestedGame === "missing") {
  repository.clearGameContext();
} else if (requestedGame) {
  repository.openGameContext(requestedGame);
}

const elements = {
  capabilityDemoList: document.querySelector("[data-game-design-capability-demos]"),
  capabilityDemoNotes: document.querySelector("[data-game-design-capability-notes]"),
  capabilityDemoPanel: document.querySelector("[data-game-design-capability-panel]"),
  configurationLink: document.querySelector("[data-game-design-configuration-link]"),
  designSummary: document.querySelector("[data-game-design-summary]"),
  designStatus: document.querySelector("[data-game-design-status]"),
  form: document.querySelector("[data-game-design-form]"),
  gameType: document.querySelector("[data-game-design-type]"),
  genre: document.querySelector("[data-game-design-genre]"),
  handoffChecklist: document.querySelector("[data-game-design-handoff-checklist]"),
  handoffCurrentFocus: document.querySelector("[data-game-design-current-focus]"),
  handoffProgress: document.querySelector("[data-game-design-game-progress]"),
  handoffPublishing: document.querySelector("[data-game-design-publishing-progress]"),
  handoffRecommended: document.querySelector("[data-game-design-recommended-tool]"),
  outputCapability: document.querySelector("[data-game-design-output-capability]"),
  outputMissing: document.querySelector("[data-game-design-output-missing]"),
  outputNextStep: document.querySelector("[data-game-design-output-next-step]"),
  outputPlayerMode: document.querySelector("[data-game-design-output-player-mode]"),
  outputSummary: document.querySelector("[data-game-design-output-summary]"),
  outputValidation: document.querySelector("[data-game-design-output-validation]"),
  playerMode: document.querySelector("[data-game-design-player-mode]"),
  playStyle: document.querySelector("[data-game-design-play-style]"),
  gameContext: document.querySelector("[data-game-design-game-context]"),
  gameOverlay: document.querySelector("[data-game-design-game-overlay]"),
  statusLog: document.querySelector("[data-game-design-log]"),
  tableCounts: document.querySelector("[data-game-design-table-counts]"),
  validationList: document.querySelector("[data-game-design-validation-list]"),
  validationOverlay: document.querySelector("[data-game-design-validation-overlay]")
};

function setText(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function populateSelect(select, values, placeholder) {
  if (!select) {
    return;
  }

  select.replaceChildren();

  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = placeholder;
  select.append(placeholderOption);

  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
}

function createStatusItem(text) {
  const item = document.createElement("li");
  item.textContent = text;
  return item;
}

function readForm() {
  return {
    capabilityDemoAuthoring: repository.getActiveGame()?.purpose === "Capability Demo",
    capabilityDemoNotes: elements.capabilityDemoNotes?.value,
    designSummary: elements.designSummary?.value,
    gameType: elements.gameType?.value,
    genre: elements.genre?.value,
    playerMode: elements.playerMode?.value,
    playStyle: elements.playStyle?.value
  };
}

function clearForm() {
  if (elements.gameType) {
    elements.gameType.value = "";
  }
  if (elements.genre) {
    elements.genre.value = "";
  }
  if (elements.playStyle) {
    elements.playStyle.value = "";
  }
  if (elements.playerMode) {
    elements.playerMode.value = "1 Player";
  }
  if (elements.designSummary) {
    elements.designSummary.value = "";
  }
  if (elements.capabilityDemoNotes) {
    elements.capabilityDemoNotes.value = "";
  }
}

function applyDesignToForm(design) {
  if (!design) {
    clearForm();
    return;
  }

  if (elements.gameType) {
    elements.gameType.value = design.gameType;
  }
  if (elements.genre) {
    elements.genre.value = design.genre;
  }
  if (elements.playStyle) {
    elements.playStyle.value = design.playStyle;
  }
  if (elements.playerMode) {
    elements.playerMode.value = design.playerMode || "1 Player";
  }
  if (elements.designSummary) {
    elements.designSummary.value = design.designSummary;
  }
  if (elements.capabilityDemoNotes) {
    elements.capabilityDemoNotes.value = design.capabilityDemoNotes;
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
    elements.validationList.append(createStatusItem(`${finding.label}: ${finding.action}`));
  });
  elements.validationOverlay.hidden = false;
}

function renderCapabilityDemos(snapshot) {
  if (!elements.capabilityDemoList || !elements.capabilityDemoPanel) {
    return;
  }

  elements.capabilityDemoList.replaceChildren();
  const activeGame = snapshot.activeGame || snapshot.activeProject;
  elements.capabilityDemoPanel.hidden = !activeGame;

  (snapshot.capabilityDemoGames || snapshot.capabilityDemoProjects || []).forEach((game) => {
    const item = document.createElement("li");
    item.textContent = `${game.name}: Game Workspace game`;
    elements.capabilityDemoList.append(item);
  });

  if ((snapshot.capabilityDemoGames || snapshot.capabilityDemoProjects || []).length === 0) {
    elements.capabilityDemoList.append(createStatusItem("No capability demo games seeded."));
  }
}

function renderTables(tables) {
  if (!elements.tableCounts) {
    return;
  }

  elements.tableCounts.replaceChildren();

  Object.entries(tables).forEach(([tableName, rows]) => {
    const row = document.createElement("tr");
    const name = document.createElement("td");
    const count = document.createElement("td");

    name.textContent = tableName;
    count.textContent = String(rows.length);
    row.append(name, count);
    elements.tableCounts.append(row);
  });
}

function renderHandoff(handoff) {
  setText(elements.handoffProgress, handoff.gameProgress || handoff.projectProgress);
  setText(elements.handoffPublishing, handoff.publishingProgress);
  setText(elements.handoffCurrentFocus, handoff.currentFocus);
  setText(elements.handoffRecommended, handoff.recommendedNextTool);

  if (!elements.handoffChecklist) {
    return;
  }

  elements.handoffChecklist.replaceChildren();
  handoff.progressChecklist.forEach((item) => {
    elements.handoffChecklist.append(createStatusItem(item));
  });
}

function renderOutput(snapshot, validation) {
  const activeDesign = snapshot.activeDesign;
  const activeGame = snapshot.activeGame || snapshot.activeProject;
  const missingRequirements = validation.findings.map((finding) => finding.label).join(", ");

  setText(elements.outputSummary, activeDesign?.designSummary || "No design summary saved yet.");
  setText(elements.outputPlayerMode, activeDesign?.playerMode || "1 Player");
  setText(elements.outputValidation, validation.status);
  setText(elements.outputNextStep, snapshot.progressHandoff.recommendedNextTool);
  setText(elements.outputMissing, missingRequirements || "None");
  setText(
    elements.outputCapability,
    activeGame?.purpose === "Capability Demo"
      ? `${activeGame.name} remains a Game Workspace game.`
      : "Not a capability demo game."
  );
}

function renderConfigurationLink(snapshot, validation) {
  if (!elements.configurationLink) {
    return;
  }

  const activeGame = snapshot.activeGame || snapshot.activeProject;
  const ready = Boolean(activeGame && validation.findings.length === 0);
  const target = new URL("toolbox/game-configuration/index.html", window.location.origin + "/");
  target.searchParams.set("handoff", ready ? "valid" : activeGame ? "invalid" : "missing");
  if (activeGame) {
    target.searchParams.set("game", activeGame.id);
  }
  elements.configurationLink.href = target.pathname.replace(/^\/+/, "") + target.search;
  elements.configurationLink.textContent = ready
    ? `Review ${activeGame.name} Game Configuration`
    : "Review Game Configuration";
}

function render() {
  const snapshot = repository.getSnapshot();
  const activeGame = snapshot.activeGame || snapshot.activeProject;
  const activeDesign = snapshot.activeDesign;
  const validation = repository.validateDesign(activeDesign || readForm());

  setText(
    elements.gameContext,
    activeGame ? `${activeGame.name} - ${activeGame.purpose}` : "No Game Workspace game"
  );
  setText(elements.designStatus, activeDesign?.status || validation.status);

  if (elements.gameOverlay) {
    elements.gameOverlay.hidden = Boolean(activeGame);
  }

  applyDesignToForm(activeDesign);
  renderValidation(validation);
  renderCapabilityDemos(snapshot);
  renderTables(snapshot.tables);
  renderHandoff(snapshot.progressHandoff);
  renderOutput(snapshot, validation);
  renderConfigurationLink(snapshot, validation);
}

function renderFormValidation() {
  const validation = repository.validateDesign(readForm());
  renderValidation(validation);
  setText(elements.designStatus, validation.status);
}

elements.form?.addEventListener("input", renderFormValidation);

elements.form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const result = repository.saveDesign(readForm());
  setText(elements.statusLog, result.message);
  render();
});

populateSelect(elements.gameType, GAME_DESIGN_GAME_TYPES, "Select game type");
populateSelect(elements.genre, GAME_DESIGN_GENRES, "Select genre");
populateSelect(elements.playerMode, GAME_DESIGN_PLAYER_MODES.map((mode) => mode.value), "Select player mode");
populateSelect(elements.playStyle, GAME_DESIGN_PLAY_STYLES, "Select play style");
render();
