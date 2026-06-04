const SEED_USERS = Object.freeze([
  {
    id: "admin-user",
    displayName: "Admin User",
    email: "admin@example.test",
    role: "Admin",
  },
  {
    id: "creator-user",
    displayName: "Creator User",
    email: "creator@example.test",
    role: "Creator",
  },
  {
    id: "guest-preview-user",
    displayName: "Guest Preview User",
    email: "guest@example.test",
    role: "Guest",
  },
]);

const DEMO_PROJECT = Object.freeze({
  id: "demo-project",
  ownerUserId: "creator-user",
  name: "Demo Project",
  status: "Under Construction",
});

const DEMO_PROJECT_MEMBERS = Object.freeze([
  {
    projectId: "demo-project",
    userId: "creator-user",
    permission: "Owner",
  },
  {
    projectId: "demo-project",
    userId: "admin-user",
    permission: "Admin",
  },
  {
    projectId: "demo-project",
    userId: "guest-preview-user",
    permission: "Viewer",
  },
]);

export const PROJECT_WORKSPACE_TABLES = Object.freeze([
  "users",
  "projects",
  "project_members",
]);

export const PROJECT_WORKSPACE_PERMISSIONS = Object.freeze([
  "Owner",
  "Editor",
  "Viewer",
  "Admin",
]);

export const PROJECT_WORKSPACE_SCHEMA = Object.freeze({
  users: Object.freeze(["id", "displayName", "email", "role"]),
  projects: Object.freeze(["id", "ownerUserId", "name", "status"]),
  project_members: Object.freeze(["projectId", "userId", "permission"]),
});

function cloneRows(rows) {
  return rows.map((row) => ({ ...row }));
}

function cloneTables(tables) {
  return {
    users: cloneRows(tables.users),
    projects: cloneRows(tables.projects),
    project_members: cloneRows(tables.project_members),
  };
}

function slugifyProjectName(name) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "project";
}

function createSeedTables() {
  return {
    users: cloneRows(SEED_USERS),
    projects: [{ ...DEMO_PROJECT }],
    project_members: cloneRows(DEMO_PROJECT_MEMBERS),
  };
}

export function createProjectWorkspaceMockRepository() {
  let tables = createSeedTables();
  let activeProjectId = DEMO_PROJECT.id;
  let projectCounter = 1;

  function getUserById(userId) {
    return tables.users.find((user) => user.id === userId) || null;
  }

  function getProjectById(projectId) {
    return tables.projects.find((project) => project.id === projectId) || null;
  }

  function ensureSeedUsers() {
    SEED_USERS.forEach((seedUser) => {
      if (!getUserById(seedUser.id)) {
        tables.users.push({ ...seedUser });
      }
    });
  }

  function getProjectMembers(projectId) {
    return tables.project_members
      .filter((member) => member.projectId === projectId)
      .map((member) => ({
        ...member,
        displayName: getUserById(member.userId)?.displayName || member.userId,
      }));
  }

  function describeProject(project) {
    if (!project) {
      return null;
    }

    const owner = getUserById(project.ownerUserId);

    return {
      ...project,
      ownerDisplayName: owner?.displayName || project.ownerUserId,
      members: getProjectMembers(project.id),
    };
  }

  function getTables() {
    return cloneTables(tables);
  }

  function listProjects(options = {}) {
    const { userId } = options;

    if (!userId) {
      return tables.projects.map(describeProject);
    }

    const projectIds = new Set(
      tables.project_members
        .filter((member) => member.userId === userId)
        .map((member) => member.projectId),
    );

    return tables.projects
      .filter((project) => projectIds.has(project.id))
      .map(describeProject);
  }

  function getActiveProject() {
    return describeProject(getProjectById(activeProjectId));
  }

  function getProjectProgress(projectId = activeProjectId) {
    const project = getProjectById(projectId);

    if (!project) {
      return {
        projectStatus: "No Project",
        projectProgress: "No active project",
        publishingProgress: "Not started",
        currentFocus: "Create or seed a project",
        recommendedNextTool: "Project Workspace",
        requiredForTestable: false,
        requiredForPublish: false,
        progressChecklist: [
          { label: "Create project identity", status: "Ready" },
          { label: "Configure project details", status: "Planned" },
          { label: "Prepare publish requirements", status: "Planned" },
        ],
      };
    }

    return {
      projectStatus: project.status,
      projectProgress: `${project.name} identity ready`,
      publishingProgress: "Publish blocked until configuration and required assets are ready",
      currentFocus: "Complete Game Configuration",
      recommendedNextTool: "Game Configuration",
      requiredForTestable: true,
      requiredForPublish: true,
      progressChecklist: [
        { label: "Project identity", status: "Complete" },
        { label: "Game configuration", status: "Under Construction" },
        { label: "Playable build", status: "Planned" },
        { label: "Publishing review", status: "Planned" },
      ],
    };
  }

  function getSnapshot() {
    return {
      tables: getTables(),
      activeProject: getActiveProject(),
      progress: getProjectProgress(),
    };
  }

  function resetProjectData() {
    tables = createSeedTables();
    activeProjectId = DEMO_PROJECT.id;
    projectCounter = 1;
    return getSnapshot();
  }

  function seedDemoProject() {
    ensureSeedUsers();

    if (!getProjectById(DEMO_PROJECT.id)) {
      tables.projects.push({ ...DEMO_PROJECT });
    }

    DEMO_PROJECT_MEMBERS.forEach((seedMember) => {
      const exists = tables.project_members.some(
        (member) =>
          member.projectId === seedMember.projectId &&
          member.userId === seedMember.userId,
      );

      if (!exists) {
        tables.project_members.push({ ...seedMember });
      }
    });

    activeProjectId = DEMO_PROJECT.id;
    return getSnapshot();
  }

  function clearTestData() {
    tables = {
      users: cloneRows(SEED_USERS),
      projects: [],
      project_members: [],
    };
    activeProjectId = null;
    return getSnapshot();
  }

  function createProject(input = {}) {
    ensureSeedUsers();

    const name = String(input.name || "").trim() || "Untitled Project";
    const ownerUserId = input.ownerUserId || "creator-user";
    const baseId = slugifyProjectName(name);
    let candidateId = `${baseId}-${projectCounter}`;
    projectCounter += 1;

    while (getProjectById(candidateId)) {
      candidateId = `${baseId}-${projectCounter}`;
      projectCounter += 1;
    }

    const project = {
      id: candidateId,
      ownerUserId,
      name,
      status: input.status || "Under Construction",
    };

    tables.projects.push(project);
    tables.project_members.push({
      projectId: project.id,
      userId: ownerUserId,
      permission: "Owner",
    });

    activeProjectId = project.id;
    return describeProject(project);
  }

  function openProject(projectId) {
    const project = getProjectById(projectId);

    if (!project) {
      return null;
    }

    activeProjectId = project.id;
    return describeProject(project);
  }

  function deleteProject(projectId) {
    const project = getProjectById(projectId);

    if (!project) {
      return getSnapshot();
    }

    tables.projects = tables.projects.filter((item) => item.id !== project.id);
    tables.project_members = tables.project_members.filter(
      (member) => member.projectId !== project.id,
    );

    if (activeProjectId === project.id) {
      activeProjectId = tables.projects[0]?.id || null;
    }

    return getSnapshot();
  }

  return {
    createProject,
    deleteProject,
    getActiveProject,
    getProjectProgress,
    getSnapshot,
    getTables,
    listProjects,
    openProject,
    resetProjectData,
    seedDemoProject,
    clearTestData,
  };
}
