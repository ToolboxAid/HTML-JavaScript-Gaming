/*
Toolbox Aid
David Quesenberry
06/02/2026
identityPermissionsContract.js
*/
export const IDENTITY_PERMISSIONS_CONTRACT_ID = "gamefoundrystudio.identity.permissions";
export const IDENTITY_PERMISSIONS_CONTRACT_VERSION = "1.0.0";

export const IDENTITY_ROLES = Object.freeze({
  OWNER: "owner",
  ADMIN: "admin",
  MODERATOR: "moderator",
  CREATOR: "creator",
  CONTRIBUTOR: "contributor",
  REVIEWER: "reviewer",
  PLAYER: "player",
  GUEST: "guest",
});

export const IDENTITY_ROLE_LIST = Object.freeze([
  IDENTITY_ROLES.OWNER,
  IDENTITY_ROLES.ADMIN,
  IDENTITY_ROLES.MODERATOR,
  IDENTITY_ROLES.CREATOR,
  IDENTITY_ROLES.CONTRIBUTOR,
  IDENTITY_ROLES.REVIEWER,
  IDENTITY_ROLES.PLAYER,
  IDENTITY_ROLES.GUEST,
]);

export const IDENTITY_PERMISSIONS = Object.freeze({
  VIEW: "view",
  CREATE: "create",
  EDIT: "edit",
  DELETE: "delete",
  SHARE: "share",
  PUBLISH: "publish",
  REVIEW: "review",
  APPROVE: "approve",
  MODERATE: "moderate",
  ADMINISTER: "administer",
});

export const IDENTITY_PERMISSION_LIST = Object.freeze([
  IDENTITY_PERMISSIONS.VIEW,
  IDENTITY_PERMISSIONS.CREATE,
  IDENTITY_PERMISSIONS.EDIT,
  IDENTITY_PERMISSIONS.DELETE,
  IDENTITY_PERMISSIONS.SHARE,
  IDENTITY_PERMISSIONS.PUBLISH,
  IDENTITY_PERMISSIONS.REVIEW,
  IDENTITY_PERMISSIONS.APPROVE,
  IDENTITY_PERMISSIONS.MODERATE,
  IDENTITY_PERMISSIONS.ADMINISTER,
]);

export const IDENTITY_VISIBILITY_STATES = Object.freeze({
  PRIVATE: "private",
  SHARED: "shared",
  PROJECT: "project",
  TEAM: "team",
  UNLISTED: "unlisted",
  PUBLIC: "public",
  MARKETPLACE: "marketplace",
  ADMIN_ONLY: "admin-only",
});

export const IDENTITY_VISIBILITY_LIST = Object.freeze([
  IDENTITY_VISIBILITY_STATES.PRIVATE,
  IDENTITY_VISIBILITY_STATES.SHARED,
  IDENTITY_VISIBILITY_STATES.PROJECT,
  IDENTITY_VISIBILITY_STATES.TEAM,
  IDENTITY_VISIBILITY_STATES.UNLISTED,
  IDENTITY_VISIBILITY_STATES.PUBLIC,
  IDENTITY_VISIBILITY_STATES.MARKETPLACE,
  IDENTITY_VISIBILITY_STATES.ADMIN_ONLY,
]);

export const IDENTITY_PERMISSION_SCOPES = Object.freeze({
  OWNED_OBJECT: "owned-object",
  USER: "user",
  PROJECT: "project",
  REVIEW: "review",
  COMMUNITY: "community",
  PUBLIC: "public",
  MARKETPLACE: "marketplace",
  PLATFORM: "platform",
});

export const IDENTITY_OWNERSHIP_RULES = Object.freeze({
  DATABASE_OBJECTS_REQUIRE_OWNER: true,
  SHAREABLE_OBJECTS_REQUIRE_VISIBILITY: true,
  EDITABLE_OBJECTS_REQUIRE_PERMISSIONS: true,
});

export const IDENTITY_OBJECT_CONTROL_PERMISSIONS = Object.freeze([
  IDENTITY_PERMISSIONS.VIEW,
  IDENTITY_PERMISSIONS.CREATE,
  IDENTITY_PERMISSIONS.EDIT,
  IDENTITY_PERMISSIONS.DELETE,
  IDENTITY_PERMISSIONS.SHARE,
  IDENTITY_PERMISSIONS.PUBLISH,
  IDENTITY_PERMISSIONS.REVIEW,
  IDENTITY_PERMISSIONS.APPROVE,
]);

export const IDENTITY_ROLE_PERMISSION_GRANTS = Object.freeze({
  [IDENTITY_ROLES.OWNER]: IDENTITY_OBJECT_CONTROL_PERMISSIONS,
  [IDENTITY_ROLES.ADMIN]: Object.freeze([
    IDENTITY_PERMISSIONS.VIEW,
    IDENTITY_PERMISSIONS.ADMINISTER,
  ]),
  [IDENTITY_ROLES.MODERATOR]: Object.freeze([
    IDENTITY_PERMISSIONS.VIEW,
    IDENTITY_PERMISSIONS.MODERATE,
  ]),
  [IDENTITY_ROLES.CREATOR]: Object.freeze([
    IDENTITY_PERMISSIONS.VIEW,
    IDENTITY_PERMISSIONS.CREATE,
    IDENTITY_PERMISSIONS.EDIT,
    IDENTITY_PERMISSIONS.DELETE,
    IDENTITY_PERMISSIONS.SHARE,
    IDENTITY_PERMISSIONS.PUBLISH,
  ]),
  [IDENTITY_ROLES.CONTRIBUTOR]: Object.freeze([
    IDENTITY_PERMISSIONS.VIEW,
    IDENTITY_PERMISSIONS.EDIT,
  ]),
  [IDENTITY_ROLES.REVIEWER]: Object.freeze([
    IDENTITY_PERMISSIONS.VIEW,
    IDENTITY_PERMISSIONS.REVIEW,
    IDENTITY_PERMISSIONS.APPROVE,
  ]),
  [IDENTITY_ROLES.PLAYER]: Object.freeze([
    IDENTITY_PERMISSIONS.VIEW,
  ]),
  [IDENTITY_ROLES.GUEST]: Object.freeze([
    IDENTITY_PERMISSIONS.VIEW,
  ]),
});

