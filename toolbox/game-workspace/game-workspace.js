import {
  GAME_WORKSPACE_MEMBER_ROLES,
  GAME_WORKSPACE_PROJECT_PURPOSES,
  GAME_WORKSPACE_PROJECT_STATUSES,
  createGameWorkspaceApiRepository,
} from "./game-workspace-api-client.js";
import { getSessionCurrent } from "../../src/engine/api/session-api-client.js";

const repository = createGameWorkspaceApiRepository();
repository.resetProjectData();

const elements = {
  activeProjectName: document.querySelector("[data-active-project-name]"),
  activeProjectOwner: document.querySelector("[data-active-project-owner]"),
  activeProjectPurpose: document.querySelector("[data-active-project-purpose]"),
  activeProjectStatus: document.querySelector("[data-active-project-status]"),
  currentFocus: document.querySelector("[data-current-focus]"),
  currentUserRole: document.querySelector("[data-current-user-role]"),
  currentUserRoleInput: document.querySelector("[data-current-user-role-input]"),
  deleteActiveProject: document.querySelector("[data-project-delete-active]"),
  form: document.querySelector("[data-project-form]"),
  membersTable: document.querySelector("[data-project-members-table]"),
  nameInput: document.querySelector("[data-project-name-input]"),
  progressChecklist: document.querySelector("[data-project-progress-checklist]"),
  projectList: document.querySelector("[data-project-list]"),
  projectProgress: document.querySelector("[data-project-progress]"),
  projectJourneyLink: document.querySelector("[data-project-journey-link]"),
  purposeInput: document.querySelector("[data-project-purpose-input]"),
  projectStatus: document.querySelector("[data-project-status]"),
  projectStatusInput: document.querySelector("[data-project-status-input]"),
  publishingProgress: document.querySelector("[data-publishing-progress]"),
  recommendedNextTool: document.querySelectorAll("[data-recommended-next-tool]"),
  statusLog: document.querySelector("[data-game-workspace-log], [data-project-workspace-log]"),
  tableCounts: document.querySelector("[data-project-table-counts]"),
};

function setText(element, value) {
  if (element && typeof element.forEach === "function" && !element.nodeType) {
    element.forEach((item) => {
      item.textContent = value;
    });
    return;
  }

  if (element) {
    element.textContent = value;
  }
}

function setStatusLog(message) {
  setText(elements.statusLog, message);
}

function currentSessionUserKey() {
  try {
    const session = getSessionCurrent();
    return session?.authenticated && session.userKey ? session.userKey : "";
  } catch {
    return "";
  }
}

function populateSelect(select, options) {
  if (!select) {
    return;
  }

  select.replaceChildren();
  options.forEach((option) => {
    const item = document.createElement("option");
    item.value = option;
    item.textContent = option;
    select.append(item);
  });
}

function currentProjectUserId(activeProject) {
  const sessionUserKey = currentSessionUserKey();
  if (sessionUserKey && (!activeProject || activeProject.members.some((member) => member.userId === sessionUserKey))) {
    return sessionUserKey;
  }
  return activeProject?.ownerUserId || activeProject?.members.find((member) => member.permission === "Owner")?.userId || "";
}

function currentProjectMember(activeProject) {
  const userId = currentProjectUserId(activeProject);
  return activeProject?.members.find((member) => member.userId === userId) || null;
}

function createProjectButton(project, isActive) {
  const button = document.createElement("button");
  button.className = isActive ? "btn primary" : "btn";
  button.type = "button";
  button.dataset.projectOpen = project.id;
  if (isActive) {
    button.dataset.projectActive = "true";
    button.setAttribute("aria-current", "true");
  }
  button.textContent = isActive ? `Open ${project.name} (Active)` : `Open ${project.name}`;
  return button;
}

function renderProjectList() {
  if (!elements.projectList) {
    return;
  }

  const activeProject = repository.getActiveProject();
  const projectUserId = currentProjectUserId(activeProject);
  const projects = repository.listProjects(projectUserId ? { userId: projectUserId } : {});

  elements.projectList.replaceChildren();

  if (projects.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "status";
    emptyState.textContent = "No projects. Create or seed a project to continue.";
    elements.projectList.append(emptyState);
    return;
  }

  projects.forEach((project) => {
    const row = document.createElement("article");
    row.className = "callout";
    row.dataset.projectRow = project.id;

    const title = document.createElement("h4");
    title.textContent = project.name;

    const meta = document.createElement("p");
    meta.className = "eyebrow";
    meta.textContent = `${project.purpose} | ${project.status} | ${project.ownerDisplayName}`;

    const isActive = activeProject?.id === project.id;
    const action = createProjectButton(project, isActive);

    row.append(title, meta, action);

    elements.projectList.append(row);
  });
}

function renderMembersTable(activeProject) {
  if (!elements.membersTable) {
    return;
  }

  elements.membersTable.replaceChildren();

  if (!activeProject) {
    const row = document.createElement("tr");
    row.innerHTML = "<td>No project</td><td>-</td><td>-</td><td>-</td>";
    elements.membersTable.append(row);
    return;
  }

  activeProject.members.forEach((member) => {
    const row = document.createElement("tr");
    const name = document.createElement("td");
    const userId = document.createElement("td");
    const role = document.createElement("td");
    const permission = document.createElement("td");

    name.textContent = member.displayName;
    userId.textContent = member.userId;
    role.textContent = member.role;
    permission.textContent = member.permission;

    row.append(name, userId, role, permission);
    elements.membersTable.append(row);
  });
}

