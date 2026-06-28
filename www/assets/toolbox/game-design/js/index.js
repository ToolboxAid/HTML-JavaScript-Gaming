import { getSessionCurrent } from "../../../../../src/api/session-api-client.js";
import {
  createServerRepositoryClient,
  readServerToolConstants,
  requireServerConstant,
} from "../../../../../src/api/server-api-client.js";

const constants = readServerToolConstants("game-design");

export const GAME_DESIGN_GAME_TYPES = Object.freeze(requireServerConstant(constants, "GAME_DESIGN_GAME_TYPES", "game-design"));
export const GAME_DESIGN_GENRES = Object.freeze(requireServerConstant(constants, "GAME_DESIGN_GENRES", "game-design"));
export const GAME_DESIGN_PLAYER_MODES = Object.freeze(requireServerConstant(constants, "GAME_DESIGN_PLAYER_MODES", "game-design"));
export const GAME_DESIGN_PLAY_STYLES = Object.freeze(requireServerConstant(constants, "GAME_DESIGN_PLAY_STYLES", "game-design"));

export function createGameDesignApiRepository(options = {}) {
  return createServerRepositoryClient("game-design", options);
}

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
  coreLoop: document.querySelector("[data-game-design-core-loop]"),
  designSummary: document.querySelector("[data-game-design-summary]"),
  designNotes: document.querySelector("[data-game-design-notes]"),
  designStatus: document.querySelector("[data-game-design-status]"),
  form: document.querySelector("[data-game-design-form]"),
  gameType: document.querySelector("[data-game-design-type]"),
  genre: document.querySelector("[data-game-design-genre]"),
  handoffChecklist: document.querySelector("[data-game-design-handoff-checklist]"),
  handoffCurrentFocus: document.querySelector("[data-game-design-current-focus]"),
  handoffProgress: document.querySelector("[data-game-design-game-progress]"),
  handoffPublishing: document.querySelector("[data-game-design-publishing-progress]"),
  handoffRecommended: document.querySelector("[data-game-design-recommended-tool]"),
  loseCondition: document.querySelector("[data-game-design-lose-condition]"),
  outputAudience: document.querySelector("[data-game-design-output-audience]"),
  outputCapability: document.querySelector("[data-game-design-output-capability]"),
  outputCoreLoop: document.querySelector("[data-game-design-output-core-loop]"),
  outputLose: document.querySelector("[data-game-design-output-lose]"),
  outputMissing: document.querySelector("[data-game-design-output-missing]"),
  outputNextStep: document.querySelector("[data-game-design-output-next-step]"),
  outputNotes: document.querySelector("[data-game-design-output-notes]"),
  outputPlayerMode: document.querySelector("[data-game-design-output-player-mode]"),
  outputStory: document.querySelector("[data-game-design-output-story]"),
  outputSummary: document.querySelector("[data-game-design-output-summary]"),
  outputValidation: document.querySelector("[data-game-design-output-validation]"),
  outputWin: document.querySelector("[data-game-design-output-win]"),
  playerMode: document.querySelector("[data-game-design-player-mode]"),
  playStyle: document.querySelector("[data-game-design-play-style]"),
  story: document.querySelector("[data-game-design-story]"),
  targetAudience: document.querySelector("[data-game-design-target-audience]"),
  gameContext: document.querySelector("[data-game-design-game-context]"),
  gameOverlay: document.querySelector("[data-game-design-game-overlay]"),
  statusLog: document.querySelector("[data-game-design-log]"),
  tableCounts: document.querySelector("[data-game-design-table-counts]"),
  validationList: document.querySelector("[data-game-design-validation-list]"),
  validationOverlay: document.querySelector("[data-game-design-validation-overlay]"),
  winCondition: document.querySelector("[data-game-design-win-condition]")
};

function setText(element, value) {
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
  setText(elements.statusLog, "Sign in before saving Game Design.");
  window.location.href = new URL("/account/sign-in.html", window.location.href).href;
  return true;
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
    coreLoop: elements.coreLoop?.value,
    designNotes: elements.designNotes?.value,
    designSummary: elements.designSummary?.value,
    gameType: elements.gameType?.value,
    genre: elements.genre?.value,
    loseCondition: elements.loseCondition?.value,
    playerMode: elements.playerMode?.value,
    playStyle: elements.playStyle?.value,
    story: elements.story?.value,
    summary: elements.designSummary?.value,
    targetAudience: elements.targetAudience?.value,
    winCondition: elements.winCondition?.value
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
  if (elements.story) {
    elements.story.value = "";
  }
  if (elements.coreLoop) {
    elements.coreLoop.value = "";
  }
  if (elements.winCondition) {
    elements.winCondition.value = "";
  }
  if (elements.loseCondition) {
    elements.loseCondition.value = "";
  }
  if (elements.targetAudience) {
    elements.targetAudience.value = "";
  }
  if (elements.designNotes) {
    elements.designNotes.value = "";
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
    elements.designSummary.value = design.summary || design.designSummary;
  }
  if (elements.story) {
    elements.story.value = design.story;
  }
  if (elements.coreLoop) {
    elements.coreLoop.value = design.coreLoop;
  }
  if (elements.winCondition) {
    elements.winCondition.value = design.winCondition;
  }
  if (elements.loseCondition) {
    elements.loseCondition.value = design.loseCondition;
  }
  if (elements.targetAudience) {
    elements.targetAudience.value = design.targetAudience;
  }
  if (elements.designNotes) {
    elements.designNotes.value = design.designNotes;
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
    item.textContent = `${game.name}: Game Hub game`;
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

  setText(elements.outputSummary, activeDesign?.summary || activeDesign?.designSummary || "No design summary saved yet.");
  setText(elements.outputStory, activeDesign?.story || "No story saved yet.");
  setText(elements.outputCoreLoop, activeDesign?.coreLoop || "No core loop saved yet.");
  setText(elements.outputWin, activeDesign?.winCondition || "No win condition saved yet.");
  setText(elements.outputLose, activeDesign?.loseCondition || "No lose condition saved yet.");
  setText(elements.outputAudience, activeDesign?.targetAudience || "No audience saved yet.");
  setText(elements.outputNotes, activeDesign?.designNotes || "No notes saved yet.");
  setText(elements.outputPlayerMode, activeDesign?.playerMode || "1 Player");
  setText(elements.outputValidation, validation.status);
  setText(elements.outputNextStep, snapshot.progressHandoff.recommendedNextTool);
  setText(elements.outputMissing, missingRequirements || "None");
  setText(
    elements.outputCapability,
    activeGame?.purpose === "Capability Demo"
      ? `${activeGame.name} remains a Game Hub game.`
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
    activeGame ? `${activeGame.name} - ${activeGame.purpose}` : "No Game Hub game"
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
  if (redirectGuestWriteAction()) {
    return;
  }
  const result = repository.saveDesign(readForm());
  setText(elements.statusLog, result.message);
  render();
});

populateSelect(elements.gameType, GAME_DESIGN_GAME_TYPES, "Select game type");
populateSelect(elements.genre, GAME_DESIGN_GENRES, "Select genre");
populateSelect(elements.playerMode, GAME_DESIGN_PLAYER_MODES.map((mode) => mode.value), "Select player mode");
populateSelect(elements.playStyle, GAME_DESIGN_PLAY_STYLES, "Select play style");
render();