export const IDENTITY_ROLE_SCOPE_GRANTS = Object.freeze({
  [IDENTITY_ROLES.ADMIN]: Object.freeze([
    IDENTITY_PERMISSION_SCOPES.PLATFORM,
  ]),
  [IDENTITY_ROLES.MODERATOR]: Object.freeze([
    IDENTITY_PERMISSION_SCOPES.COMMUNITY,
    IDENTITY_PERMISSION_SCOPES.PUBLIC,
    IDENTITY_PERMISSION_SCOPES.MARKETPLACE,
  ]),
  [IDENTITY_ROLES.REVIEWER]: Object.freeze([
    IDENTITY_PERMISSION_SCOPES.REVIEW,
  ]),
});

export const IDENTITY_PERMISSION_ERRORS = Object.freeze({
  OWNER_REQUIRED: "OWNER_REQUIRED",
  VISIBILITY_REQUIRED: "VISIBILITY_REQUIRED",
  VISIBILITY_INVALID: "VISIBILITY_INVALID",
  PERMISSIONS_REQUIRED: "PERMISSIONS_REQUIRED",
  PERMISSION_INVALID: "PERMISSION_INVALID",
});

export function isIdentityRole(value) {
  return IDENTITY_ROLE_LIST.includes(value);
}

export function isIdentityPermission(value) {
  return IDENTITY_PERMISSION_LIST.includes(value);
}

export function isIdentityVisibility(value) {
  return IDENTITY_VISIBILITY_LIST.includes(value);
}

export function validateIdentityPermissionObject(object) {
  const errors = [];

  if (!hasNonEmptyString(object?.ownerId)) {
    errors.push(createContractError(
      IDENTITY_PERMISSION_ERRORS.OWNER_REQUIRED,
      "Database objects require ownerId.",
      "ownerId"
    ));
  }

  if (object?.shareable === true) {
    if (!hasNonEmptyString(object.visibility)) {
      errors.push(createContractError(
        IDENTITY_PERMISSION_ERRORS.VISIBILITY_REQUIRED,
        "Shareable objects require explicit visibility.",
        "visibility"
      ));
    } else if (!isIdentityVisibility(object.visibility)) {
      errors.push(createContractError(
        IDENTITY_PERMISSION_ERRORS.VISIBILITY_INVALID,
        "Shareable object visibility must be an allowed identity visibility state.",
        "visibility"
      ));
    }
  }

  if (object?.editable === true) {
    if (!Array.isArray(object.permissions) || object.permissions.length === 0) {
      errors.push(createContractError(
        IDENTITY_PERMISSION_ERRORS.PERMISSIONS_REQUIRED,
        "Editable objects require explicit permissions.",
        "permissions"
      ));
    } else {
      for (const permission of object.permissions) {
        if (!isIdentityPermission(permission)) {
          errors.push(createContractError(
            IDENTITY_PERMISSION_ERRORS.PERMISSION_INVALID,
            "Editable object permissions must use allowed identity permissions.",
            "permissions"
          ));
        }
      }
    }
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function canActorPerformPermission({
  actorId,
  role,
  permission,
  object,
  scope,
  grantedScopes = [],
} = {}) {
  if (!isIdentityRole(role) || !isIdentityPermission(permission)) {
    return false;
  }

  if (role === IDENTITY_ROLES.GUEST) {
    return permission === IDENTITY_PERMISSIONS.VIEW
      && object?.visibility === IDENTITY_VISIBILITY_STATES.PUBLIC;
  }

  if (role === IDENTITY_ROLES.OWNER) {
    return hasNonEmptyString(actorId)
      && actorId === object?.ownerId
      && IDENTITY_OBJECT_CONTROL_PERMISSIONS.includes(permission);
  }

  const permissions = IDENTITY_ROLE_PERMISSION_GRANTS[role] ?? [];
  if (!permissions.includes(permission)) {
    return false;
  }

  if (role === IDENTITY_ROLES.CONTRIBUTOR || role === IDENTITY_ROLES.REVIEWER) {
    return hasGrantedScope(scope, grantedScopes);
  }

  const roleScopes = IDENTITY_ROLE_SCOPE_GRANTS[role];
  if (roleScopes) {
    return roleScopes.includes(scope);
  }

  return true;
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasGrantedScope(scope, grantedScopes) {
  return hasNonEmptyString(scope)
    && Array.isArray(grantedScopes)
    && grantedScopes.includes(scope);
}

function createContractError(code, message, path) {
  return Object.freeze({ code, message, path });
}
