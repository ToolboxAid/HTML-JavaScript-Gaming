/*
Toolbox Aid
David Quesenberry
06/02/2026
IdentityPermissionsContract.test.mjs
*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  IDENTITY_OBJECT_CONTROL_PERMISSIONS,
  IDENTITY_OWNERSHIP_RULES,
  IDENTITY_PERMISSION_ERRORS,
  IDENTITY_PERMISSION_LIST,
  IDENTITY_PERMISSION_SCOPES,
  IDENTITY_PERMISSIONS,
  IDENTITY_PERMISSIONS_CONTRACT_ID,
  IDENTITY_PERMISSIONS_CONTRACT_VERSION,
  IDENTITY_ROLE_LIST,
  IDENTITY_ROLE_PERMISSION_GRANTS,
  IDENTITY_ROLE_SCOPE_GRANTS,
  IDENTITY_ROLES,
  IDENTITY_VISIBILITY_LIST,
  IDENTITY_VISIBILITY_STATES,
  canActorPerformPermission,
  isIdentityPermission,
  isIdentityRole,
  isIdentityVisibility,
  validateIdentityPermissionObject,
} from "../../src/shared/contracts/identityPermissionsContract.js";

const scenariosPath = fileURLToPath(
  new URL("../fixtures/identity-permissions/permission-scenarios.json", import.meta.url)
);

export function run() {
  const scenarios = JSON.parse(readFileSync(scenariosPath, "utf8"));

  assert.equal(IDENTITY_PERMISSIONS_CONTRACT_ID, "gamefoundrystudio.identity.permissions");
  assert.equal(IDENTITY_PERMISSIONS_CONTRACT_VERSION, "1.0.0");
  assert.deepEqual(IDENTITY_ROLE_LIST, [
    "owner",
    "admin",
    "moderator",
    "creator",
    "contributor",
    "reviewer",
    "player",
    "guest",
  ]);
  assert.deepEqual(IDENTITY_PERMISSION_LIST, [
    "view",
    "create",
    "edit",
    "delete",
    "share",
    "publish",
    "review",
    "approve",
    "moderate",
    "administer",
  ]);
  assert.deepEqual(IDENTITY_VISIBILITY_LIST, [
    "private",
    "shared",
    "project",
    "team",
    "unlisted",
    "public",
    "marketplace",
    "admin-only",
  ]);
  assertUnique(IDENTITY_ROLE_LIST);
  assertUnique(IDENTITY_PERMISSION_LIST);
  assertUnique(IDENTITY_VISIBILITY_LIST);
  assert.equal(isIdentityRole(IDENTITY_ROLES.OWNER), true);
  assert.equal(isIdentityPermission(IDENTITY_PERMISSIONS.EDIT), true);
  assert.equal(isIdentityVisibility(IDENTITY_VISIBILITY_STATES.PROJECT), true);
  assert.equal(isIdentityRole("super-admin"), false);
  assert.equal(isIdentityPermission("launch"), false);
  assert.equal(isIdentityVisibility("hidden"), false);

  assert.equal(IDENTITY_OWNERSHIP_RULES.DATABASE_OBJECTS_REQUIRE_OWNER, true);
  assert.equal(IDENTITY_OWNERSHIP_RULES.SHAREABLE_OBJECTS_REQUIRE_VISIBILITY, true);
  assert.equal(IDENTITY_OWNERSHIP_RULES.EDITABLE_OBJECTS_REQUIRE_PERMISSIONS, true);

  for (const scenario of scenarios.validObjects) {
    const validation = validateIdentityPermissionObject(scenario.object);
    assert.equal(validation.valid, true, scenario.name);
    assert.deepEqual(validation.errors, scenario.expectedErrors, scenario.name);
  }

  for (const scenario of scenarios.invalidObjects) {
    const validation = validateIdentityPermissionObject(scenario.object);
    assert.equal(validation.valid, false, scenario.name);
    assert.deepEqual(validation.errors.map((error) => error.code), scenario.expectedErrors, scenario.name);
  }

  assertErrorForScenario(scenarios, "missing owner", IDENTITY_PERMISSION_ERRORS.OWNER_REQUIRED);
  assertErrorForScenario(scenarios, "shareable object missing visibility", IDENTITY_PERMISSION_ERRORS.VISIBILITY_REQUIRED);
  assertErrorForScenario(scenarios, "editable object missing permissions", IDENTITY_PERMISSION_ERRORS.PERMISSIONS_REQUIRED);

  for (const scenario of scenarios.permissionChecks) {
    assert.equal(canActorPerformPermission(scenario), scenario.expected, scenario.name);
  }

  for (const permission of IDENTITY_OBJECT_CONTROL_PERMISSIONS) {
    assert.equal(
      canActorPerformPermission({
        actorId: "user.owner",
        role: IDENTITY_ROLES.OWNER,
        permission,
        scope: IDENTITY_PERMISSION_SCOPES.OWNED_OBJECT,
        object: {
          ownerId: "user.owner",
          visibility: IDENTITY_VISIBILITY_STATES.PRIVATE,
        },
      }),
      true,
      `owner controls ${permission}`
    );
  }

  assert.equal(
    canActorPerformPermission({
      actorId: "user.other",
      role: IDENTITY_ROLES.OWNER,
      permission: IDENTITY_PERMISSIONS.DELETE,
      scope: IDENTITY_PERMISSION_SCOPES.OWNED_OBJECT,
      object: {
        ownerId: "user.owner",
        visibility: IDENTITY_VISIBILITY_STATES.PRIVATE,
      },
    }),
    false
  );

  assert.deepEqual(IDENTITY_ROLE_PERMISSION_GRANTS[IDENTITY_ROLES.ADMIN], ["view", "administer"]);
  assert.deepEqual(IDENTITY_ROLE_PERMISSION_GRANTS[IDENTITY_ROLES.MODERATOR], ["view", "moderate"]);
  assert.deepEqual(IDENTITY_ROLE_PERMISSION_GRANTS[IDENTITY_ROLES.REVIEWER], ["view", "review", "approve"]);
  assert.deepEqual(IDENTITY_ROLE_SCOPE_GRANTS[IDENTITY_ROLES.ADMIN], ["platform"]);
  assert.deepEqual(IDENTITY_ROLE_SCOPE_GRANTS[IDENTITY_ROLES.MODERATOR], ["community", "public", "marketplace"]);
  assert.deepEqual(IDENTITY_ROLE_SCOPE_GRANTS[IDENTITY_ROLES.REVIEWER], ["review"]);
  assert.equal(
    canActorPerformPermission({
      actorId: "admin.user",
      role: IDENTITY_ROLES.ADMIN,
      permission: IDENTITY_PERMISSIONS.MODERATE,
      scope: IDENTITY_PERMISSION_SCOPES.COMMUNITY,
      object: {
        ownerId: "user.owner",
        visibility: IDENTITY_VISIBILITY_STATES.PUBLIC,
      },
    }),
    false
  );
  assert.equal(
    canActorPerformPermission({
      actorId: "moderator.user",
      role: IDENTITY_ROLES.MODERATOR,
      permission: IDENTITY_PERMISSIONS.REVIEW,
      scope: IDENTITY_PERMISSION_SCOPES.REVIEW,
      object: {
        ownerId: "user.owner",
        visibility: IDENTITY_VISIBILITY_STATES.PUBLIC,
      },
    }),
    false
  );
}

function assertUnique(values) {
  assert.equal(new Set(values).size, values.length);
}

function assertErrorForScenario(scenarios, name, expectedErrorCode) {
  const scenario = scenarios.invalidObjects.find((item) => item.name === name);
  const validation = validateIdentityPermissionObject(scenario.object);
  assert.equal(validation.errors.some((error) => error.code === expectedErrorCode), true, name);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
