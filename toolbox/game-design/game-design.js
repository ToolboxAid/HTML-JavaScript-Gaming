import {
  GAME_DESIGN_GAME_TYPES,
  GAME_DESIGN_GENRES,
  GAME_DESIGN_PLAY_STYLES,
  createGameDesignMockRepository
} from "./game-design-mock-repository.js";

const repository = createGameDesignMockRepository();
const params = new URLSearchParams(window.location.search);
const requestedProject = params.get("project");

if (requestedProject === "missing") {
  repository.clearProjectContext();
} else if (requestedProject) {
  repository.openProjectContext(requestedProject);
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
  handoffProgress: document.querySelector("[data-game-design-project-progress]"),
  handoffPublishing: document.querySelector("[data-game-design-publishing-progress]"),
  handoffRecommended: document.querySelector("[data-game-design-recommended-tool]"),
  outputCapability: document.querySelector("[data-game-design-output-capability]"),
  outputMissing: document.querySelector("[data-game-design-output-missing]"),
  outputNextStep: document.querySelector("[data-game-design-output-next-step]"),
  outputSummary: document.querySelector("[data-game-design-output-summary]"),
  outputValidation: document.querySelector("[data-game-design-output-validation]"),
  playStyle: document.querySelector("[data-game-design-play-style]"),
  projectContext: document.querySelector("[data-game-design-project-context]"),
  projectOverlay: document.querySelector("[data-game-design-project-overlay]"),
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
    capabilityDemoAuthoring: repository.getActiveProject()?.purpose === "Capability Demo",
    capabilityDemoNotes: elements.capabilityDemoNotes?.value,
    designSummary: elements.designSummary?.value,
    gameType: elements.gameType?.value,
    genre: elements.genre?.value,
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
  const activeProject = snapshot.activeProject;
  elements.capabilityDemoPanel.hidden = !activeProject;

  snapshot.capabilityDemoProjects.forEach((project) => {
    const item = document.createElement("li");
    item.textContent = `${project.name}: Project Workspace project`;
    elements.capabilityDemoList.append(item);
  });

  if (snapshot.capabilityDemoProjects.length === 0) {
    elements.capabilityDemoList.append(createStatusItem("No capability demo projects seeded."));
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
  setText(elements.handoffProgress, handoff.projectProgress);
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
  const activeProject = snapshot.activeProject;
  const missingRequirements = validation.findings.map((finding) => finding.label).join(", ");

  setText(elements.outputSummary, activeDesign?.designSummary || "No design summary saved yet.");
  setText(elements.outputValidation, validation.status);
  setText(elements.outputNextStep, snapshot.progressHandoff.recommendedNextTool);
  setText(elements.outputMissing, missingRequirements || "None");
  setText(
    elements.outputCapability,
    activeProject?.purpose === "Capability Demo"
      ? `${activeProject.name} remains a Project Workspace project.`
      : "Not a capability demo project."
  );
}

function renderConfigurationLink(snapshot, validation) {
  if (!elements.configurationLink) {
    return;
  }

  const activeProject = snapshot.activeProject;
  const ready = Boolean(activeProject && validation.findings.length === 0);
  const target = new URL("toolbox/game-configuration/index.html", window.location.origin + "/");
  target.searchParams.set("handoff", ready ? "valid" : activeProject ? "invalid" : "missing");
  if (activeProject) {
    target.searchParams.set("project", activeProject.id);
  }
  elements.configurationLink.href = target.pathname.replace(/^\/+/, "") + target.search;
  elements.configurationLink.textContent = ready
    ? `Review ${activeProject.name} Game Configuration`
    : "Review Game Configuration";
}

function render() {
  const snapshot = repository.getSnapshot();
  const activeProject = snapshot.activeProject;
  const activeDesign = snapshot.activeDesign;
  const validation = repository.validateDesign(activeDesign || readForm());

  setText(
    elements.projectContext,
    activeProject ? `${activeProject.name} - ${activeProject.purpose}` : "No Project Workspace project"
  );
  setText(elements.designStatus, activeDesign?.status || validation.status);

  if (elements.projectOverlay) {
    elements.projectOverlay.hidden = Boolean(activeProject);
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
populateSelect(elements.playStyle, GAME_DESIGN_PLAY_STYLES, "Select play style");
render();
