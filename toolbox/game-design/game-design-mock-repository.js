import { createProjectWorkspaceMockRepository } from "../project-workspace/project-workspace-mock-repository.js";

export const GAME_DESIGN_TABLES = Object.freeze([
  "game_design_documents",
  "game_design_validation_items",
  "game_design_capability_demos"
]);

export const GAME_DESIGN_GAME_TYPES = Object.freeze([
  "2D Platformer",
  "Arcade Action",
  "Capability Demo",
  "Narrative Adventure",
  "Puzzle",
  "RPG",
  "Sandbox",
  "Simulation",
  "Strategy"
]);

export const GAME_DESIGN_GENRES = Object.freeze([
  "Action",
  "Adventure",
  "Educational",
  "Fantasy",
  "Sci-Fi",
  "Sports",
  "Strategy",
  "Utility"
]);

export const GAME_DESIGN_PLAY_STYLES = Object.freeze([
  "Competitive",
  "Cooperative",
  "Guided Tutorial",
  "Sandbox",
  "Single Player",
  "Turn-Based"
]);

const CREATOR_USER_ID = "creator-user";
const REQUIRED_FIELDS = Object.freeze([
  {
    field: "gameType",
    label: "Game Type",
    action: "Select a game type before configuration handoff."
  },
  {
    field: "genre",
    label: "Genre",
    action: "Select a genre so project discovery and expectations are clear."
  },
  {
    field: "playStyle",
    label: "Play Style",
    action: "Select the player mode that best describes the intended experience."
  },
  {
    field: "designSummary",
    label: "Design Summary",
    action: "Write a short design summary that explains the project promise."
  }
]);

function cloneRows(rows) {
  return rows.map((row) => ({ ...row }));
}

function cloneTables(tables) {
  return {
    game_design_documents: cloneRows(tables.game_design_documents),
    game_design_validation_items: cloneRows(tables.game_design_validation_items),
    game_design_capability_demos: cloneRows(tables.game_design_capability_demos)
  };
}

function normalizeChoice(value, choices) {
  return choices.includes(value) ? value : "";
}

function normalizeText(value) {
  return String(value || "").trim();
}

function createEmptyTables() {
  return {
    game_design_documents: [],
    game_design_validation_items: [],
    game_design_capability_demos: []
  };
}

function designIdForProject(projectId) {
  return `${projectId}-game-design`;
}

function createValidationRows(projectId, findings) {
  return findings.map((finding, index) => ({
    id: `${projectId}-validation-${index + 1}`,
    projectId,
    field: finding.field,
    label: finding.label,
    action: finding.action,
    status: "Missing"
  }));
}

function createDesignForProject(project, input = {}) {
  const document = {
    id: designIdForProject(project.id),
    projectId: project.id,
    projectPurpose: project.purpose,
    gameType: normalizeChoice(input.gameType, GAME_DESIGN_GAME_TYPES),
    genre: normalizeChoice(input.genre, GAME_DESIGN_GENRES),
    playStyle: normalizeChoice(input.playStyle, GAME_DESIGN_PLAY_STYLES),
    designSummary: normalizeText(input.designSummary),
    capabilityDemoAuthoring: project.purpose === "Capability Demo" || Boolean(input.capabilityDemoAuthoring),
    capabilityDemoNotes: normalizeText(input.capabilityDemoNotes),
    status: "Under Construction",
    updatedAt: new Date().toISOString()
  };

  const findings = REQUIRED_FIELDS.filter((requirement) => !document[requirement.field]);
  document.status = findings.length === 0 ? "Ready" : "Under Construction";
  return { document, findings };
}