function renderTableCounts() {
  if (!elements.tableCounts) {
    return;
  }

  const tables = repository.getTables();
  const rows = [
    ["users", tables.users.length],
    ["projects", tables.projects.length],
    ["project_members", tables.project_members.length],
  ];

  elements.tableCounts.replaceChildren();

  rows.forEach(([tableName, count]) => {
    const row = document.createElement("tr");
    const tableCell = document.createElement("td");
    const countCell = document.createElement("td");

    tableCell.textContent = tableName;
    countCell.textContent = String(count);

    row.append(tableCell, countCell);
    elements.tableCounts.append(row);
  });
}

function renderChecklist(progress) {
  if (!elements.progressChecklist) {
    return;
  }

  elements.progressChecklist.replaceChildren();

  progress.progressChecklist.forEach((item) => {
    const row = document.createElement("li");
    row.textContent = `${item.label}: ${item.status}`;
    elements.progressChecklist.append(row);
  });
}

function renderWorkspace() {
  const activeProject = repository.getActiveProject();
  const progress = repository.getProjectProgress();
  const currentMember = currentProjectMember(activeProject);

  setText(elements.activeProjectName, activeProject?.name || "No project open");
  setText(elements.activeProjectOwner, activeProject?.ownerDisplayName || "No owner");
  setText(elements.activeProjectPurpose, activeProject?.purpose || "No purpose");
  setText(elements.activeProjectStatus, activeProject?.status || "No Project");
  setText(elements.currentUserRole, currentMember?.role || "Viewer");
  setText(elements.projectStatus, progress.projectStatus);
  setText(elements.projectProgress, progress.projectProgress);
  setText(elements.publishingProgress, progress.publishingProgress);
  setText(elements.currentFocus, progress.currentFocus);
  setText(elements.recommendedNextTool, progress.recommendedNextTool);
  if (elements.purposeInput && activeProject?.purpose) {
    elements.purposeInput.value = activeProject.purpose;
  }
  if (elements.projectStatusInput && activeProject?.status) {
    elements.projectStatusInput.value = activeProject.status;
  }
  if (elements.currentUserRoleInput) {
    elements.currentUserRoleInput.value = currentMember?.role || "Viewer";
  }
  if (elements.projectJourneyLink) {
    if (activeProject) {
      elements.projectJourneyLink.href = `toolbox/project-journey/index.html?project=${encodeURIComponent(activeProject.id)}`;
      elements.projectJourneyLink.setAttribute("aria-disabled", "false");
    } else {
      elements.projectJourneyLink.href = "toolbox/project-journey/index.html?project=none";
      elements.projectJourneyLink.setAttribute("aria-disabled", "true");
    }
  }

  renderProjectList();
  renderMembersTable(activeProject);
  renderTableCounts();
  renderChecklist(progress);
}

elements.form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const project = repository.createProject({
    name: elements.nameInput?.value,
    ownerUserId: currentProjectUserId(repository.getActiveProject()),
    purpose: elements.purposeInput?.value,
    status: elements.projectStatusInput?.value,
  });

  if (elements.nameInput) {
    elements.nameInput.value = "";
  }

  setStatusLog(`Created and opened ${project.name}.`);
  renderWorkspace();
});

elements.projectList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-project-open]");

  if (!button) {
    return;
  }

  const project = repository.openProject(button.dataset.projectOpen);

  if (project) {
    setStatusLog(`Opened ${project.name}.`);
    renderWorkspace();
  }
});

elements.deleteActiveProject?.addEventListener("click", () => {
  const activeProject = repository.getActiveProject();

  if (!activeProject) {
    setStatusLog("No project is open for deletion.");
    renderWorkspace();
    return;
  }

  repository.deleteProject(activeProject.id);
  setStatusLog(`Deleted ${activeProject.name}.`);
  renderWorkspace();
});

elements.purposeInput?.addEventListener("change", () => {
  const activeProject = repository.getActiveProject();
  if (!activeProject) {
    return;
  }

  const project = repository.updateProjectPurpose(activeProject.id, elements.purposeInput.value);
  setStatusLog(`Updated ${project.name} purpose to ${project.purpose}.`);
  renderWorkspace();
});

elements.projectStatusInput?.addEventListener("change", () => {
  const activeProject = repository.getActiveProject();
  if (!activeProject) {
    return;
  }

  const project = repository.updateProjectStatus(activeProject.id, elements.projectStatusInput.value);
  setStatusLog(`Updated ${project.name} status to ${project.status}.`);
  renderWorkspace();
});

elements.currentUserRoleInput?.addEventListener("change", () => {
  const activeProject = repository.getActiveProject();
  if (!activeProject) {
    return;
  }

  repository.updateProjectMemberRole(activeProject.id, currentProjectUserId(activeProject), elements.currentUserRoleInput.value);
  setStatusLog(`Updated current user role to ${elements.currentUserRoleInput.value}.`);
  renderWorkspace();
});

populateSelect(elements.purposeInput, GAME_WORKSPACE_PROJECT_PURPOSES);
populateSelect(elements.projectStatusInput, GAME_WORKSPACE_PROJECT_STATUSES);
populateSelect(elements.currentUserRoleInput, GAME_WORKSPACE_MEMBER_ROLES);
renderWorkspace();
