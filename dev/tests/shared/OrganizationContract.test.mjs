/*
Toolbox Aid
David Quesenberry
06/02/2026
OrganizationContract.test.mjs
*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  IDENTITY_PERMISSIONS,
  IDENTITY_ROLES,
} from "../../../src/shared/contracts/identityPermissionsContract.js";
import {
  ORGANIZATION_CONTRACT_ERRORS,
  ORGANIZATION_CONTRACT_ID,
  ORGANIZATION_CONTRACT_VERSION,
  ORGANIZATION_FIELD_LIST,
  ORGANIZATION_FORBIDDEN_FIELDS,
  ORGANIZATION_STATUS_LIST,
  canActorAccessOrganization,
  isOrganizationHandle,
  isOrganizationStatus,
  isOrganizationVisibility,
  isOrganizationVisibleToActor,
  validateOrganizationContract,
} from "../../../src/shared/contracts/organizationContract.js";

const scenariosPath = fileURLToPath(
  new URL("../fixtures/organizations/organization-scenarios.json", import.meta.url)
);

export function run() {
  const scenarios = JSON.parse(readFileSync(scenariosPath, "utf8"));

  assert.equal(ORGANIZATION_CONTRACT_ID, "gamefoundrystudio.organization.contract");
  assert.equal(ORGANIZATION_CONTRACT_VERSION, "1.0.0");
  assert.deepEqual(ORGANIZATION_FIELD_LIST, [
    "organizationId",
    "ownerId",
    "displayName",
    "handle",
    "visibility",
    "organizationStatus",
    "createdAt",
    "organizationNotes",
  ]);
  assert.deepEqual(ORGANIZATION_STATUS_LIST, ["active", "suspended", "archived"]);
  assert.equal(ORGANIZATION_FORBIDDEN_FIELDS.includes("authSessionState"), true);
  assert.equal(ORGANIZATION_FORBIDDEN_FIELDS.includes("workspaceState"), true);
  assert.equal(ORGANIZATION_FORBIDDEN_FIELDS.includes("toolState"), true);
  assertUnique(ORGANIZATION_FORBIDDEN_FIELDS);

  assert.equal(isOrganizationHandle("foundry-team"), true);
  assert.equal(isOrganizationHandle("Foundry Team"), false);
  assert.equal(isOrganizationStatus("active"), true);
  assert.equal(isOrganizationStatus("invited"), false);
  assert.equal(isOrganizationVisibility("public"), true);
  assert.equal(isOrganizationVisibility("project"), false);

  for (const scenario of scenarios.validOrganizations) {
    const organization = buildScenario(scenarios.baseOrganization, scenario);
    const validation = validateOrganizationContract(organization);
    assert.equal(validation.valid, true, scenario.name);
    assert.deepEqual(validation.errors, scenario.expectedErrors, scenario.name);
  }

  for (const scenario of scenarios.invalidOrganizations) {
    const organization = buildScenario(scenarios.baseOrganization, scenario);
    const validation = validateOrganizationContract(organization);
    assert.equal(validation.valid, false, scenario.name);
    assert.deepEqual(validation.errors.map((error) => error.code), scenario.expectedErrors, scenario.name);
  }

  assertErrorForScenario(scenarios, "missing owner", ORGANIZATION_CONTRACT_ERRORS.OWNER_REQUIRED);
  assertErrorForScenario(scenarios, "missing display name", ORGANIZATION_CONTRACT_ERRORS.DISPLAY_NAME_REQUIRED);
  assertErrorForScenario(scenarios, "invalid handle", ORGANIZATION_CONTRACT_ERRORS.HANDLE_INVALID);
  assertErrorForScenario(scenarios, "invalid visibility", ORGANIZATION_CONTRACT_ERRORS.VISIBILITY_INVALID);
  assertErrorForScenario(scenarios, "invalid status", ORGANIZATION_CONTRACT_ERRORS.ORGANIZATION_STATUS_INVALID);
  assertErrorForScenario(scenarios, "auth session leakage", ORGANIZATION_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "runtime state leakage", ORGANIZATION_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);
  assertErrorForScenario(scenarios, "tool state leakage", ORGANIZATION_CONTRACT_ERRORS.FIELD_NOT_ALLOWED);

  const organization = buildScenario(scenarios.baseOrganization, scenarios.validOrganizations[0]);
  assert.equal(isOrganizationVisibleToActor({ actorId: "user.creator", organization }), true);
  assert.equal(isOrganizationVisibleToActor({ actorId: "public.viewer", organization }), true);
  assert.equal(canActorAccessOrganization({
    actorId: "user.creator",
    permission: IDENTITY_PERMISSIONS.VIEW,
    organization,
  }), true);
  assert.equal(canActorAccessOrganization({
    actorId: "platform.admin",
    role: IDENTITY_ROLES.ADMIN,
    permission: IDENTITY_PERMISSIONS.ADMINISTER,
    organization,
  }), true);
}

function assertErrorForScenario(scenarios, name, expectedErrorCode) {
  const scenario = scenarios.invalidOrganizations.find((item) => item.name === name);
  const organization = buildScenario(scenarios.baseOrganization, scenario);
  const validation = validateOrganizationContract(organization);
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
