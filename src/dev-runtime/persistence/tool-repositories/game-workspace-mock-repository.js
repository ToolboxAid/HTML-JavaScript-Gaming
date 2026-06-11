import { MOCK_DB_KEYS } from "../mock-db-store.js";

export const PROJECT_WORKSPACE_DEFAULT_OWNER_USER_KEY = MOCK_DB_KEYS.users.user1;
export const PROJECT_WORKSPACE_ADMIN_USER_KEY = MOCK_DB_KEYS.users.admin;
export const PROJECT_WORKSPACE_VIEWER_USER_KEY = MOCK_DB_KEYS.users.user3;

const SEED_USERS = Object.freeze([
  {
    id: PROJECT_WORKSPACE_ADMIN_USER_KEY,
    displayName: "DavidQ",
    email: "admin@example.test",
    role: "Admin",
  },
  {
    id: PROJECT_WORKSPACE_DEFAULT_OWNER_USER_KEY,
    displayName: "User 1",
    email: "creator@example.test",
    role: "Creator",
  },
  {
    id: PROJECT_WORKSPACE_VIEWER_USER_KEY,
    displayName: "User 3",
    email: "guest@example.test",
    role: "Guest",
  },
]);

const DEMO_PROJECT = Object.freeze({
  id: "demo-project",
  ownerUserId: PROJECT_WORKSPACE_DEFAULT_OWNER_USER_KEY,
  name: "Demo Project",
  purpose: "Game Project",
  status: "Under Construction",
});

const CAPABILITY_DEMO_PROJECTS = Object.freeze([
  {
    id: "gravity-demo",
    ownerUserId: PROJECT_WORKSPACE_DEFAULT_OWNER_USER_KEY,
    name: "Gravity Demo",
    purpose: "Capability Demo",
    status: "Wireframe",
  },
  {
    id: "collision-demo",
    ownerUserId: PROJECT_WORKSPACE_DEFAULT_OWNER_USER_KEY,
    name: "Collision Demo",
    purpose: "Capability Demo",
    status: "Wireframe",
  },
  {
    id: "camera-follow-demo",
    ownerUserId: PROJECT_WORKSPACE_DEFAULT_OWNER_USER_KEY,
    name: "Camera Follow Demo",
    purpose: "Capability Demo",
    status: "Wireframe",
  },
]);

const DEMO_PROJECT_MEMBERS = Object.freeze([
  {
    projectId: "demo-project",
    userId: PROJECT_WORKSPACE_DEFAULT_OWNER_USER_KEY,
    permission: "Owner",
    role: "Owner",
  },
  {
    projectId: "demo-project",
    userId: PROJECT_WORKSPACE_ADMIN_USER_KEY,
    permission: "Admin",
    role: "Owner",
  },
  {
    projectId: "demo-project",
    userId: PROJECT_WORKSPACE_VIEWER_USER_KEY,
    permission: "Viewer",
    role: "Viewer",
  },
]);

const CAPABILITY_DEMO_PROJECT_MEMBERS = Object.freeze(
  CAPABILITY_DEMO_PROJECTS.flatMap((project) => [
    {
      projectId: project.id,
      userId: PROJECT_WORKSPACE_DEFAULT_OWNER_USER_KEY,
      permission: "Owner",
      role: "Owner",
    },
    {
      projectId: project.id,
      userId: PROJECT_WORKSPACE_ADMIN_USER_KEY,
      permission: "Admin",
      role: "Owner",
    },
    {
      projectId: project.id,
      userId: PROJECT_WORKSPACE_VIEWER_USER_KEY,
      permission: "Viewer",
      role: "Viewer",
    },
  ]),
);

const SEED_PROJECTS = Object.freeze([
  DEMO_PROJECT,
  ...CAPABILITY_DEMO_PROJECTS,
]);

const SEED_PROJECT_MEMBERS = Object.freeze([
  ...DEMO_PROJECT_MEMBERS,
  ...CAPABILITY_DEMO_PROJECT_MEMBERS,
]);

