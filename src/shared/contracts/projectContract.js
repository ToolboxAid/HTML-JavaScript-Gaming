/*
Toolbox Aid
David Quesenberry
06/02/2026
projectContract.js
*/
import {
  IDENTITY_PERMISSION_SCOPES,
  IDENTITY_PERMISSIONS,
  IDENTITY_ROLES,
  IDENTITY_VISIBILITY_STATES,
  canActorPerformPermission,
  isIdentityPermission,
} from "./identityPermissionsContract.js";

export const PROJECT_CONTRACT_ID = "gamefoundrystudio.project.lifecycle";
export const PROJECT_CONTRACT_VERSION = "1.0.0";

export const PROJECT_STATES = Object.freeze({
  DRAFT: "draft",
  ACTIVE: "active",
  ARCHIVED: "archived",
  PUBLISHED: "published",
  MARKETPLACE: "marketplace",
  RETIRED: "retired",
});

export const PROJECT_STATE_LIST = Object.freeze([
  PROJECT_STATES.DRAFT,
  PROJECT_STATES.ACTIVE,
  PROJECT_STATES.ARCHIVED,
  PROJECT_STATES.PUBLISHED,
  PROJECT_STATES.MARKETPLACE,
  PROJECT_STATES.RETIRED,
]);

export const PROJECT_ROLES = Object.freeze({
  OWNER: "owner",
  COLLABORATOR: "collaborator",
  VIEWER: "viewer",
});

export const PROJECT_ROLE_LIST = Object.freeze([
  PROJECT_ROLES.OWNER,
  PROJECT_ROLES.COLLABORATOR,
  PROJECT_ROLES.VIEWER,
]);

export const PROJECT_VISIBILITY_STATES = Object.freeze({
  PRIVATE: "private",
  PROJECT: "project",
  UNLISTED: "unlisted",
  PUBLIC: "public",
});

export const PROJECT_VISIBILITY_LIST = Object.freeze([
  PROJECT_VISIBILITY_STATES.PRIVATE,
  PROJECT_VISIBILITY_STATES.PROJECT,
  PROJECT_VISIBILITY_STATES.UNLISTED,
  PROJECT_VISIBILITY_STATES.PUBLIC,
]);

export const PROJECT_RELATIONSHIPS = Object.freeze({
  TOOL_STATES: "tool-states",
  ASSETS: "assets",
  PALETTES: "palettes",
  GAME_MANIFEST: "game-manifest",
  RELEASES: "releases",
  MARKETPLACE_ITEMS: "marketplace-items",
});

export const PROJECT_RELATIONSHIP_LIST = Object.freeze([
  PROJECT_RELATIONSHIPS.TOOL_STATES,
  PROJECT_RELATIONSHIPS.ASSETS,
  PROJECT_RELATIONSHIPS.PALETTES,
  PROJECT_RELATIONSHIPS.GAME_MANIFEST,
  PROJECT_RELATIONSHIPS.RELEASES,
  PROJECT_RELATIONSHIPS.MARKETPLACE_ITEMS,
]);

export const PROJECT_ROLE_PERMISSION_GRANTS = Object.freeze({
  [PROJECT_ROLES.OWNER]: Object.freeze([
    IDENTITY_PERMISSIONS.VIEW,
    IDENTITY_PERMISSIONS.CREATE,
    IDENTITY_PERMISSIONS.EDIT,
    IDENTITY_PERMISSIONS.DELETE,
    IDENTITY_PERMISSIONS.SHARE,
    IDENTITY_PERMISSIONS.PUBLISH,
  ]),
  [PROJECT_ROLES.COLLABORATOR]: Object.freeze([
    IDENTITY_PERMISSIONS.VIEW,
    IDENTITY_PERMISSIONS.EDIT,
  ]),
  [PROJECT_ROLES.VIEWER]: Object.freeze([
    IDENTITY_PERMISSIONS.VIEW,
  ]),
});

export const PROJECT_INACTIVE_STATES = Object.freeze([
  PROJECT_STATES.ARCHIVED,
  PROJECT_STATES.RETIRED,
]);

export const PROJECT_CONTRACT_ERRORS = Object.freeze({
  OWNER_REQUIRED: "PROJECT_OWNER_REQUIRED",
  VISIBILITY_REQUIRED: "PROJECT_VISIBILITY_REQUIRED",
  VISIBILITY_INVALID: "PROJECT_VISIBILITY_INVALID",
  STATE_REQUIRED: "PROJECT_STATE_REQUIRED",
  STATE_INVALID: "PROJECT_STATE_INVALID",
  ROLE_INVALID: "PROJECT_ROLE_INVALID",
  RELATIONSHIP_INVALID: "PROJECT_RELATIONSHIP_INVALID",
});

export function isProjectState(value) {
  return PROJECT_STATE_LIST.includes(value);
}

export function isProjectRole(value) {
  return PROJECT_ROLE_LIST.includes(value);
}

export function isProjectVisibility(value) {
  return PROJECT_VISIBILITY_LIST.includes(value);
}

export function isProjectRelationship(value) {
  return PROJECT_RELATIONSHIP_LIST.includes(value);
}

