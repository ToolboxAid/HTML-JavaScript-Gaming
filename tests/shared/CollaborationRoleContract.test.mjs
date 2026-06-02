/*
Toolbox Aid
David Quesenberry
06/02/2026
CollaborationRoleContract.test.mjs
*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  IDENTITY_PERMISSIONS,
  IDENTITY_ROLES,
} from "../../src/shared/contracts/identityPermissionsContract.js";
import {
  COLLABORATION_ROLE_CONTRACT_ERRORS,
  COLLABORATION_ROLE_CONTRACT_ID,
  COLLABORATION_ROLE_CONTRACT_VERSION,
  COLLABORATION_ROLE_FIELD_LIST,
  COLLABORATION_ROLE_FORBIDDEN_FIELDS,
  COLLABORATION_ROLE_LIST,
  COLLABORATION_ROLE_SUBJECT_TYPE_LIST,
  canActorAccessCollaborationRole,
  canActorUseCollaborationRolePermission,
  isCollaborationRole,
  isCollaborationRoleSubjectType,
  isCollaborationRoleVisibility,
  isCollaborationRoleVisibleToActor,
  validateCollaborationRoleContract,
} from "../../src/shared/contracts/collaborationRoleContract.js";

const scenariosPath = fileURLToPath(
  new URL("../fixtures/collaboration-roles/collaboration-role-scenarios.json", import.meta.url)
);

export function run() {
  const scenarios = JSON.parse(readFileSync(scenariosPath, "utf8"));

  assert.equal(COLLABORATION_ROLE_CONTRACT_ID, "gamefoundrystudio.collaboration.role.contract");
  assert.equal(COLLABORATION_ROLE_CONTRACT_VERSION, "1.0.0");
  assert.deepEqual(COLLABORATION_ROLE_FIELD_LIST, [
    "collaborationRoleId",
    "ownerId",
    "projectId",
    "subjectType",
    "subjectId",
    "role",
    "permissions",
    "visibility",
    "grantedAt",
    "expiresAt",
    "roleNotes",
  ]);
  assert.deepEqual(COLLABORATION_ROLE_SUBJECT_TYPE_LIST, ["user", "creatorProfile", "organization"]);
  assert.deepEqual(COLLABORATION_ROLE_LIST, ["owner", "admin", "collaborator", "viewer"]);
  assert.equal(COLLABORATION_ROLE_FORBIDDEN_FIELDS.includes("authSessionState"), true);
  assert.equal(COLLABORATION_ROLE_FORBIDDEN_FIELDS.includes("workspaceState"), true);
  assert.equal(COLLABORATION_ROLE_FORBIDDEN_FIELDS.includes("toolState"), true);
  assertUnique(COLLABORATION_ROLE_FORBIDDEN_FIELDS);

  assert.equal(isCollaborationRoleSubjectType("creatorProfile"), true);
  assert.equal(isCollaborationRoleSubjectType("team"), false);
  assert.equal(isCollaborationRole("collaborator"), true);
  assert.equal(isCollaborationRole("producer"), false);
  assert.equal(isCollaborationRoleVisibility("project"), true);
  assert.equal(isCollaborationRoleVisibility("marketplace"), false);

  for (const scenario of scenarios.validCollaborationRoles) {
    const collaborationRole = buildScenario(scenarios.baseCollaborationRole, scenario);
    const validation = validateCollaborationRoleContract(collaborationRole);
    assert.equal(validation.valid, true, scenario.name);
    assert.deepEqual(validation.errors, scenario.expectedErrors, scenario.name);
  }

  for (const scenario of scenarios.invalidCollaborationRoles) {
    const collaborationRole = buildScenario(scenarios.baseCollaborationRole, scenario);
    const validation = validateCollaborationRoleContract(collaborationRole);
    assert.equal(validation.valid, false, scenario.name);
    assert.deepEqual(validation.errors.map((error) => error.code), scenario.expectedErrors, scenario.name);
  }

  assertErrorForScenario(scenarios, "missing owner", COLLABORATION_ROLE_CONTRACT_ERRORS.OWNER_REQUIRED);
  assertErrorForScenario(scenarios, "missing project", COLLABORATION_ROLE_CONTRACT_ERRORS.PROJECT_REQUIRED);
  assertErrorForScenario(scenarios, "invalid subject type", COLLABORATION_ROLE_CONTRACT_ERRORS.SUBJECT_TYPE_INVALID);
  assertErrorForScenario(scenarios, "missing subject id", COLLABORATION_ROLE_CONTRACT_ERRORS.SUBJECT_ID_REQUIRED);
  assertErrorForScenario(scenarios, "invalid role", COLLABORATION_ROLE_CONTRACT_ERRORS.ROLE_INVALID);
  assertErrorForScenario(scenarios, "invalid permissions", COLLABORATION_ROLE_CONTRACT_ERRORS.PERMISSIONS_INVALID);
  assertErrorForScenario(scenarios, "invalid visibility", COLLABORATION_ROLE_CONTRACT_ERRORS.VISIBILITY_INVALID);
  assertErrorForScenario(scenarios, "auth session leakage", COLLABORATION_ROLE_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "runtime state leakage", COLLABORATION_ROLE_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "tool state leakage", COLLABORATION_ROLE_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);

  const collaborationRole = buildScenario(scenarios.baseCollaborationRole, scenarios.validCollaborationRoles[0]);
  assert.equal(isCollaborationRoleVisibleToActor({ actorId: "user.creator", collaborationRole }), true);
  assert.equal(isCollaborationRoleVisibleToActor({ actorId: "creator-profile.user.collaborator", collaborationRole }), true);
  assert.equal(canActorUseCollaborationRolePermission({
    actorId: "creator-profile.user.collaborator",
    permission: IDENTITY_PERMISSIONS.EDIT,
    collaborationRole,
  }), true);
  assert.equal(canActorAccessCollaborationRole({
    actorId: "platform.admin",
    role: IDENTITY_ROLES.ADMIN,
    permission: IDENTITY_PERMISSIONS.ADMINISTER,
    collaborationRole,
  }), true);
}

function assertErrorForScenario(scenarios, name, expectedErrorCode) {
  const scenario = scenarios.invalidCollaborationRoles.find((item) => item.name === name);
  const collaborationRole = buildScenario(scenarios.baseCollaborationRole, scenario);
  const validation = validateCollaborationRoleContract(collaborationRole);
  assert.equal(validation.errors.some((error) => error.code === expectedErrorCode), true, name);
}

function buildScenario(base, scenario) {
  const result = clone(base);
  mergeObject(result, scenario.overrides ?? {});
  return result;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeObject(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (isPlainObject(value) && isPlainObject(target[key])) {
      mergeObject(target[key], value);
    } else {
      target[key] = clone(value);
    }
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function assertUnique(values) {
  assert.equal(new Set(values).size, values.length);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  run();
}
