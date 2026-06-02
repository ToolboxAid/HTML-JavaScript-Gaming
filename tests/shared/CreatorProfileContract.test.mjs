/*
Toolbox Aid
David Quesenberry
06/02/2026
CreatorProfileContract.test.mjs
*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  IDENTITY_PERMISSIONS,
  IDENTITY_ROLES,
} from "../../src/shared/contracts/identityPermissionsContract.js";
import {
  CREATOR_PROFILE_CONTRACT_ERRORS,
  CREATOR_PROFILE_CONTRACT_ID,
  CREATOR_PROFILE_CONTRACT_VERSION,
  CREATOR_PROFILE_FIELD_LIST,
  CREATOR_PROFILE_FORBIDDEN_FIELDS,
  CREATOR_PROFILE_STATUS_LIST,
  canActorAccessCreatorProfile,
  isCreatorProfileHandle,
  isCreatorProfileStatus,
  isCreatorProfileVisibility,
  isCreatorProfileVisibleToActor,
  validateCreatorProfileContract,
} from "../../src/shared/contracts/creatorProfileContract.js";

const scenariosPath = fileURLToPath(
  new URL("../fixtures/creator-profiles/creator-profile-scenarios.json", import.meta.url)
);

export function run() {
  const scenarios = JSON.parse(readFileSync(scenariosPath, "utf8"));

  assert.equal(CREATOR_PROFILE_CONTRACT_ID, "gamefoundrystudio.creator.profile.contract");
  assert.equal(CREATOR_PROFILE_CONTRACT_VERSION, "1.0.0");
  assert.deepEqual(CREATOR_PROFILE_FIELD_LIST, [
    "creatorProfileId",
    "ownerId",
    "displayName",
    "handle",
    "visibility",
    "profileStatus",
    "createdAt",
    "profileNotes",
  ]);
  assert.deepEqual(CREATOR_PROFILE_STATUS_LIST, ["active", "suspended", "archived"]);
  assert.equal(CREATOR_PROFILE_FORBIDDEN_FIELDS.includes("authSessionState"), true);
  assert.equal(CREATOR_PROFILE_FORBIDDEN_FIELDS.includes("workspaceState"), true);
  assert.equal(CREATOR_PROFILE_FORBIDDEN_FIELDS.includes("toolState"), true);
  assertUnique(CREATOR_PROFILE_FORBIDDEN_FIELDS);

  assert.equal(isCreatorProfileHandle("ari-creator"), true);
  assert.equal(isCreatorProfileHandle("Bad Handle"), false);
  assert.equal(isCreatorProfileStatus("active"), true);
  assert.equal(isCreatorProfileStatus("pending"), false);
  assert.equal(isCreatorProfileVisibility("public"), true);
  assert.equal(isCreatorProfileVisibility("team"), false);

  for (const scenario of scenarios.validCreatorProfiles) {
    const profile = buildScenario(scenarios.baseCreatorProfile, scenario);
    const validation = validateCreatorProfileContract(profile);
    assert.equal(validation.valid, true, scenario.name);
    assert.deepEqual(validation.errors, scenario.expectedErrors, scenario.name);
  }

  for (const scenario of scenarios.invalidCreatorProfiles) {
    const profile = buildScenario(scenarios.baseCreatorProfile, scenario);
    const validation = validateCreatorProfileContract(profile);
    assert.equal(validation.valid, false, scenario.name);
    assert.deepEqual(validation.errors.map((error) => error.code), scenario.expectedErrors, scenario.name);
  }

  assertErrorForScenario(scenarios, "missing owner", CREATOR_PROFILE_CONTRACT_ERRORS.OWNER_REQUIRED);
  assertErrorForScenario(scenarios, "missing display name", CREATOR_PROFILE_CONTRACT_ERRORS.DISPLAY_NAME_REQUIRED);
  assertErrorForScenario(scenarios, "invalid handle", CREATOR_PROFILE_CONTRACT_ERRORS.HANDLE_INVALID);
  assertErrorForScenario(scenarios, "invalid visibility", CREATOR_PROFILE_CONTRACT_ERRORS.VISIBILITY_INVALID);
  assertErrorForScenario(scenarios, "invalid status", CREATOR_PROFILE_CONTRACT_ERRORS.PROFILE_STATUS_INVALID);
  assertErrorForScenario(scenarios, "auth session leakage", CREATOR_PROFILE_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "runtime state leakage", CREATOR_PROFILE_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "tool state leakage", CREATOR_PROFILE_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);

  const profile = buildScenario(scenarios.baseCreatorProfile, scenarios.validCreatorProfiles[0]);
  assert.equal(isCreatorProfileVisibleToActor({ actorId: "user.creator", profile }), true);
  assert.equal(isCreatorProfileVisibleToActor({ actorId: "public.viewer", profile }), true);
  assert.equal(canActorAccessCreatorProfile({
    actorId: "user.creator",
    permission: IDENTITY_PERMISSIONS.VIEW,
    profile,
  }), true);
  assert.equal(canActorAccessCreatorProfile({
    actorId: "platform.admin",
    role: IDENTITY_ROLES.ADMIN,
    permission: IDENTITY_PERMISSIONS.ADMINISTER,
    profile,
  }), true);
}

function assertErrorForScenario(scenarios, name, expectedErrorCode) {
  const scenario = scenarios.invalidCreatorProfiles.find((item) => item.name === name);
  const profile = buildScenario(scenarios.baseCreatorProfile, scenario);
  const validation = validateCreatorProfileContract(profile);
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