export function createGameDesignMockRepository(options = {}) {
  const projectRepository = options.projectRepository || createProjectWorkspaceMockRepository();
  let tables = createEmptyTables();

  function getActiveProject() {
    return projectRepository.getActiveProject();
  }

  function listProjectContexts() {
    return projectRepository
      .listProjects({ userId: CREATOR_USER_ID })
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  function listCapabilityDemoProjects() {
    return projectRepository
      .listProjects({ userId: CREATOR_USER_ID })
      .filter((project) => project.purpose === "Capability Demo")
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  function getActiveDesign() {
    const activeProject = getActiveProject();
    if (!activeProject) {
      return null;
    }

    return tables.game_design_documents.find((document) => document.projectId === activeProject.id) || null;
  }

  function validateDesign(input = {}) {
    const activeProject = getActiveProject();

    if (!activeProject) {
      return {
        status: "Blocked",
        findings: [
          {
            field: "project",
            label: "Project Context",
            action: "Open or seed a Project Workspace project before saving Game Design."
          }
        ]
      };
    }

    const design = {
      gameType: normalizeChoice(input.gameType, GAME_DESIGN_GAME_TYPES),
      genre: normalizeChoice(input.genre, GAME_DESIGN_GENRES),
      playStyle: normalizeChoice(input.playStyle, GAME_DESIGN_PLAY_STYLES),
      designSummary: normalizeText(input.designSummary)
    };
    const findings = REQUIRED_FIELDS.filter((requirement) => !design[requirement.field]);

    return {
      status: findings.length === 0 ? "Ready" : "Needs Input",
      findings
    };
  }

  function replaceValidationRows(projectId, findings) {
    tables.game_design_validation_items = tables.game_design_validation_items.filter(
      (row) => row.projectId !== projectId
    );
    tables.game_design_validation_items.push(...createValidationRows(projectId, findings));
  }

  function replaceCapabilityDemoRow(project, document) {
    tables.game_design_capability_demos = tables.game_design_capability_demos.filter(
      (row) => row.projectId !== project.id
    );

    if (!document.capabilityDemoAuthoring) {
      return;
    }

    tables.game_design_capability_demos.push({
      id: `${project.id}-capability-demo-authoring`,
      projectId: project.id,
      projectName: project.name,
      projectPurpose: project.purpose,
      authoringMode: "Project-owned capability demo",
      status: document.status
    });
  }

  function saveDesign(input = {}) {
    const activeProject = getActiveProject();

    if (!activeProject) {
      return {
        saved: false,
        message: "Open or seed a project before saving Game Design.",
        snapshot: getSnapshot()
      };
    }

    const { document, findings } = createDesignForProject(activeProject, input);
    tables.game_design_documents = tables.game_design_documents.filter(
      (row) => row.projectId !== activeProject.id
    );
    tables.game_design_documents.push(document);
    replaceValidationRows(activeProject.id, findings);
    replaceCapabilityDemoRow(activeProject, document);

    return {
      saved: true,
      message: findings.length === 0
        ? `Saved ${activeProject.name} Game Design as ready.`
        : `Saved ${activeProject.name} Game Design with ${findings.length} missing requirement${findings.length === 1 ? "" : "s"}.`,
      snapshot: getSnapshot()
    };
  }

  function seedCapabilityDemoDesigns() {
    listCapabilityDemoProjects().forEach((project) => {
      const { document, findings } = createDesignForProject(project, {
        capabilityDemoAuthoring: true,
        capabilityDemoNotes: `${project.name} remains a Project Workspace project.`,
        designSummary: `${project.name} demonstrates one planned capability as a project-owned demo.`,
        gameType: "Capability Demo",
        genre: "Utility",
        playStyle: "Guided Tutorial"
      });
      tables.game_design_documents = tables.game_design_documents.filter(
        (row) => row.projectId !== project.id
      );
      tables.game_design_documents.push(document);
      replaceValidationRows(project.id, findings);
      replaceCapabilityDemoRow(project, document);
    });
  }

  function openProjectContext(projectId) {
    const project = projectRepository.openProject(projectId);
    return {
      opened: Boolean(project),
      snapshot: getSnapshot()
    };
  }

  function clearProjectContext() {
    projectRepository.clearTestData();
    tables = createEmptyTables();
    return getSnapshot();
  }

  function resetDesignData() {
    projectRepository.resetProjectData();
    tables = createEmptyTables();
    seedCapabilityDemoDesigns();
    return getSnapshot();
  }

  function getTables() {
    return cloneTables(tables);
  }

  function getProjectProgressHandoff() {
    const activeProject = getActiveProject();
    const design = getActiveDesign();

    if (!activeProject) {
      return {
        projectProgress: "No active project",
        publishingProgress: "Blocked until Project Workspace has an active project",
        currentFocus: "Open a Project Workspace project",
        recommendedNextTool: "Project Workspace",
        progressChecklist: [
          "Project context: Missing",
          "Game Design document: Blocked",
          "Game Configuration handoff: Blocked"
        ]
      };
    }

    const validation = validateDesign(design || {});
    const ready = validation.findings.length === 0;

    return {
      projectProgress: ready
        ? `${activeProject.name} Game Design ready`
        : `${activeProject.name} Game Design needs ${validation.findings.length} requirement${validation.findings.length === 1 ? "" : "s"}`,
      publishingProgress: ready
        ? "Publish remains blocked until Game Configuration and release gates are ready"
        : "Publish blocked until Game Design requirements are complete",
      currentFocus: ready ? "Review Game Configuration" : "Complete Game Design",
      recommendedNextTool: ready ? "Game Configuration" : "Game Design",
      progressChecklist: [
        `Project purpose: ${activeProject.purpose}`,
        `Game type: ${design?.gameType || "Missing"}`,
        `Genre: ${design?.genre || "Missing"}`,
        `Play style: ${design?.playStyle || "Missing"}`,
        `Validation: ${validation.status}`
      ]
    };
  }

  function getSnapshot() {
    return {
      activeDesign: getActiveDesign(),
      activeProject: getActiveProject(),
      capabilityDemoProjects: listCapabilityDemoProjects(),
      progressHandoff: getProjectProgressHandoff(),
      tables: getTables()
    };
  }

  resetDesignData();

  return {
    clearProjectContext,
    getActiveDesign,
    getActiveProject,
    getProjectProgressHandoff,
    getSnapshot,
    getTables,
    listCapabilityDemoProjects,
    listProjectContexts,
    openProjectContext,
    resetDesignData,
    saveDesign,
    seedCapabilityDemoDesigns,
    validateDesign
  };
}