export const PROJECT_WORKSPACE_PROJECT_PURPOSES = Object.freeze([
  "Game Project",
  "Capability Demo",
  "Learning Project",
  "Template Project",
]);

export const PROJECT_WORKSPACE_PROJECT_STATUSES = Object.freeze([
  "Planning",
  "Under Construction",
  "Ready for Testing",
  "Ready for Publish",
]);

export const PROJECT_WORKSPACE_MEMBER_ROLES = Object.freeze([
  "Owner",
  "Designer",
  "World Builder",
  "Artist",
  "Audio Creator",
  "Translator",
  "Tester",
  "Publisher",
  "Viewer",
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
  projects: Object.freeze(["id", "ownerUserId", "name", "purpose", "status"]),
  project_members: Object.freeze(["projectId", "userId", "permission", "role"]),
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
    projects: cloneRows(SEED_PROJECTS),
    project_members: cloneRows(SEED_PROJECT_MEMBERS),
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
        permission: member.permission || member.role || "Viewer",
        role: member.role || member.permission || "Viewer",
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
      purpose: project.purpose || "Game Project",
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
        projectStatus: "No Game",
        projectProgress: "No active game",
        publishingProgress: "Not started",
        currentFocus: "Create or seed a project",
        recommendedNextTool: "Game Workspace",
        requiredForTestable: false,
        requiredForPublish: false,
        progressChecklist: [
          { label: "Create game identity", status: "Ready" },
          { label: "Configure game details", status: "Planned" },
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
        { label: "Game identity", status: "Complete" },
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

    SEED_PROJECTS.forEach((seedProject) => {
      if (!getProjectById(seedProject.id)) {
        tables.projects.push({ ...seedProject });
      }
    });

    SEED_PROJECT_MEMBERS.forEach((seedMember) => {
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
    const ownerUserId = input.ownerUserId || PROJECT_WORKSPACE_DEFAULT_OWNER_USER_KEY;
    const purpose = PROJECT_WORKSPACE_PROJECT_PURPOSES.includes(input.purpose)
      ? input.purpose
      : "Game Project";
    const baseId = slugifyProjectName(name);
    let candidateId = `${baseId}-${projectCounter}`;
    projectCounter += 1;

    while (getProjectById(candidateId)) {
      candidateId = `${baseId}-${projectCounter}`;
      projectCounter += 1;
    }

    const status = PROJECT_WORKSPACE_PROJECT_STATUSES.includes(input.status)
      ? input.status
      : "Under Construction";

    const project = {
      id: candidateId,
      ownerUserId,
      name,
      purpose,
      status,
    };

    tables.projects.push(project);
    tables.project_members.push({
      projectId: project.id,
      userId: ownerUserId,
      permission: "Owner",
      role: "Owner",
    });

    activeProjectId = project.id;
    return describeProject(project);
  }

  function updateProjectPurpose(projectId, purpose) {
    const project = getProjectById(projectId);

    if (!project || !PROJECT_WORKSPACE_PROJECT_PURPOSES.includes(purpose)) {
      return describeProject(project);
    }

    project.purpose = purpose;
    return describeProject(project);
  }

  function updateProjectStatus(projectId, status) {
    const project = getProjectById(projectId);

    if (!project || !PROJECT_WORKSPACE_PROJECT_STATUSES.includes(status)) {
      return describeProject(project);
    }

    project.status = status;
    return describeProject(project);
  }

  function updateProjectMemberRole(projectId, userId, role) {
    if (!PROJECT_WORKSPACE_MEMBER_ROLES.includes(role)) {
      return getSnapshot();
    }

    const member = tables.project_members.find(
      (item) => item.projectId === projectId && item.userId === userId,
    );

    if (member) {
      member.role = role;
      if (!member.permission) {
        member.permission = role === "Owner" ? "Owner" : role === "Viewer" ? "Viewer" : "Editor";
      }
    }

    return getSnapshot();
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
    updateProjectMemberRole,
    updateProjectPurpose,
    updateProjectStatus,
  };
}
