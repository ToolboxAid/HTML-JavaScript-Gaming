import {
  GAME_WORKSPACE_ADMIN_USER_KEY,
  GAME_WORKSPACE_DEFAULT_OWNER_USER_KEY,
  GAME_WORKSPACE_MEMBER_ROLES,
  GAME_WORKSPACE_VIEWER_USER_KEY,
} from "./game-workspace-mock-repository.js";
import { MOCK_DB_KEYS } from "../mock-db-store.js";
import { makeSeedUlid } from "../../seed/seed-db-keys.mjs";

export const GAME_CREW_TABLES = Object.freeze(["project_members"]);
export const GAME_CREW_MEMBER_ROLES = Object.freeze([
  "Owner",
  "Member",
  "Viewer",
]);

const USER_LABELS = Object.freeze({
  [GAME_WORKSPACE_ADMIN_USER_KEY]: "DavidQ",
  [GAME_WORKSPACE_DEFAULT_OWNER_USER_KEY]: "User 1",
  [GAME_WORKSPACE_VIEWER_USER_KEY]: "User 3",
});

function auditFields(index = 0, userKey = MOCK_DB_KEYS.users.forgeBot) {
  const timestamp = new Date(Date.UTC(2026, 0, 1, 12, index, 0)).toISOString();
  return {
    createdAt: timestamp,
    createdBy: userKey,
    updatedAt: timestamp,
    updatedBy: userKey,
  };
}

function normalizeCrewRole(role) {
  return role === "Owner" ? "Owner" : role === "Viewer" ? "Viewer" : "Member";
}

function memberKey(projectKey, userKey, index) {
  const stableIndex = 8200 + index;
  return makeSeedUlid(stableIndex + String(projectKey || "").length + String(userKey || "").length);
}

export function createGameCrewMockRepository({
  gameWorkspaceRepository,
  sessionUserKey = () => "",
} = {}) {
  function activeProject() {
    return gameWorkspaceRepository?.getActiveGame?.() || null;
  }

  function projectMembers(project = activeProject()) {
    const members = Array.isArray(project?.members) ? project.members : [];
    return members.map((member, index) => {
      const role = normalizeCrewRole(member.role || member.permission);
      const auditUserKey = project.ownerKey || GAME_WORKSPACE_DEFAULT_OWNER_USER_KEY;
      const createdAt = auditFields(index, auditUserKey).createdAt;
      return {
        key: memberKey(project.id, member.userKey, index),
        projectKey: project.id,
        userKey: member.userKey,
        displayName: member.displayName || USER_LABELS[member.userKey] || member.userKey,
        role,
        status: "active",
        invitedBy: "",
        invitedAt: "",
        joinedAt: createdAt,
        removedAt: "",
        ...auditFields(index, auditUserKey),
      };
    });
  }

  function getTables() {
    return {
      project_members: projectMembers(),
    };
  }

  function getSnapshot() {
    const project = activeProject();
    const members = project ? projectMembers(project) : [];
    const owner = members.find((member) => member.role === "Owner") || null;
    const tables = getTables();
    return {
      activeProject: project
        ? {
            key: project.id,
            name: project.name,
            ownerKey: project.ownerKey,
            ownerDisplayName: project.ownerDisplayName,
            status: project.status,
          }
        : null,
      guidance: "Project crew membership is ready for owner and member planning. Invitations and permissions are planned for a later pass.",
      memberRoles: GAME_CREW_MEMBER_ROLES.slice(),
      members,
      owner,
      status: project ? "Ready" : "Needs Project",
      tableCounts: GAME_CREW_TABLES.map((table) => ({
        rows: tables[table]?.length || 0,
        table,
      })),
      tables,
    };
  }

  function listMembers() {
    return getSnapshot().members;
  }

  function readAddMemberPlaceholder() {
    const signedIn = Boolean(typeof sessionUserKey === "function" ? sessionUserKey() : sessionUserKey);
    return {
      requiresSignIn: !signedIn,
      message: signedIn
        ? "Member invitations are planned for the next crew workflow pass."
        : "Sign in before changing project crew membership.",
      status: signedIn ? "Planned" : "Sign In Required",
    };
  }

  function readRemoveMemberPlaceholder(userKey = "") {
    const member = listMembers().find((candidate) => candidate.userKey === userKey) || null;
    return {
      member,
      message: member?.role === "Owner"
        ? "Project owners stay on the crew while owner transfer is planned."
        : "Member removal is planned for the next crew workflow pass.",
      status: "Planned",
    };
  }

  return {
    GAME_CREW_MEMBER_ROLES,
    GAME_CREW_TABLES,
    gameWorkspaceMemberRoles: GAME_WORKSPACE_MEMBER_ROLES,
    getSnapshot,
    getTables,
    listMembers,
    readAddMemberPlaceholder,
    readRemoveMemberPlaceholder,
  };
}