export function validateProjectContract(project) {
  const errors = [];

  if (!hasNonEmptyString(project?.ownerId)) {
    errors.push(createContractError(
      PROJECT_CONTRACT_ERRORS.OWNER_REQUIRED,
      "Project records require ownerId.",
      "ownerId"
    ));
  }

  if (!hasNonEmptyString(project?.visibility)) {
    errors.push(createContractError(
      PROJECT_CONTRACT_ERRORS.VISIBILITY_REQUIRED,
      "Project records require explicit visibility.",
      "visibility"
    ));
  } else if (!isProjectVisibility(project.visibility)) {
    errors.push(createContractError(
      PROJECT_CONTRACT_ERRORS.VISIBILITY_INVALID,
      "Project visibility must be an allowed project visibility state.",
      "visibility"
    ));
  }

  if (!hasNonEmptyString(project?.state)) {
    errors.push(createContractError(
      PROJECT_CONTRACT_ERRORS.STATE_REQUIRED,
      "Project records require explicit state.",
      "state"
    ));
  } else if (!isProjectState(project.state)) {
    errors.push(createContractError(
      PROJECT_CONTRACT_ERRORS.STATE_INVALID,
      "Project state must be an allowed project lifecycle state.",
      "state"
    ));
  }

  if (Array.isArray(project?.members)) {
    project.members.forEach((member, index) => {
      if (!isProjectRole(member?.role)) {
        errors.push(createContractError(
          PROJECT_CONTRACT_ERRORS.ROLE_INVALID,
          "Project member role must be an allowed project role.",
          `members[${index}].role`
        ));
      }
    });
  }

  if (Array.isArray(project?.relationships)) {
    project.relationships.forEach((relationship, index) => {
      if (!isProjectRelationship(relationship)) {
        errors.push(createContractError(
          PROJECT_CONTRACT_ERRORS.RELATIONSHIP_INVALID,
          "Project relationship must be an allowed project relationship.",
          `relationships[${index}]`
        ));
      }
    });
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function isMarketplaceProject(project) {
  return project?.state === PROJECT_STATES.MARKETPLACE;
}

export function canEditProjectState(project, policy = {}) {
  if (project?.state === PROJECT_STATES.ARCHIVED) {
    return policy.allowArchivedProjectEdit === true;
  }

  if (project?.state === PROJECT_STATES.RETIRED) {
    return policy.allowRetiredProjectEdit === true;
  }

  return isProjectState(project?.state);
}

export function canActorAccessProject({
  actorId,
  projectRole,
  permission,
  project,
  grantedProjectIds = [],
  grantedScopes = [],
  policy = {},
} = {}) {
  if (!isProjectRole(projectRole) || !isIdentityPermission(permission) || !isProjectVisibleToActor(actorId, project, grantedProjectIds)) {
    return false;
  }

  if (permission === IDENTITY_PERMISSIONS.EDIT && !canEditProjectState(project, policy)) {
    return false;
  }

  if (projectRole === PROJECT_ROLES.OWNER) {
    return actorId === project?.ownerId
      && PROJECT_ROLE_PERMISSION_GRANTS[PROJECT_ROLES.OWNER].includes(permission);
  }

  if (projectRole === PROJECT_ROLES.VIEWER) {
    return permission === IDENTITY_PERMISSIONS.VIEW;
  }

  if (projectRole === PROJECT_ROLES.COLLABORATOR && permission === IDENTITY_PERMISSIONS.EDIT) {
    return canActorPerformPermission({
      actorId,
      role: IDENTITY_ROLES.CONTRIBUTOR,
      permission,
      scope: IDENTITY_PERMISSION_SCOPES.PROJECT,
      grantedScopes,
      object: {
        ownerId: project?.ownerId,
        visibility: mapProjectVisibilityToIdentityVisibility(project?.visibility),
      },
    });
  }

  return PROJECT_ROLE_PERMISSION_GRANTS[projectRole].includes(permission);
}

export function isProjectVisibleToActor(actorId, project, grantedProjectIds = []) {
  if (!hasNonEmptyString(actorId) || !project) {
    return false;
  }

  if (actorId === project.ownerId) {
    return true;
  }

  if (project.visibility === PROJECT_VISIBILITY_STATES.PUBLIC || project.visibility === PROJECT_VISIBILITY_STATES.UNLISTED) {
    return true;
  }

  return Array.isArray(grantedProjectIds) && grantedProjectIds.includes(project.id);
}

function mapProjectVisibilityToIdentityVisibility(visibility) {
  if (visibility === PROJECT_VISIBILITY_STATES.PROJECT) {
    return IDENTITY_VISIBILITY_STATES.PROJECT;
  }

  if (visibility === PROJECT_VISIBILITY_STATES.UNLISTED) {
    return IDENTITY_VISIBILITY_STATES.UNLISTED;
  }

  if (visibility === PROJECT_VISIBILITY_STATES.PUBLIC) {
    return IDENTITY_VISIBILITY_STATES.PUBLIC;
  }

  return IDENTITY_VISIBILITY_STATES.PRIVATE;
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function createContractError(code, message, path) {
  return Object.freeze({ code, message, path });
}
