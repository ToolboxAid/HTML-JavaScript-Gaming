import { createProjectWorkspaceMockRepository } from "./project-workspace-mock-repository.js";

const CREATOR_USER_ID = "creator-user";

const repository = createProjectWorkspaceMockRepository();
repository.resetProjectData();

const elements = {
  activeProjectName: document.querySelector("[data-active-project-name]"),
  activeProjectOwner: document.querySelector("[data-active-project-owner]"),
  activeProjectStatus: document.querySelector("[data-active-project-status]"),
  currentFocus: document.querySelector("[data-current-focus]"),
  deleteActiveProject: document.querySelector("[data-project-delete-active]"),
  form: document.querySelector("[data-project-form]"),
  membersTable: document.querySelector("[data-project-members-table]"),
  nameInput: document.querySelector("[data-project-name-input]"),
  progressChecklist: document.querySelector("[data-project-progress-checklist]"),
  projectList: document.querySelector("[data-project-list]"),
  projectProgress: document.querySelector("[data-project-progress]"),
  projectStatus: document.querySelector("[data-project-status]"),
  publishingProgress: document.querySelector("[data-publishing-progress]"),
  recommendedNextTool: document.querySelectorAll("[data-recommended-next-tool]"),
  statusLog: document.querySelector("[data-project-workspace-log]"),
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

function createProjectButton(project) {
  const button = document.createElement("button");
  button.className = "btn";
  button.type = "button";
  button.dataset.projectOpen = project.id;
  button.textContent = `Open ${project.name}`;
  return button;
}

function renderProjectList() {
  if (!elements.projectList) {
    return;
  }

  const activeProject = repository.getActiveProject();
  const projects = repository.listProjects({ userId: CREATOR_USER_ID });

  elements.projectList.replaceChildren();

  if (projects.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "status";
    emptyState.textContent = "No mock projects. Create or seed a project to continue.";
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
    meta.textContent = `${project.status} | ${project.ownerDisplayName}`;

    const action = createProjectButton(project);

    if (activeProject?.id === project.id) {
      const active = document.createElement("span");
      active.className = "status";
      active.textContent = "Open";
      row.append(title, meta, active, action);
    } else {
      row.append(title, meta, action);
    }

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
    row.innerHTML = "<td>No project</td><td>-</td><td>-</td>";
    elements.membersTable.append(row);
    return;
  }

  activeProject.members.forEach((member) => {
    const row = document.createElement("tr");
    const name = document.createElement("td");
    const role = document.createElement("td");
    const permission = document.createElement("td");

    name.textContent = member.displayName;
    role.textContent = member.userId;
    permission.textContent = member.permission;

    row.append(name, role, permission);
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

  setText(elements.activeProjectName, activeProject?.name || "No project open");
  setText(elements.activeProjectOwner, activeProject?.ownerDisplayName || "No owner");
  setText(elements.activeProjectStatus, activeProject?.status || "No Project");
  setText(elements.projectStatus, progress.projectStatus);
  setText(elements.projectProgress, progress.projectProgress);
  setText(elements.publishingProgress, progress.publishingProgress);
  setText(elements.currentFocus, progress.currentFocus);
  setText(elements.recommendedNextTool, progress.recommendedNextTool);

  renderProjectList();
  renderMembersTable(activeProject);
  renderTableCounts();
  renderChecklist(progress);
}

elements.form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const project = repository.createProject({
    name: elements.nameInput?.value,
    ownerUserId: CREATOR_USER_ID,
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

renderWorkspace();
